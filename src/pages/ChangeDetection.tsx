import React from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  AlertTriangle,
  RefreshCw,
  Info,
  ArrowRight,
  ShieldAlert,
  Droplet,
  MinusCircle,
  PlusCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { MapView } from '../components/MapView';

interface ChangeDetectionProps {
  setActiveTab: (tab: string) => void;
}

export const ChangeDetection: React.FC<ChangeDetectionProps> = ({ setActiveTab }) => {
  const {
    currentLake,
    monitorRealData,
    monitorChangeData,
    isLoadingChange,
    changeError,
    executeMonitorChange,
    riskAnalysis
  } = useLake();

  const handleRunChange = () => {
    executeMonitorChange();
  };

  const beforeDate = monitorChangeData?.before_date ?? '2026-08-10';
  const afterDate = monitorChangeData?.after_date ?? '2026-09-06';
  const beforePct = monitorChangeData?.before_water_percentage ?? 24.50;
  const afterPct = monitorChangeData?.after_water_percentage ?? (monitorRealData?.detected_water_percentage ?? 18.86);
  const changePct = monitorChangeData?.change_percentage ?? (riskAnalysis.waterLossPercentage || 5.64);
  const changePixels = monitorChangeData?.change_pixels ?? 3699;
  const changeStatus = monitorChangeData?.change_status ?? (riskAnalysis.isWaterLoss ? `Water loss detected (-${changePct}%)` : 'Water increased');
  const method = monitorChangeData?.method ?? 'NDWI change detection';

  const isLoss =
    afterPct < beforePct ||
    changeStatus.toLowerCase().includes('loss') ||
    changeStatus.toLowerCase().includes('decreas');

  // Change Area in Hectares (1 pixel = 100m² = 0.01 Ha)
  const changeHectares = (changePixels * 0.01).toFixed(2);
  const changeAcres = (parseFloat(changeHectares) * 2.47105).toFixed(2);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Bi-Temporal Sentinel-2 Change Detection
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                isLoss
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}
            >
              {changeStatus}
            </span>
            {monitorChangeData?.is_fallback ? (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Demo / fallback data — backend unavailable
              </span>
            ) : monitorChangeData ? (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Live API
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                Demo Baseline
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automated pixel-level differential matrix analysis between two satellite acquisition dates over {currentLake.name}.
          </p>
        </div>

        <button
          id="run-change-detection-btn"
          onClick={handleRunChange}
          disabled={isLoadingChange}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChange ? 'animate-spin' : ''}`} />
          <span>{isLoadingChange ? 'Computing Matrix Subtraction...' : 'Re-run Change Detection'}</span>
        </button>
      </div>

      {/* Spatial Telemetry Scope Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 flex items-start space-x-3 text-xs text-cyan-200">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-white">Spatial Telemetry Scope:</div>
          <p className="text-slate-300 leading-relaxed">
            Analysis represents the targeted 256×256 satellite observation patch (10m ground sampling distance, ~2.56 km × 2.56 km) centered at the lake's coordinates. Percentages describe this monitored spatial window to pinpoint shoreline retreat with high fidelity.
          </p>
        </div>
      </div>

      {changeError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          <b className="text-white font-medium">Error: </b> {changeError}
        </div>
      )}

      {/* Before / After Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline (Before) Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Before Timestamp
            </span>
            <span className="text-[11px] font-mono text-cyan-400">{beforeDate}</span>
          </div>

          <div>
            <div className="text-3xl font-semibold text-white tracking-tight">{beforePct}%</div>
            <p className="text-xs text-slate-400 mt-1">Water surface coverage in patch</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
            Baseline Sentinel-2 L2A optical pass
          </div>
        </div>

        {/* Current (After) Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              After Timestamp
            </span>
            <span className="text-[11px] font-mono text-cyan-400">{afterDate}</span>
          </div>

          <div>
            <div className="text-3xl font-semibold text-cyan-300 tracking-tight">{afterPct}%</div>
            <p className="text-xs text-slate-400 mt-1">Water surface coverage in patch</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-cyan-200">
            Recent Sentinel-2 L2A optical pass
          </div>
        </div>

        {/* Differential (Net Change) Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
              Net Temporal Shift
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.2 rounded ${
                isLoss
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {changeStatus}
            </span>
          </div>

          <div>
            <div
              className={`text-3xl font-semibold tracking-tight ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}
            >
              {isLoss ? '-' : '+'}
              {changePct}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {changePixels.toLocaleString()} altered pixels ({changeHectares} Ha / {changeAcres} Acres)
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
            Method: Matrix subtraction (NDWI_t2 - NDWI_t1)
          </div>
        </div>
      </div>

      {/* Spatial Change Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Spatial Change Detection Overlay
          </h2>
          <button
            onClick={() => setActiveTab('gis')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium"
          >
            <span>Cross-reference with Cadastral Survey Parcels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <MapView heightClass="h-[520px]" showAllControls={true} />
      </div>

      {/* Potential Encroachment Assessment */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white text-sm">Potential Encroachment Interpretation</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isLoss ? (
            <>
              Water loss of <b>{changePct}%</b> detected along the lake boundary indicates potential shoreline filling, construction ingress, or artificial earth dumping. Because this water retreat occurred between {beforeDate} and {afterDate}, an alert has been logged for ground-truthing verification.
            </>
          ) : (
            <>
              Water surface increased by <b>+{changePct}%</b> between {beforeDate} and {afterDate}. This reflects positive hydrological inflow, seasonal monsoon filling, or reservoir recharge. No active shoreline constriction flagged for this temporal window.
            </>
          )}
        </p>
        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-medium border border-slate-700 transition-colors"
          >
            View Active Alerts Feed
          </button>
          <button
            onClick={() => setActiveTab('field')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-medium transition-colors"
          >
            Dispatch Field Verification
          </button>
        </div>
      </div>
    </div>
  );
};
