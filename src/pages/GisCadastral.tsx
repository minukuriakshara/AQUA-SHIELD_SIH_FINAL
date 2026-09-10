import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Upload,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCheck,
  Shield,
  Download,
  Search
} from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { MapView } from '../components/MapView';
import { CadastralParcel } from '../types';

export const GisCadastral: React.FC = () => {
  const { currentLake, cadastralParcels, customGeoJson, setCustomGeoJson } = useLake();

  const [selectedParcel, setSelectedParcel] = useState<CadastralParcel | null>(
    cadastralParcels ? cadastralParcels[0] : null
  );

  const affectedCount = cadastralParcels?.filter((p) => p.isIntersectingChange).length ?? 0;
  const totalParcels = cadastralParcels?.length ?? 0;
  const affectedPct = totalParcels > 0 ? ((affectedCount / totalParcels) * 100).toFixed(1) : '0';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setCustomGeoJson(json);
      } catch (err) {
        alert('Invalid GeoJSON file. Please check syntax.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              GIS & Cadastral Parcel Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
              Interactive Leaflet Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Integrate satellite water retreat masks with official revenue department land survey numbers and spatial parcel boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const sampleGeoJson = {
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: {
                      surveyNumber: 'Sy. No. 101',
                      parcelId: 'REV-SURVEY-0101',
                      village: 'Shoreline Sector',
                      mandal: 'Revenue Division',
                      areaAcres: 3.8,
                      landClassification: 'Buffer Zone (FTL)',
                      ownerOrCustodian: 'State Irrigation Buffer Authority'
                    },
                    geometry: {
                      type: 'Polygon',
                      coordinates: [[
                        [currentLake.longitude - 0.005, currentLake.latitude + 0.004],
                        [currentLake.longitude - 0.002, currentLake.latitude + 0.004],
                        [currentLake.longitude - 0.002, currentLake.latitude + 0.002],
                        [currentLake.longitude - 0.005, currentLake.latitude + 0.002],
                        [currentLake.longitude - 0.005, currentLake.latitude + 0.004]
                      ]]
                    }
                  },
                  {
                    type: 'Feature',
                    properties: {
                      surveyNumber: 'Sy. No. 102',
                      parcelId: 'REV-SURVEY-0102',
                      village: 'Shoreline Sector',
                      mandal: 'Revenue Division',
                      areaAcres: 4.2,
                      landClassification: 'Government Water Body',
                      ownerOrCustodian: 'Municipal Lake Body Custodian'
                    },
                    geometry: {
                      type: 'Polygon',
                      coordinates: [[
                        [currentLake.longitude - 0.002, currentLake.latitude + 0.004],
                        [currentLake.longitude + 0.002, currentLake.latitude + 0.004],
                        [currentLake.longitude + 0.002, currentLake.latitude + 0.002],
                        [currentLake.longitude - 0.002, currentLake.latitude + 0.002],
                        [currentLake.longitude - 0.002, currentLake.latitude + 0.004]
                      ]]
                    }
                  }
                ]
              };
              const blob = new Blob([JSON.stringify(sampleGeoJson, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sample_cadastral_${currentLake.name.toLowerCase().replace(/\s+/g, '_')}.geojson`;
              a.click();
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
            title="Download template GeoJSON formatted for cadastral revenue mapping"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample GeoJSON</span>
          </button>

          <label className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-600/30 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Cadastral GeoJSON</span>
            <input
              type="file"
              accept=".geojson,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Interactive Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Active Viewport: <b className="text-white font-medium">{currentLake.name}</b> ({currentLake.latitude.toFixed(4)}, {currentLake.longitude.toFixed(4)})</span>
          <span>Switch base layers (Satellite / OSM / Dark / ISRO Bhuvan) and toggle overlays via upper-right panel</span>
        </div>
        <MapView heightClass="h-[620px]" showAllControls={true} />
      </div>

      {/* Cadastral & GIS Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Affected Parcels Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Affected Cadastral Parcels
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>

          {cadastralParcels ? (
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-semibold text-amber-400 tracking-tight">{affectedCount}</span>
                <span className="text-xs text-slate-400">out of {totalParcels} surveyed parcels</span>
              </div>
              <div className="text-xs text-slate-300">
                <b className="font-medium text-white">{affectedPct}%</b> of mapped parcels intersect the detected Sentinel-2 water retreat zone.
              </div>
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-300">
                Action: Survey numbers {cadastralParcels.filter((p) => p.isIntersectingChange).map((p) => p.surveyNumber).join(', ')} flagged for encroachment verification.
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-slate-400">
              <p className="text-amber-300/90 font-medium">
                Official cadastral parcel records unavailable for these exact coordinates in open GIS.
              </p>
              <p className="leading-relaxed">
                Upload your local village revenue survey GeoJSON map using the button above to calculate automated spatial change intersection.
              </p>
            </div>
          )}
        </div>

        {/* Lake Boundary Source Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Lake Boundary Source
            </span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Real-Time Sentinel-2 NDWI Boundary</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Active boundary delineated at 10m ground resolution from recent satellite reflectance (B03 / B08).
            </p>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Open GIS Boundary: {cadastralParcels ? 'Referenced from State Irrigation Cadastre format (Sample Records)' : 'OpenStreetMap boundary loaded if available (Non-statutory reference).'}
            </div>
          </div>
        </div>

        {/* Bhuvan / ISRO Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Bhuvan / ISRO Geospatial
            </span>
            <FileCheck className="w-4 h-4 text-orange-400" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="text-slate-200 font-medium">
              ISRO Bhuvan Open Geospatial Services (WMS 1.1.1):
            </div>
            <p className="text-slate-400 leading-relaxed">
              Available as a selectable basemap option in the upper-right map controls. Renders public NRSC Cartographic WMS layer.
            </p>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Integrity note: True WMS service connected. No fabricated imagery is rendered.
            </div>
          </div>
        </div>
      </div>

      {/* Cadastral Parcels Detail Table */}
      {cadastralParcels && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Cadastral Survey Records in Analysis Area (Sample State Cadastre Format)
            </h3>
            <span className="text-xs text-slate-400">Click a row or map parcel to inspect</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Survey No</th>
                  <th className="py-2.5 px-3">Parcel ID</th>
                  <th className="py-2.5 px-3">Village / Mandal</th>
                  <th className="py-2.5 px-3">Area (Acres)</th>
                  <th className="py-2.5 px-3">Land Classification</th>
                  <th className="py-2.5 px-3">Change Detected</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Custodian / Title</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cadastralParcels.map((parcel) => (
                  <tr
                    key={parcel.surveyNumber}
                    onClick={() => setSelectedParcel(parcel)}
                    className={`cursor-pointer transition-colors ${
                      selectedParcel?.surveyNumber === parcel.surveyNumber
                        ? 'bg-cyan-950/40 border-l-2 border-cyan-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-medium text-cyan-300">
                      {parcel.surveyNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {parcel.parcelId || 'PARCEL-001'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {parcel.village}, {parcel.mandal}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{parcel.areaAcres}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {parcel.landClassification}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {parcel.isIntersectingChange ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-950 text-rose-300 border border-rose-800">
                          Yes (Loss Zone)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          parcel.riskLevel === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : parcel.riskLevel === 'MODERATE'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {parcel.riskLevel || 'LOW'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                      {parcel.ownerOrCustodian}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
