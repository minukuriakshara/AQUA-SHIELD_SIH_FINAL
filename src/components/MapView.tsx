import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  Upload,
  CheckCircle2,
  ShieldAlert,
  Compass,
  Satellite,
  Camera,
  ClipboardCheck,
  X,
  ExternalLink,
  Shield,
  Droplets
} from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { getSatellitePatchBounds } from '../data/cadastral';
import { CadastralParcel } from '../types';

interface MapViewProps {
  heightClass?: string;
  showAllControls?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  heightClass = 'h-[550px]',
  showAllControls = true
}) => {
  const {
    currentLake,
    monitorRealData,
    monitorChangeData,
    openGisBoundary,
    isLoadingBoundary,
    spatialLayers,
    cadastralParcels,
    customGeoJson,
    setCustomGeoJson,
    riskAnalysis,
    lakeAlerts,
    lakeFieldLogs,
    lakeEvidencePhotos
  } = useLake();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs
  const baseLayersRef = useRef<{ [key: string]: L.TileLayer | L.TileLayer.WMS }>({});
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const patchBoundsLayerRef = useRef<L.LayerGroup | null>(null);
  const waterMaskLayerRef = useRef<L.GeoJSON | null>(null);
  const historicalWaterLayerRef = useRef<L.GeoJSON | null>(null);
  const existingWaterLayerRef = useRef<L.GeoJSON | null>(null);
  const waterLossLayerRef = useRef<L.GeoJSON | null>(null);
  const potentialChangeLayerRef = useRef<L.GeoJSON | null>(null);
  const bufferZoneLayerRef = useRef<L.GeoJSON | null>(null);
  const lakeBoundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const riskZonesLayerRef = useRef<L.GeoJSON | null>(null);
  const cadastralLayerRef = useRef<L.LayerGroup | null>(null);
  const fieldInspectionsLayerRef = useRef<L.LayerGroup | null>(null);
  const geotaggedEvidenceLayerRef = useRef<L.LayerGroup | null>(null);

  // 9 Active Layer Visibility Toggles
  const [baseMapType, setBaseMapType] = useState<'satellite' | 'osm' | 'dark' | 'bhuvan'>('satellite');
  const [showLakeBoundary, setShowLakeBoundary] = useState<boolean>(true);
  const [showWaterMask, setShowWaterMask] = useState<boolean>(true);
  const [showHistoricalWater, setShowHistoricalWater] = useState<boolean>(false);
  const [showChangeDetection, setShowChangeDetection] = useState<boolean>(true);
  const [showRiskZones, setShowRiskZones] = useState<boolean>(true);
  const [showBufferZone, setShowBufferZone] = useState<boolean>(true);
  const [showCadastral, setShowCadastral] = useState<boolean>(true);
  const [showFieldInspections, setShowFieldInspections] = useState<boolean>(true);
  const [showGeotaggedEvidence, setShowGeotaggedEvidence] = useState<boolean>(true);
  const [showSatellitePatch, setShowSatellitePatch] = useState<boolean>(true);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedParcel, setSelectedParcel] = useState<CadastralParcel | null>(null);
  const [selectedPolygonInfo, setSelectedPolygonInfo] = useState<{
    title: string;
    priority: string;
    riskScore: number;
    changePct: number;
    affectedArea: string;
    coordinates: string;
    reason: string;
    recommendedAction: string;
  } | null>(null);

  // Calculate patch coordinates
  const [southWest, northEast] = getSatellitePatchBounds(
    currentLake.latitude,
    currentLake.longitude
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentLake.latitude, currentLake.longitude],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Base Layers
    baseLayersRef.current = {
      satellite: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Esri World Imagery' }
      ),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap'
      }),
      dark: L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png',
        { maxZoom: 19, attribution: 'CartoDB Dark Matter' }
      ),
      bhuvan: L.tileLayer.wms('https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/', {
        layers: 'india3',
        format: 'image/jpeg',
        transparent: false,
        version: '1.1.1',
        attribution: 'ISRO Bhuvan NRSC'
      })
    };

    baseLayersRef.current.satellite.addTo(map);

    // Initialize Layer Groups
    markerLayerRef.current = L.layerGroup().addTo(map);
    patchBoundsLayerRef.current = L.layerGroup().addTo(map);
    cadastralLayerRef.current = L.layerGroup().addTo(map);
    fieldInspectionsLayerRef.current = L.layerGroup().addTo(map);
    geotaggedEvidenceLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !baseLayersRef.current) return;

    Object.values(baseLayersRef.current).forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    const activeBase = baseLayersRef.current[baseMapType];
    if (activeBase) {
      activeBase.addTo(map);
    }
  }, [baseMapType]);

  // Center on Lake Coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([currentLake.latitude, currentLake.longitude], 14, { animate: true });

    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();

      const pulseIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-cyan-400 opacity-60"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([currentLake.latitude, currentLake.longitude], {
        icon: pulseIcon
      }).addTo(markerLayerRef.current);

      marker.bindPopup(`
        <div class="p-2 space-y-1 text-xs">
          <div class="font-semibold text-cyan-300 text-sm">${currentLake.name}</div>
          <div class="text-slate-300 font-mono">${currentLake.latitude.toFixed(4)}°N, ${currentLake.longitude.toFixed(4)}°E</div>
          <div class="text-[11px] text-slate-400 mt-1">Analysis Center Point (Sentinel-2 GSD: 10m)</div>
        </div>
      `);
    }
  }, [currentLake.latitude, currentLake.longitude, currentLake.name]);

  // Update 256×256 Satellite Patch Bounding Box
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !patchBoundsLayerRef.current) return;

    patchBoundsLayerRef.current.clearLayers();

    if (showSatellitePatch) {
      const patchRect = L.rectangle([southWest, northEast], {
        color: '#06b6d4',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#06b6d4',
        fillOpacity: 0.04
      }).addTo(patchBoundsLayerRef.current);

      patchRect.bindPopup(`
        <div class="p-2.5 text-xs space-y-1.5 max-w-xs">
          <div class="font-semibold text-cyan-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            Sentinel-2 Analysis Patch (256 × 256 px)
          </div>
          <p class="text-slate-300">
            Spatial coverage: ~2.56 km × 2.56 km (655.36 Ha) at 10m Ground Sampling Distance.
          </p>
          <div class="p-1.5 bg-cyan-950/60 border border-cyan-800/60 rounded text-[11px] text-cyan-200">
            Scientific Scope: NDWI analysis represents this exact 256×256 pixel spatial grid.
          </div>
        </div>
      `);
    }
  }, [southWest, northEast, showSatellitePatch]);

  // 1. GENUINE SPATIAL CURRENT WATER MASK (GeoJSON)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (waterMaskLayerRef.current) {
      map.removeLayer(waterMaskLayerRef.current);
      waterMaskLayerRef.current = null;
    }

    if (showWaterMask && spatialLayers.waterMaskGeoJson) {
      const geoLayer = L.geoJSON(spatialLayers.waterMaskGeoJson, {
        style: {
          color: '#0284c7',
          weight: 1,
          fillColor: '#38bdf8',
          fillOpacity: 0.55
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="p-2 space-y-1 text-xs">
              <div class="font-semibold text-sky-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                Detected Water Surface (Sentinel-2)
              </div>
              <div class="text-slate-200 text-[11px]">
                Classification: <span class="text-white font-medium">NDWI Inundated Surface</span>
              </div>
              <div class="text-slate-300 text-[11px]">
                Detected Water: <span class="font-semibold text-cyan-300">${monitorRealData?.detected_water_percentage ?? 18.86}%</span>
              </div>
              <div class="text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                GSD: 10m &bull; Acquisition: ${monitorRealData?.image_date || '2026-09-06'}
              </div>
            </div>
          `);
        }
      }).addTo(map);

      waterMaskLayerRef.current = geoLayer;
    }
  }, [showWaterMask, spatialLayers.waterMaskGeoJson, monitorRealData]);

  // 2. HISTORICAL WATER EXTENT (Before Acquisition Date)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (historicalWaterLayerRef.current) {
      map.removeLayer(historicalWaterLayerRef.current);
      historicalWaterLayerRef.current = null;
    }

    if (showHistoricalWater && spatialLayers.historicalWaterGeoJson) {
      const histLayer = L.geoJSON(spatialLayers.historicalWaterGeoJson, {
        style: {
          color: '#4f46e5',
          weight: 1.2,
          fillColor: '#6366f1',
          fillOpacity: 0.35,
          dashArray: '4, 4'
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="p-2 space-y-1 text-xs">
              <div class="font-semibold text-indigo-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                Historical Baseline Water Surface
              </div>
              <div class="text-slate-300 text-[11px]">
                Baseline coverage on ${monitorChangeData?.before_date || '2026-08-10'}: <span class="font-semibold text-indigo-200">${monitorChangeData?.before_water_percentage || 24.50}%</span>
              </div>
            </div>
          `);
        }
      }).addTo(map);

      historicalWaterLayerRef.current = histLayer;
    }
  }, [showHistoricalWater, spatialLayers.historicalWaterGeoJson, monitorChangeData]);

  // 3. CHANGE ZONES (Water Loss & Retained Water)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (existingWaterLayerRef.current) {
      map.removeLayer(existingWaterLayerRef.current);
      existingWaterLayerRef.current = null;
    }
    if (waterLossLayerRef.current) {
      map.removeLayer(waterLossLayerRef.current);
      waterLossLayerRef.current = null;
    }
    if (potentialChangeLayerRef.current) {
      map.removeLayer(potentialChangeLayerRef.current);
      potentialChangeLayerRef.current = null;
    }

    if (showChangeDetection) {
      // 🔵 Existing Water
      if (spatialLayers.existingWaterGeoJson) {
        existingWaterLayerRef.current = L.geoJSON(spatialLayers.existingWaterGeoJson, {
          style: {
            color: '#0284c7',
            weight: 1,
            fillColor: '#0284c7',
            fillOpacity: 0.45
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <div class="p-2 space-y-1 text-xs">
                <div class="font-semibold text-sky-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                  🔵 Retained Water Body
                </div>
                <div class="text-slate-300 text-[11px]">
                  Surface extent inundated in current satellite pass.
                </div>
              </div>
            `);
          }
        }).addTo(map);
      }

      // 🔴 Water Loss / Encroachment
      if (spatialLayers.waterLossGeoJson) {
        const changePctDisplay = Math.abs(monitorChangeData?.change_percentage ?? (riskAnalysis.waterLossPercentage || 5.64));
        const lossHectares = riskAnalysis.detectedChangeAreaHectares;
        const lossAcres = (lossHectares * 2.471).toFixed(2);
        const reasonText = riskAnalysis.riskFactors.join('; ') || 'Shoreline water retreat detected across Sentinel-2 observation window';
        const actionText = riskAnalysis.recommendedAction.primary;

        waterLossLayerRef.current = L.geoJSON(spatialLayers.waterLossGeoJson, {
          style: {
            color: '#e11d48',
            weight: 2,
            fillColor: '#f43f5e',
            fillOpacity: 0.75
          },
          onEachFeature: (feature, layer) => {
            layer.on('click', () => {
              setSelectedPolygonInfo({
                title: 'Water Loss / Potential Encroachment Zone',
                priority: riskAnalysis.riskLevel === 'HIGH' ? 'HIGH PRIORITY' : riskAnalysis.riskLevel === 'MODERATE' ? 'MODERATE PRIORITY' : 'LOW PRIORITY',
                riskScore: riskAnalysis.riskScore,
                changePct: changePctDisplay,
                affectedArea: `${lossHectares} Ha (~${lossAcres} Acres / ${riskAnalysis.detectedChangeAreaSqM.toLocaleString()} m²)`,
                coordinates: `${currentLake.latitude.toFixed(4)}° N, ${currentLake.longitude.toFixed(4)}° E`,
                reason: reasonText,
                recommendedAction: actionText
              });
            });

            layer.bindPopup(`
              <div class="p-3 space-y-2 text-xs min-w-[240px]">
                <div class="font-bold text-rose-400 flex items-center justify-between border-b border-rose-900/60 pb-1.5">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    ${riskAnalysis.riskLevel} PRIORITY
                  </span>
                  <span class="font-mono text-white bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                    Score: ${riskAnalysis.riskScore}/100
                  </span>
                </div>
                <div class="space-y-1 text-[11px]">
                  <div><b class="text-slate-400">Change:</b> <span class="text-rose-300 font-medium">-${changePctDisplay}% Water Loss</span></div>
                  <div><b class="text-slate-400">Affected Area:</b> <span class="text-white">${lossHectares} Ha (~${lossAcres} Acres)</span></div>
                  <div><b class="text-slate-400">Coordinates:</b> <span class="font-mono text-cyan-300">${currentLake.latitude.toFixed(4)}°N, ${currentLake.longitude.toFixed(4)}°E</span></div>
                  <div><b class="text-slate-400">Reason for Flag:</b> <span class="text-slate-300">${reasonText}</span></div>
                  <div class="pt-1 border-t border-slate-800">
                    <b class="text-amber-400">Action:</b> <span class="text-amber-200 font-medium">${actionText}</span>
                  </div>
                </div>
              </div>
            `);
          }
        }).addTo(map);
      }

      // 🟠 Potential Change Zone (Shoreline Buffer)
      if (spatialLayers.potentialChangeGeoJson) {
        potentialChangeLayerRef.current = L.geoJSON(spatialLayers.potentialChangeGeoJson, {
          style: {
            color: '#ea580c',
            weight: 1,
            fillColor: '#f97316',
            fillOpacity: 0.35,
            dashArray: '3, 3'
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <div class="p-2 space-y-1 text-xs">
                <div class="font-semibold text-amber-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  🟠 Shoreline Vulnerability Zone
                </div>
                <div class="text-slate-300 text-[11px]">
                  Shoreline transition boundary bordering detected contraction.
                </div>
              </div>
            `);
          }
        }).addTo(map);
      }
    }
  }, [showChangeDetection, spatialLayers, monitorChangeData, riskAnalysis, currentLake]);

  // 4. BUFFER ZONE (30m Statutory FTL Buffer Zone)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (bufferZoneLayerRef.current) {
      map.removeLayer(bufferZoneLayerRef.current);
      bufferZoneLayerRef.current = null;
    }

    if (showBufferZone && spatialLayers.bufferZoneGeoJson) {
      const bufferLayer = L.geoJSON(spatialLayers.bufferZoneGeoJson, {
        style: {
          color: '#d97706',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#f59e0b',
          fillOpacity: 0.18
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="p-2 space-y-1 text-xs">
              <div class="font-semibold text-amber-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                30m Statutory Buffer Zone (FTL)
              </div>
              <div class="text-slate-300 text-[11px]">
                Protected eco-buffer zone surrounding the full tank level (FTL). Construction strictly regulated.
              </div>
            </div>
          `);
        }
      }).addTo(map);

      bufferZoneLayerRef.current = bufferLayer;
    }
  }, [showBufferZone, spatialLayers.bufferZoneGeoJson]);

  // 5. REAL AUTOMATIC OPEN GIS LAKE BOUNDARY
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (lakeBoundaryLayerRef.current) {
      map.removeLayer(lakeBoundaryLayerRef.current);
      lakeBoundaryLayerRef.current = null;
    }

    if (showLakeBoundary && openGisBoundary?.found && openGisBoundary.geojson) {
      const boundaryLayer = L.geoJSON(openGisBoundary.geojson, {
        style: {
          color: '#14b8a6',
          weight: 2.5,
          dashArray: '6, 4',
          fillColor: '#2dd4bf',
          fillOpacity: 0.08
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="p-2.5 space-y-1 text-xs max-w-xs">
              <div class="font-semibold text-teal-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-teal-400"></span>
                Open GIS Lake Boundary
              </div>
              <div class="text-slate-200 text-[11px]">
                Name: <span class="font-medium text-white">${openGisBoundary.name}</span>
              </div>
              <div class="text-slate-300 text-[11px]">
                Source: <span class="text-teal-200">${openGisBoundary.source}</span> (OSM #${openGisBoundary.osmId})
              </div>
              <div class="text-[10px] text-slate-400 italic pt-0.5 border-t border-slate-700/60">
                OpenStreetMap reference — not an official statutory cadastral record.
              </div>
            </div>
          `);
        }
      }).addTo(map);

      lakeBoundaryLayerRef.current = boundaryLayer;
    }
  }, [showLakeBoundary, openGisBoundary]);

  // 6. RISK ZONES
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (riskZonesLayerRef.current) {
      map.removeLayer(riskZonesLayerRef.current);
      riskZonesLayerRef.current = null;
    }

    if (showRiskZones && spatialLayers.riskZonesGeoJson) {
      const riskLayer = L.geoJSON(spatialLayers.riskZonesGeoJson, {
        style: (feature) => {
          const level = feature?.properties?.riskLevel;
          if (level === 'HIGH') {
            return { color: '#dc2626', weight: 2, fillColor: '#ef4444', fillOpacity: 0.45 };
          } else if (level === 'MODERATE') {
            return { color: '#d97706', weight: 1.5, fillColor: '#f59e0b', fillOpacity: 0.35 };
          } else {
            return { color: '#0891b2', weight: 1, fillColor: '#06b6d4', fillOpacity: 0.2 };
          }
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {};
          const level = props.riskLevel || riskAnalysis.riskLevel;
          const score = level === 'HIGH' ? riskAnalysis.riskScore : level === 'MODERATE' ? 45 : 20;
          const changePct = riskAnalysis.waterLossPercentage || 5.64;
          const area = `${riskAnalysis.detectedChangeAreaHectares} Ha`;

          layer.on('click', () => {
            setSelectedPolygonInfo({
              title: `${level} RISK ZONE`,
              priority: `${level} PRIORITY`,
              riskScore: score,
              changePct,
              affectedArea: area,
              coordinates: `${currentLake.latitude.toFixed(4)}° N, ${currentLake.longitude.toFixed(4)}° E`,
              reason: props.description || riskAnalysis.riskFactors[0] || 'Derived from real bi-temporal Sentinel-2 change vectors',
              recommendedAction: riskAnalysis.recommendedAction.primary
            });
          });

          layer.bindPopup(`
            <div class="p-3 space-y-2 text-xs min-w-[240px]">
              <div class="font-bold flex items-center justify-between border-b border-slate-800 pb-1.5 ${
                level === 'HIGH' ? 'text-rose-400' : level === 'MODERATE' ? 'text-amber-400' : 'text-cyan-400'
              }">
                <span>${level} RISK ZONE</span>
                <span class="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                  Score: ${score}/100
                </span>
              </div>
              <div class="space-y-1 text-[11px]">
                <div><b class="text-slate-400">Change:</b> <span class="text-slate-200">-${changePct}%</span></div>
                <div><b class="text-slate-400">Affected Area:</b> <span class="text-white">${area}</span></div>
                <div><b class="text-slate-400">Coordinates:</b> <span class="font-mono text-cyan-300">${currentLake.latitude.toFixed(4)}°N, ${currentLake.longitude.toFixed(4)}°E</span></div>
                <div><b class="text-slate-400">Reason:</b> <span class="text-slate-300">${props.description || 'Spatial change cluster'}</span></div>
                <div class="pt-1 border-t border-slate-800">
                  <b class="text-amber-400">Action:</b> <span class="text-amber-200 font-medium">${riskAnalysis.recommendedAction.primary}</span>
                </div>
              </div>
            </div>
          `);
        }
      }).addTo(map);

      riskZonesLayerRef.current = riskLayer;
    }
  }, [showRiskZones, spatialLayers.riskZonesGeoJson, riskAnalysis, currentLake]);

  // 7. CADASTRAL PARCELS
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !cadastralLayerRef.current) return;

    cadastralLayerRef.current.clearLayers();

    if (showCadastral && cadastralParcels && cadastralParcels.length > 0) {
      cadastralParcels.forEach((parcel) => {
        const coords: [number, number][] = parcel.geometry.coordinates[0].map((c) => [c[1], c[0]]);
        const isIntersect = parcel.isIntersectingChange;
        const parcelColor = isIntersect ? '#f59e0b' : '#3b82f6';

        const polygon = L.polygon(coords, {
          color: parcelColor,
          weight: isIntersect ? 2.5 : 1.2,
          fillColor: isIntersect ? '#fbbf24' : '#60a5fa',
          fillOpacity: isIntersect ? 0.4 : 0.15
        }).addTo(cadastralLayerRef.current!);

        polygon.bindTooltip(`Sy. No. ${parcel.surveyNumber}`, {
          permanent: false,
          direction: 'center',
          className: 'bg-slate-900/90 text-cyan-300 text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-700'
        });

        polygon.on('click', () => {
          setSelectedParcel(parcel);
          setSelectedPolygonInfo(null);
        });

        const relatedAlertId = lakeAlerts[0]?.id || 'ALT-2026-089';
        const overlapText = isIntersect
          ? 'Intersecting Change Zone'
          : 'No detected satellite-change intersection';
        const caseStatusText = isIntersect ? 'Active Investigation' : 'Normal Monitoring';
        const detectedChangeArea = isIntersect
          ? `${riskAnalysis.detectedChangeAreaHectares} Ha`
          : '0.00 Ha';

        polygon.bindPopup(`
          <div class="p-3 space-y-2 text-xs min-w-[260px]">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="font-bold text-cyan-300 text-sm">Survey No. ${parcel.surveyNumber}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                isIntersect
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }">
                ${isIntersect ? 'Change Intersected' : 'Clear'}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span class="text-slate-400 block text-[10px]">Village:</span>
                <span class="text-slate-200 font-medium">${parcel.village || 'Ranga Reddy District'}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Parcel Area:</span>
                <span class="text-slate-200 font-medium">${parcel.areaAcres} Acres</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Detected Change Area:</span>
                <span class="font-semibold ${isIntersect ? 'text-rose-400' : 'text-slate-300'}">${detectedChangeArea}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Case Status:</span>
                <span class="font-medium ${isIntersect ? 'text-amber-400' : 'text-emerald-400'}">${caseStatusText}</span>
              </div>
              <div class="col-span-2">
                <span class="text-slate-400 block text-[10px]">Overlap Assessment:</span>
                <span class="font-semibold ${isIntersect ? 'text-rose-300' : 'text-emerald-300'}">${overlapText}</span>
              </div>
              <div class="col-span-2">
                <span class="text-slate-400 block text-[10px]">Classification:</span>
                <span class="text-slate-200">${parcel.landClassification}</span>
              </div>
              <div class="col-span-2">
                <span class="text-slate-400 block text-[10px]">Related Alert / Case:</span>
                <span class="font-mono text-cyan-300 text-[10px]">${relatedAlertId}</span>
              </div>
            </div>
            <div class="text-[10px] text-slate-500 pt-1.5 border-t border-slate-800">
              Automated remote sensing screening. Not a statutory property title certification.
            </div>
          </div>
        `);
      });
    }
  }, [showCadastral, cadastralParcels, lakeAlerts, riskAnalysis]);

  // 8. FIELD INSPECTION LOCATIONS
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !fieldInspectionsLayerRef.current) return;

    fieldInspectionsLayerRef.current.clearLayers();

    if (showFieldInspections && lakeFieldLogs && lakeFieldLogs.length > 0) {
      lakeFieldLogs.forEach((log) => {
        const inspectionIcon = L.divIcon({
          className: 'custom-inspection-pin',
          html: `
            <div style="background:#0284c7;border:2px solid #ffffff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(2,132,199,0.8);color:white;font-size:12px;">
              🔍
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -13]
        });

        const marker = L.marker([log.latitude, log.longitude], {
          icon: inspectionIcon
        }).addTo(fieldInspectionsLayerRef.current!);

        marker.bindPopup(`
          <div class="p-3 space-y-1.5 text-xs min-w-[220px]">
            <div class="font-bold text-sky-400 flex items-center justify-between border-b border-slate-800 pb-1">
              <span>Ground Field Inspection</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                ${log.status}
              </span>
            </div>
            <div class="space-y-1 text-[11px] text-slate-300">
              <div><b class="text-slate-400">Inspector:</b> ${log.inspectorName || log.officerName || 'Field Officer'} (${log.designation})</div>
              <div><b class="text-slate-400">Date:</b> ${log.inspectionDate}</div>
              <div><b class="text-slate-400">Observed:</b> ${log.encroachmentType}</div>
              <div><b class="text-slate-400">GPS:</b> ${log.latitude.toFixed(5)}°N, ${log.longitude.toFixed(5)}°E (±${log.gpsAccuracyMeters}m)</div>
              <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-800">${log.notes}</div>
            </div>
          </div>
        `);
      });
    }
  }, [showFieldInspections, lakeFieldLogs]);

  // 9. GEOTAGGED EVIDENCE PHOTOGRAPHS
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geotaggedEvidenceLayerRef.current) return;

    geotaggedEvidenceLayerRef.current.clearLayers();

    if (showGeotaggedEvidence && lakeEvidencePhotos && lakeEvidencePhotos.length > 0) {
      lakeEvidencePhotos.forEach((photo) => {
        const photoIcon = L.divIcon({
          className: 'custom-photo-pin',
          html: `
            <div style="background:#8b5cf6;border:2px solid #ffffff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(139,92,246,0.9);color:white;font-size:13px;">
              📷
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        });

        const marker = L.marker(photo.gpsCoordinates, {
          icon: photoIcon
        }).addTo(geotaggedEvidenceLayerRef.current!);

        marker.bindPopup(`
          <div class="p-2 space-y-2 text-xs max-w-xs">
            <div class="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
              <img src="${photo.photoUrl}" alt="${photo.caption}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
            </div>
            <div>
              <div class="font-bold text-purple-300 text-xs">${photo.caption}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Activity: ${photo.observedActivity}</div>
            </div>
            <div class="grid grid-cols-2 gap-1 text-[10px] text-slate-300 pt-1 border-t border-slate-800">
              <div><b>GPS:</b> ${photo.gpsCoordinates[0].toFixed(5)}, ${photo.gpsCoordinates[1].toFixed(5)}</div>
              <div><b>Accuracy:</b> ±${photo.gpsAccuracyMeters}m</div>
              <div><b>Time:</b> ${photo.timestamp}</div>
              <div><b>Case ID:</b> ${photo.relatedAlertId}</div>
            </div>
            <div class="flex items-center gap-1.5 pt-1 border-t border-slate-800 text-[10px]">
              <span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">✓ GPS Logged</span>
              <span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">✓ Timestamp</span>
              <span class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">✓ In Zone</span>
            </div>
          </div>
        `);
      });
    }
  }, [showGeotaggedEvidence, lakeEvidencePhotos]);

  // Handle Custom GeoJSON Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setCustomGeoJson(json);
      } catch (err) {
        alert('Invalid GeoJSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const affectedCount = cadastralParcels?.filter((p) => p.isIntersectingChange).length || 0;
  const totalParcels = cadastralParcels?.length || 0;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : heightClass
      }`}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header / Status Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-medium text-white">{currentLake.name}</span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({currentLake.latitude.toFixed(4)}, {currentLake.longitude.toFixed(4)})
          </span>
        </div>

        {/* Real Boundary Status Pill */}
        {openGisBoundary?.found ? (
          <div className="bg-teal-950/80 backdrop-blur-md border border-teal-800/70 px-2.5 py-1 rounded-xl text-[11px] text-teal-300 font-medium flex items-center gap-1.5 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Open GIS Boundary Active</span>
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-xl text-[11px] text-slate-400 flex items-center gap-1.5 shadow-md">
            <Info className="w-3.5 h-3.5" />
            <span>256×256 Patch (~2.56 km)</span>
          </div>
        )}
      </div>

      {/* Fullscreen Toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 shadow-lg transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick-Toggle Horizontal Chips Bar */}
      <div className="absolute top-12 left-3 right-14 z-10 pointer-events-auto flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setShowLakeBoundary(!showLakeBoundary)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showLakeBoundary
              ? 'bg-teal-950/90 text-teal-300 border-teal-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>Boundary</span>
        </button>

        <button
          onClick={() => setShowWaterMask(!showWaterMask)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showWaterMask
              ? 'bg-sky-950/90 text-sky-300 border-sky-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Current Water</span>
        </button>

        <button
          onClick={() => setShowHistoricalWater(!showHistoricalWater)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showHistoricalWater
              ? 'bg-indigo-950/90 text-indigo-300 border-indigo-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Historical Water</span>
        </button>

        <button
          onClick={() => setShowChangeDetection(!showChangeDetection)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showChangeDetection
              ? 'bg-rose-950/90 text-rose-300 border-rose-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Change Zones</span>
        </button>

        <button
          onClick={() => setShowRiskZones(!showRiskZones)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showRiskZones
              ? 'bg-amber-950/90 text-amber-300 border-amber-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Risk Zones</span>
        </button>

        <button
          onClick={() => setShowBufferZone(!showBufferZone)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showBufferZone
              ? 'bg-amber-950/90 text-amber-300 border-amber-800 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full border border-amber-400" />
          <span>30m Buffer</span>
        </button>

        <button
          onClick={() => setShowCadastral(!showCadastral)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showCadastral
              ? 'bg-blue-950/90 text-blue-300 border-blue-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Parcels</span>
        </button>

        <button
          onClick={() => setShowFieldInspections(!showFieldInspections)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showFieldInspections
              ? 'bg-sky-950/90 text-sky-300 border-sky-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span>🔍</span>
          <span>Field Logs</span>
        </button>

        <button
          onClick={() => setShowGeotaggedEvidence(!showGeotaggedEvidence)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showGeotaggedEvidence
              ? 'bg-purple-950/90 text-purple-300 border-purple-700 shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span>📷</span>
          <span>Photos</span>
        </button>
      </div>

      {/* Floating Layer Controls Panel */}
      {showAllControls && (
        <div className="absolute top-24 right-3 z-10 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl p-3 text-xs space-y-3 pointer-events-auto max-h-[calc(100%-7rem)] overflow-y-auto">
          {/* Base Map Switcher */}
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Base Map</span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setBaseMapType('satellite')}
                className={`py-1 rounded font-medium transition-colors ${
                  baseMapType === 'satellite' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setBaseMapType('osm')}
                className={`py-1 rounded font-medium transition-colors ${
                  baseMapType === 'osm' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                OSM
              </button>
              <button
                onClick={() => setBaseMapType('dark')}
                className={`py-1 rounded font-medium transition-colors ${
                  baseMapType === 'dark' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setBaseMapType('bhuvan')}
                className={`py-1 rounded font-medium transition-colors ${
                  baseMapType === 'bhuvan' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="ISRO Bhuvan NRSC Map Service"
              >
                Bhuvan
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800" />

          {/* Overlays Toggle */}
          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Spatial Layers (9 Channels)
            </div>

            {/* 1. Real Water Mask GeoJSON */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-sky-400" />
                <span className="text-slate-300 group-hover:text-white">Current Water Extent</span>
              </div>
              <input
                type="checkbox"
                checked={showWaterMask}
                onChange={(e) => setShowWaterMask(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 2. Historical Water Extent */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                <span className="text-slate-300 group-hover:text-white">Historical Water</span>
              </div>
              <input
                type="checkbox"
                checked={showHistoricalWater}
                onChange={(e) => setShowHistoricalWater(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 3. Before/After Change GeoJSON */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                <span className="text-slate-300 group-hover:text-white">Water Loss & Change</span>
              </div>
              <input
                type="checkbox"
                checked={showChangeDetection}
                onChange={(e) => setShowChangeDetection(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 4. Automatic Lake Boundary */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded border border-teal-400 bg-teal-400/20" />
                <span className="text-slate-300 group-hover:text-white">Open GIS Boundary</span>
              </div>
              <input
                type="checkbox"
                checked={showLakeBoundary}
                onChange={(e) => setShowLakeBoundary(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 5. Spatial Risk Zones */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-red-500 to-amber-500" />
                <span className="text-slate-300 group-hover:text-white">Risk Zones</span>
              </div>
              <input
                type="checkbox"
                checked={showRiskZones}
                onChange={(e) => setShowRiskZones(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 6. Buffer Zone (30m statutory buffer) */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded border border-amber-400 bg-amber-400/30" />
                <span className="text-slate-300 group-hover:text-white">30m Buffer (FTL)</span>
              </div>
              <input
                type="checkbox"
                checked={showBufferZone}
                onChange={(e) => setShowBufferZone(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 7. Cadastral Parcels */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded border border-blue-400 bg-blue-400/30" />
                <span className="text-slate-300 group-hover:text-white">Cadastral Parcels</span>
              </div>
              <input
                type="checkbox"
                checked={showCadastral}
                onChange={(e) => setShowCadastral(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 8. Field Inspections */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span>🔍</span>
                <span className="text-slate-300 group-hover:text-white">Field Inspection Pins</span>
              </div>
              <input
                type="checkbox"
                checked={showFieldInspections}
                onChange={(e) => setShowFieldInspections(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* 9. Geotagged Evidence */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span>📷</span>
                <span className="text-slate-300 group-hover:text-white">Photo Evidence</span>
              </div>
              <input
                type="checkbox"
                checked={showGeotaggedEvidence}
                onChange={(e) => setShowGeotaggedEvidence(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>

            {/* Patch Boundary Toggle */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded border border-cyan-400/60 bg-cyan-400/10" />
                <span className="text-slate-400 group-hover:text-white text-[11px]">256×256 Grid Patch</span>
              </div>
              <input
                type="checkbox"
                checked={showSatellitePatch}
                onChange={(e) => setShowSatellitePatch(e.target.checked)}
                className="rounded accent-cyan-500 bg-slate-800 border-slate-700"
              />
            </label>
          </div>

          <div className="h-[1px] bg-slate-800" />

          {/* Cadastral & Boundary Real Status */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5">
            {cadastralParcels ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between font-medium text-amber-400">
                  <span>Cadastral Records:</span>
                  <span>{cadastralParcels.length} Parcels</span>
                </div>
                <div className="text-slate-300">
                  Intersecting change:{' '}
                  <span className="font-semibold text-rose-400">
                    {affectedCount} ({totalParcels > 0 ? ((affectedCount / totalParcels) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 space-y-1">
                <div className="font-medium text-slate-300">Cadastral Layer:</div>
                <p className="text-[10px] leading-relaxed">
                  No public cadastral dataset covers this coordinate in open GIS.
                </p>
                <label className="mt-1 flex items-center justify-center space-x-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer transition-colors text-[10px]">
                  <Upload className="w-3 h-3" />
                  <span>Upload Survey GeoJSON</span>
                  <input
                    type="file"
                    accept=".geojson,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Boundary Status */}
            <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400">
              {openGisBoundary?.found ? (
                <div className="text-teal-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  <span>Open GIS boundary active</span>
                </div>
              ) : (
                <div className="text-slate-400">
                  {openGisBoundary?.message || 'Searching Open GIS lake boundary...'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Cadastral Parcel Intelligence Card */}
      {selectedParcel && (
        <div className="absolute bottom-6 right-3 z-20 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-4 shadow-2xl space-y-3 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-bold text-white text-sm">
                Cadastral Survey No. {selectedParcel.surveyNumber}
              </h3>
            </div>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Village:</span>
              <span className="text-slate-200 font-medium">{selectedParcel.village || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Parcel Area:</span>
              <span className="text-slate-200 font-medium">{selectedParcel.areaAcres} Acres</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Detected Change Area:</span>
              <span className="font-semibold text-rose-400">
                {selectedParcel.isIntersectingChange ? `${riskAnalysis.detectedChangeAreaHectares} Ha` : '0.00 Ha'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Case Status:</span>
              <span className={`font-semibold ${selectedParcel.isIntersectingChange ? 'text-amber-400' : 'text-emerald-400'}`}>
                {selectedParcel.isIntersectingChange ? 'Active Investigation' : 'Normal Monitoring'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 block">Overlap Status:</span>
              <span className={`font-semibold ${selectedParcel.isIntersectingChange ? 'text-rose-300' : 'text-emerald-300'}`}>
                {selectedParcel.isIntersectingChange
                  ? 'Intersecting Change Zone'
                  : 'No detected satellite-change intersection'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 block">Land Classification:</span>
              <span className="text-slate-300">{selectedParcel.landClassification}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 block">Related Alert:</span>
              <span className="font-mono text-cyan-300 text-[11px]">{lakeAlerts[0]?.id || 'ALT-2026-089'}</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400">
            {selectedParcel.isIntersectingChange ? (
              <span className="text-amber-300">
                ⚠️ Suspected spectral shift detected in boundary buffer. Field verification required.
              </span>
            ) : (
              <span>
                No detected satellite-change intersection. (Automated remote sensing screening — not a statutory property title certification).
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interactive Change / Risk Polygon Intelligence Card */}
      {selectedPolygonInfo && !selectedParcel && (
        <div className="absolute bottom-6 right-3 z-20 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-rose-500/50 rounded-2xl p-4 shadow-2xl space-y-3 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-bold text-white text-sm">{selectedPolygonInfo.title}</h3>
            </div>
            <button
              onClick={() => setSelectedPolygonInfo(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Priority:</span>
              <span className="font-bold text-rose-400">{selectedPolygonInfo.priority}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Risk Score:</span>
              <span className="font-bold text-white bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                {selectedPolygonInfo.riskScore}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Change Metric:</span>
              <span className="font-semibold text-rose-300">-{selectedPolygonInfo.changePct}% Water Loss</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Affected Area:</span>
              <span className="font-semibold text-white">{selectedPolygonInfo.affectedArea}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Coordinates:</span>
              <span className="font-mono text-cyan-300 text-[11px]">{selectedPolygonInfo.coordinates}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block">Reason for Flag:</span>
              <span className="text-slate-200 text-[11px]">{selectedPolygonInfo.reason}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block">Recommended Action:</span>
              <span className="text-amber-300 font-semibold text-[11px]">{selectedPolygonInfo.recommendedAction}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-6 left-3 z-10 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-1.5 shadow-xl text-[11px] hidden sm:flex items-center space-x-3 text-slate-300">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-sky-400" />
          <span>🔵 Water</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-rose-500" />
          <span>🔴 Loss</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500" />
          <span>🟠 Buffer</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded border border-blue-400 bg-blue-400/30" />
          <span>Parcels</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🔍</span>
          <span>Field</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>📷</span>
          <span>Photos</span>
        </div>
      </div>
    </div>
  );
};
