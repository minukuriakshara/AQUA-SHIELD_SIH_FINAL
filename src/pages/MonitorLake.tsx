import React, { useState } from 'react';
import {
  Satellite,
  Droplets,
  Calendar,
  Layers,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { MapView } from '../components/MapView';

interface MonitorLakeProps {
  setActiveTab: (tab: string) => void;
}

export const MonitorLake: React.FC<MonitorLakeProps> = ({ setActiveTab }) => {
  const {
    currentLake,
    monitorRealData,
    isLoadingMonitor,
    monitorError,
    executeMonitorReal,
    backendStatus
  } = useLake();

  const [hasRefreshed, setHasRefreshed] = useState(false);

  const handleRunAnalysis = async () => {
    await executeMonitorReal();
    setHasRefreshed(true);
    setTimeout(() => setHasRefreshed(false), 3000);
  };

  const waterPercentage = monitorRealData?.detected_water_percentage ?? 18.86;
  const waterPixels = monitorRealData?.water_pixels ?? 12357;
  const totalPixels = monitorRealData?.total_pixels ?? 65536;
  const imageDate = monitorRealData?.image_date ?? '2026-09-06';
  const satellite = monitorRealData?.satellite ?? 'Sentinel-2';
  const method = monitorRealData?.method ?? 'NDWI';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Sentinel-2 NDWI Water Analysis
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              Multispectral L2A
            </span>
            {monitorRealData?.is_fallback ? (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Demo / fallback data — backend unavailable
              </span>
            ) : monitorRealData ? (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Live API
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                Demo Baseline (Click Run NDWI)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time optical water body boundary segmentation using Normalized Difference Water Index on Green (B03) and Near-Infrared (B08) spectral reflectance.
          </p>
        </div>

        <button
          id="trigger-monitor-real-btn"
          onClick={handleRunAnalysis}
          disabled={isLoadingMonitor}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMonitor ? 'animate-spin' : ''}`} />
          <span>{isLoadingMonitor ? 'Fetching Sentinel-2 Pass...' : 'Run NDWI Analysis'}</span>
        </button>
      </div>

      {/* Prominent Prototype Transparency Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 flex items-start space-x-3 text-xs text-cyan-200">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span>Spatial Extent Notice:</span>
            <span className="text-[10px] px-2 py-0.2 rounded bg-cyan-900 border border-cyan-700">
              Patch Size: 256 × 256 pixels (~2.56 km × 2.56 km)
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <b>Analytical Scope:</b> Analysis represents the targeted 256×256 satellite patch around the selected coordinates ({currentLake.latitude.toFixed(4)}, {currentLake.longitude.toFixed(4)}), focusing on the immediate water body and buffer zone. This percentage describes the analyzed multi-spectral spatial window.
          </p>
        </div>
      </div>

      {/* Error Notice if any */}
      {monitorError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 flex items-center space-x-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold text-white">Backend Connection Alert: </span>
            <span>{monitorError} (The Render backend free tier may be spinning up; please wait 15 seconds and retry).</span>
          </div>
        </div>
      )}

      {/* Main Analysis Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Detected Water Area</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{waterPercentage}%</div>
          <p className="text-[11px] text-slate-400">of analyzed satellite patch</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Water Pixels</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400">
            {waterPixels.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Out of {totalPixels.toLocaleString()} pixels</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Satellite Platform</span>
            <Satellite className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">{satellite}</div>
          <p className="text-[11px] text-slate-400">Observation Date: {imageDate}</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Spectral Algorithm</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{method}</div>
          <p className="text-[11px] text-slate-400">(B03 - B08) / (B03 + B08) &gt; 0.0</p>
        </div>
      </div>

      {/* Interactive Satellite Water Mask Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            Spatial NDWI Water Mask Overlay
          </h2>
          <button
            onClick={() => setActiveTab('change')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
          >
            <span>Compare with Baseline (Change Detection)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <MapView heightClass="h-[520px]" showAllControls={true} />
      </div>

      {/* Technical Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            NDWI Spectral Formulation
          </h3>
          <p className="text-slate-300 leading-relaxed">
            The Normalized Difference Water Index (NDWI) is designed by S.K. McFeeters to delineate open water bodies and suppress soil and terrestrial vegetation features. In Sentinel-2:
          </p>
          <div className="p-3 bg-slate-950 rounded-xl font-mono text-cyan-300 border border-slate-800 text-center text-sm">
            NDWI = (Band 3 [Green] - Band 8 [NIR]) / (Band 3 + Band 8)
          </div>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Band 3 (Green, 560 nm): High reflectance of clear water surfaces.</li>
            <li>Band 8 (Near-Infrared, 842 nm): Strong absorption by water molecules.</li>
            <li>Values &gt; 0.0 represent water; values &le; 0.0 represent vegetation, barren land, or concrete.</li>
          </ul>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Target Coordinates & Ground Sampling Distance (GSD)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Each Sentinel-2 pixel in Bands 3 and 8 provides a 10m × 10m spatial footprint on the ground:
          </p>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">1 Pixel Area</span>
              <span className="font-bold text-white">100 m² (0.01 Hectares)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">256×256 Patch Extent</span>
              <span className="font-bold text-white">655.36 Hectares (1,619 Acres)</span>
            </div>
          </div>
          <div className="text-slate-400">
            Analysis updates automatically whenever new lake coordinates are submitted.
          </div>
        </div>
      </div>
    </div>
  );
};
