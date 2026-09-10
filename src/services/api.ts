import { ApiHealthResponse, MonitorRealResponse, MonitorChangeResponse } from '../types';

export const API_BASE_URL = 'https://lake-encroachment-api.onrender.com';

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<{ isHealthy: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { isHealthy: false, message: `Backend returned status ${response.status}` };
    }

    const data = (await response.json()) as ApiHealthResponse;
    if (data.status === 'healthy') {
      return { isHealthy: true, message: 'Backend active (FastAPI on Render)' };
    }
    return { isHealthy: true, message: `Backend active: ${data.status}` };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { isHealthy: false, message: 'Backend timeout (Render free instance waking up)' };
    }
    return { isHealthy: false, message: 'Backend unreachable or starting up' };
  }
}

/**
 * Fetch real Sentinel-2 NDWI analysis for ANY lake coordinates
 */
export async function fetchMonitorReal(
  lakeName: string,
  latitude: number,
  longitude: number
): Promise<MonitorRealResponse> {
  const url = `${API_BASE_URL}/monitor-real?lake_name=${encodeURIComponent(
    lakeName.trim()
  )}&latitude=${latitude}&longitude=${longitude}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        is_fallback: false,
        data_source: 'Live Sentinel-2 API'
      } as MonitorRealResponse;
    }
  } catch (e) {
    console.warn('Live API call slow or timed out, generating fallback demo response:', e);
  }

  // Consistent fallback based on coordinates
  const isDurgam = Math.abs(latitude - 17.4326) < 0.02 && Math.abs(longitude - 78.4071) < 0.02;
  const isHussain = Math.abs(latitude - 17.4239) < 0.02 && Math.abs(longitude - 78.4738) < 0.02;

  let waterPixels = 12357;
  let pct = 18.86;
  if (isDurgam) {
    waterPixels = 12357;
    pct = 18.86;
  } else if (isHussain) {
    waterPixels = 10715;
    pct = 16.35;
  } else {
    // Generate deterministic pixel count for demo/fallback
    const seed = Math.abs(Math.sin(latitude * 100 + longitude * 100));
    waterPixels = Math.round(8000 + seed * 9000);
    pct = parseFloat(((waterPixels / 65536) * 100).toFixed(2));
  }

  return {
    status: 'fallback',
    lake_name: lakeName,
    latitude,
    longitude,
    satellite: 'Demo / fallback data — backend unavailable',
    image_date: 'Demo Baseline',
    detected_water_percentage: pct,
    water_pixels: waterPixels,
    total_pixels: 65536,
    method: 'Demo / fallback data — backend unavailable (Simulated NDWI)',
    is_fallback: true,
    data_source: 'Demo / fallback data — backend unavailable'
  };
}

/**
 * Fetch Sentinel-2 NDWI bi-temporal change detection for ANY lake coordinates
 */
export async function fetchMonitorChange(
  lakeName: string,
  latitude: number,
  longitude: number
): Promise<MonitorChangeResponse> {
  const url = `${API_BASE_URL}/monitor-change?lake_name=${encodeURIComponent(
    lakeName.trim()
  )}&latitude=${latitude}&longitude=${longitude}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // Enforce data consistency: Ensure status agrees with before vs after
      if (data.after_water_percentage < data.before_water_percentage) {
        data.change_status = `Water loss detected (-${Math.abs(data.change_percentage)}%)`;
      } else {
        data.change_status = `Water increased (+${Math.abs(data.change_percentage)}%)`;
      }
      return {
        ...data,
        is_fallback: false,
        data_source: 'Live Sentinel-2 API'
      } as MonitorChangeResponse;
    }
  } catch (e) {
    console.warn('Live API call slow or timed out, generating fallback demo response:', e);
  }

  // Consistent fallback bi-temporal analysis
  const isDurgam = Math.abs(latitude - 17.4326) < 0.02 && Math.abs(longitude - 78.4071) < 0.02;
  const isHussain = Math.abs(latitude - 17.4239) < 0.02 && Math.abs(longitude - 78.4738) < 0.02;

  if (isDurgam) {
    return {
      status: 'fallback',
      lake_name: lakeName,
      latitude,
      longitude,
      satellite: 'Demo / fallback data — backend unavailable',
      before_date: 'Demo Baseline (T1)',
      after_date: 'Demo Observation (T2)',
      before_water_percentage: 24.50,
      after_water_percentage: 18.86,
      change_percentage: 5.64,
      change_status: 'Water loss detected (-5.64%) [Demo / fallback data — backend unavailable]',
      before_water_pixels: 16056,
      after_water_pixels: 12357,
      change_pixels: 3699,
      total_pixels: 65536,
      method: 'Demo / fallback data — backend unavailable (Simulated NDWI Vector)',
      is_fallback: true,
      data_source: 'Demo / fallback data — backend unavailable'
    };
  }

  if (isHussain) {
    return {
      status: 'fallback',
      lake_name: lakeName,
      latitude,
      longitude,
      satellite: 'Demo / fallback data — backend unavailable',
      before_date: 'Demo Baseline (T1)',
      after_date: 'Demo Observation (T2)',
      before_water_percentage: 14.20,
      after_water_percentage: 16.35,
      change_percentage: 2.15,
      change_status: 'Water increased (+2.15%) [Demo / fallback data — backend unavailable]',
      before_water_pixels: 9306,
      after_water_pixels: 10715,
      change_pixels: 1409,
      total_pixels: 65536,
      method: 'Demo / fallback data — backend unavailable (Simulated NDWI Vector)',
      is_fallback: true,
      data_source: 'Demo / fallback data — backend unavailable'
    };
  }

  // General lake: create coherent numbers
  const seed = Math.abs(Math.sin(latitude * 50 + longitude * 50));
  const isLoss = seed > 0.45; // Deterministic based on coordinates
  const currentWater = Math.round(8000 + seed * 7000);
  const diff = Math.round(1200 + seed * 1800);
  const beforeWater = isLoss ? currentWater + diff : Math.max(1000, currentWater - diff);

  const beforePct = parseFloat(((beforeWater / 65536) * 100).toFixed(2));
  const afterPct = parseFloat(((currentWater / 65536) * 100).toFixed(2));
  const changePct = parseFloat(Math.abs(afterPct - beforePct).toFixed(2));
  const changePixels = Math.abs(currentWater - beforeWater);

  return {
    status: 'fallback',
    lake_name: lakeName,
    latitude,
    longitude,
    satellite: 'Demo / fallback data — backend unavailable',
    before_date: 'Demo Baseline (T1)',
    after_date: 'Demo Observation (T2)',
    before_water_percentage: beforePct,
    after_water_percentage: afterPct,
    change_percentage: changePct,
    change_status: isLoss
      ? `Water loss detected (-${changePct}%) [Demo / fallback data — backend unavailable]`
      : `Water increased (+${changePct}%) [Demo / fallback data — backend unavailable]`,
    before_water_pixels: beforeWater,
    after_water_pixels: currentWater,
    change_pixels: changePixels,
    total_pixels: 65536,
    method: 'Demo / fallback data — backend unavailable (Simulated NDWI Vector)',
    is_fallback: true,
    data_source: 'Demo / fallback data — backend unavailable'
  };
}
