import { MonitorChangeResponse, RiskAnalysis, RiskLevel, CadastralParcel } from '../types';

export function calculateEncroachmentRisk(
  changeData: MonitorChangeResponse | null,
  currentWaterPercentage: number,
  cadastralParcels: CadastralParcel[] | null
): RiskAnalysis {
  const disclaimer =
    'AI-assisted/automated risk assessment — field verification required. Technical remote sensing estimate based on Sentinel-2 optical imagery, not a statutory legal determination.';

  if (!changeData) {
    // Default baseline if no change analysis run yet
    return {
      riskScore: 20,
      riskLevel: 'LOW',
      riskFactors: [
        'Baseline water surface identified in Sentinel-2 MSI L2A pass',
        'Single-timestamp observation active — periodic monitoring recommended',
        'Run bi-temporal Change Detection to calculate differential risk score'
      ],
      detectedChangeAreaHectares: 0,
      detectedChangeAreaAcres: 0,
      detectedChangeAreaSqM: 0,
      waterLossPercentage: 0,
      isWaterLoss: false,
      confidenceScore: 65,
      dataQuality: 'Moderate',
      perimeterEncroachmentRisk: 'Baseline (Pending Bi-Temporal Observation)',
      recommendedAction: {
        primary: 'Continue periodic monitoring.',
        details: [
          'Maintain periodic Sentinel-2 L2A monitoring',
          'Inspect next satellite pass for hydrological variance',
          'Cross-check baseline water extent against cadastral FTL'
        ]
      },
      disclaimer
    };
  }

  const { before_water_percentage, after_water_percentage, change_pixels, change_status } = changeData;
  const isLoss =
    after_water_percentage < before_water_percentage ||
    change_status.toLowerCase().includes('decreas') ||
    change_status.toLowerCase().includes('loss');

  const rawDiff = Math.abs(before_water_percentage - after_water_percentage);
  const waterLossPercentage = isLoss ? parseFloat(rawDiff.toFixed(2)) : 0;

  // 1 Sentinel-2 pixel = 10m x 10m = 100 m² = 0.01 hectares = 0.02471 acres
  const detectedChangeAreaSqM = change_pixels * 100;
  const detectedChangeAreaHectares = parseFloat((change_pixels * 0.01).toFixed(2));
  const detectedChangeAreaAcres = parseFloat((detectedChangeAreaHectares * 2.47105).toFixed(2));

  let score = 15; // Base environmental sensitivity
  const factors: string[] = [];

  if (isLoss) {
    factors.push(`Water extent contraction detected: -${waterLossPercentage}% across observation window`);
    if (waterLossPercentage > 10) {
      score += 55;
      factors.push(`Rapid shoreline shrinkage: ${detectedChangeAreaHectares} Ha (~${detectedChangeAreaAcres} Acres) vacated`);
    } else if (waterLossPercentage > 4) {
      score += 40;
      factors.push(`Significant water retreat: ${detectedChangeAreaHectares} Ha (~${detectedChangeAreaAcres} Acres) along boundary buffer`);
    } else {
      score += 20;
      factors.push(`Minor water boundary fluctuation: -${waterLossPercentage}%`);
    }
  } else {
    // Water increased (seasonal recharge, monsoon inflow)
    score = 15;
    factors.push(`Water surface expansion: +${changeData.change_percentage}% (${changeData.change_status})`);
    factors.push('Positive hydrological inflow or seasonal reservoir recharge observed');
    factors.push('No surface shrinkage or reclamation detected in current pass');
  }

  // Check cadastral overlap if available
  const intersectingParcels = cadastralParcels?.filter((p) => p.isIntersectingChange) || [];
  if (intersectingParcels.length > 0) {
    score += 18;
    factors.push(
      `${intersectingParcels.length} revenue survey parcel(s) intersect detected change zone (${intersectingParcels.map((p) => p.surveyNumber).join(', ')})`
    );
  } else if (cadastralParcels && cadastralParcels.length > 0) {
    factors.push('No direct cadastral buffer intersection in monitored survey parcels');
  } else {
    factors.push('State cadastral survey layer not yet linked for this specific coordinate');
  }

  // Bound score between 5 and 95
  const riskScore = Math.min(95, Math.max(5, Math.round(score)));

  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 70) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 40) {
    riskLevel = 'MODERATE';
  }

  let perimeterEncroachmentRisk = 'Low spatial variance';
  if (riskLevel === 'HIGH') {
    perimeterEncroachmentRisk = 'High probability of edge reclamation / artificial alteration';
  } else if (riskLevel === 'MODERATE') {
    perimeterEncroachmentRisk = 'Moderate shoreline volatility — field inspection advised';
  }

  // Screening confidence heuristic calculated from measurable inputs:
  // - Verified live API vs demo/fallback data stream
  // - Valid water detection present on both acquisition dates
  // - Detectable change magnitude above 10m GSD mixed-pixel noise threshold (>= 100 pixels / 10,000 m²)
  // - Cadastral survey parcel availability for spatial cross-referencing
  let screeningConfidence = 50; // Baseline for single optical sensor screening

  if (!changeData.is_fallback) {
    screeningConfidence += 20; // Live Sentinel-2 Level-2A surface reflectance confirmed
  } else {
    screeningConfidence += 5; // Demo / fallback baseline
  }

  if (changeData.before_water_pixels > 0 && changeData.after_water_pixels > 0) {
    screeningConfidence += 10; // Multi-temporal observation confirmed on both epochs
  }

  if (changeData.change_pixels >= 100) {
    screeningConfidence += 10; // Change footprint exceeds mixed-pixel edge ambiguity threshold (>= 10,000 m²)
  } else if (changeData.change_pixels > 0) {
    screeningConfidence += 5; // Moderate pixel shift
  }

  if (cadastralParcels && cadastralParcels.length > 0) {
    screeningConfidence += 5; // Cadastral boundaries linked for spatial correlation
  }

  const confidenceScore = Math.min(95, Math.max(40, screeningConfidence));

  // Formulate recommended actions based on level
  let recommendedAction = {
    primary: 'Continue periodic monitoring.',
    details: [
      'Maintain periodic Sentinel-2 L2A monitoring',
      'Record seasonal water fluctuations in baseline registry'
    ]
  };

  if (riskLevel === 'HIGH') {
    recommendedAction = {
      primary: 'Field verification required.',
      details: [
        'Verify suspected area on ground',
        'Compare with cadastral/official boundary',
        'Capture geotagged evidence',
        'Generate investigation report'
      ]
    };
  } else if (riskLevel === 'MODERATE') {
    recommendedAction = {
      primary: 'Schedule field inspection and monitor next satellite acquisition.',
      details: [
        'Deploy field surveyor to inspect shoreline buffer within 7 days',
        'Monitor next Sentinel-2 satellite acquisition pass for persistence',
        'Verify revenue village cadastre records for permitted activities'
      ]
    };
  }

  const dataQuality: 'Good' | 'Moderate' | 'Poor' =
    changeData.before_water_percentage > 0 && changeData.after_water_percentage > 0 ? 'Good' : 'Moderate';

  return {
    riskScore,
    riskLevel,
    dataQuality,
    riskFactors: factors,
    detectedChangeAreaHectares,
    detectedChangeAreaAcres,
    detectedChangeAreaSqM,
    waterLossPercentage,
    isWaterLoss: isLoss,
    confidenceScore,
    perimeterEncroachmentRisk,
    recommendedAction,
    disclaimer
  };
}

