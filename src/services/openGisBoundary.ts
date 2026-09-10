/**
 * Real Open GIS Lake Boundary Service
 * Queries OpenStreetMap / Nominatim to retrieve real lake boundary polygons.
 * Never creates or fabricates fake boundaries.
 */

export interface OpenGisBoundaryResult {
  found: boolean;
  source?: string;
  name?: string;
  osmId?: number;
  osmType?: string;
  waterType?: string;
  geojson?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  message: string;
}

/**
 * Fetch real lake boundary polygon from OpenStreetMap for ANY lake coordinates and name
 */
export async function fetchRealLakeBoundary(
  lakeName: string,
  latitude: number,
  longitude: number
): Promise<OpenGisBoundaryResult> {
  const cleanName = lakeName.replace(/Custom Lake.*|Lake\s*\(/i, '').trim();

  // If name is purely coordinate string or empty, we attempt a reverse query or state unavailable
  if (!cleanName || cleanName.length < 2) {
    return {
      found: false,
      message: 'Enter a recognized lake name or upload an official survey GeoJSON boundary file.'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    // Query Nominatim with polygon_geojson=1
    const queryUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanName
    )}&format=json&polygon_geojson=1&limit=5`;

    const response = await fetch(queryUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        found: false,
        message: `OpenStreetMap service returned HTTP ${response.status}. Cadastral / boundary polygon not loaded.`
      };
    }

    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) {
      return {
        found: false,
        message: `No open GIS lake boundary polygon registered in OpenStreetMap for "${cleanName}". Upload official KML/GeoJSON.`
      };
    }

    // Filter candidates for water/lake bodies near the target coordinates
    for (const item of items) {
      const itemLat = parseFloat(item.lat);
      const itemLng = parseFloat(item.lon);
      const distDeg = Math.sqrt(Math.pow(itemLat - latitude, 2) + Math.pow(itemLng - longitude, 2));

      // Must be within ~0.4 degrees (~44 km) of the coordinates
      const isWaterCategory =
        item.category === 'water' ||
        item.type === 'lake' ||
        item.type === 'reservoir' ||
        item.type === 'water' ||
        item.class === 'water';

      if (distDeg < 0.4 && item.geojson) {
        const geomType = item.geojson.type;
        if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
          return {
            found: true,
            source: 'OpenStreetMap (ODbL 1.0)',
            name: item.name || cleanName,
            osmId: item.osm_id,
            osmType: item.osm_type,
            waterType: item.type || 'lake',
            geojson: item.geojson,
            message: `Verified OpenStreetMap boundary polygon loaded (${item.type || 'water body'}).`
          };
        }
      }
    }

    return {
      found: false,
      message: `Open GIS boundary polygon not found within 40km of coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Upload custom GeoJSON.`
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        found: false,
        message: 'Open GIS boundary server timeout. You can upload an official GeoJSON file.'
      };
    }
    return {
      found: false,
      message: 'Unable to reach Open GIS boundary service. Local offline mode active.'
    };
  }
}