/**
 * Derive genuine spatial risk zone polygons directly from the Sentinel-2 change masks
 */
export function deriveRiskZonesGeoJson(
  lossMask: boolean[][],
  potentialChangeMask: boolean[][],
  afterMask: boolean[][],
  transform: any
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const size = 256;
  const step = 4; // 40m spatial aggregation cell for risk zoning

  // Iterate in 40m grid cells
  for (let r = 0; r < size; r += step) {
    for (let c = 0; c < size; c += step) {
      let lossPixels = 0;
      let potentialPixels = 0;
      let waterPixels = 0;
      const cellTotal = step * step;

      for (let dr = 0; dr < step; dr++) {
        for (let dc = 0; dc < step; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < size && nc < size) {
            if (lossMask[nr][nc]) lossPixels++;
            if (potentialChangeMask[nr][nc]) potentialPixels++;
            if (afterMask[nr][nc]) waterPixels++;
          }
        }
      }

      // Determine risk tier for this geographic block
      let zoneLevel: RiskLevel | null = null;
      let zoneDescription = '';

      if (lossPixels > 2) {
        zoneLevel = 'HIGH';
        zoneDescription = 'Active Encroachment / Water Loss detected between Sentinel-2 passes';
      } else if (potentialPixels > 3 || (lossPixels > 0 && waterPixels > 0)) {
        zoneLevel = 'MODERATE';
        zoneDescription = 'FTL Shoreline Transition Buffer & Inundation Volatility Zone';
      } else if (waterPixels > 6) {
        zoneLevel = 'LOW';
        zoneDescription = 'Stable Hydrological Water Basin (Inundated in both satellite passes)';
      }

      if (zoneLevel) {
        const pNW = [
          parseFloat((transform.bounds.west + c * transform.pixelWidthDeg).toFixed(6)),
          parseFloat((transform.bounds.north - r * transform.pixelHeightDeg).toFixed(6))
        ];
        const pNE = [
          parseFloat((transform.bounds.west + (c + step) * transform.pixelWidthDeg).toFixed(6)),
          parseFloat((transform.bounds.north - r * transform.pixelHeightDeg).toFixed(6))
        ];
        const pSE = [
          parseFloat((transform.bounds.west + (c + step) * transform.pixelWidthDeg).toFixed(6)),
          parseFloat((transform.bounds.north - (r + step) * transform.pixelHeightDeg).toFixed(6))
        ];
        const pSW = [
          parseFloat((transform.bounds.west + c * transform.pixelWidthDeg).toFixed(6)),
          parseFloat((transform.bounds.north - (r + step) * transform.pixelHeightDeg).toFixed(6))
        ];

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[pNW, pNE, pSE, pSW, pNW]]
          },
          properties: {
            riskLevel: zoneLevel,
            description: zoneDescription,
            lossPixelsInCell: lossPixels,
            waterPixelsInCell: waterPixels,
            areaMetersSq: cellTotal * 100
          }
        });
      }
    }
  }

  return {
    type: 'FeatureCollection',
    features
  };
}
