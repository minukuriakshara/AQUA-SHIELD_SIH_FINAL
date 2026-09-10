import React from 'react';
import {
  Activity,
  Droplets,
  TrendingUp,
  AlertTriangle,
  Layers,
  Calendar,
  Satellite,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useLake } from '../context/LakeContext';
import { MapView } from '../components/MapView';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const {
    currentLake,
    monitorRealData,
    isLoadingMonitor,
    executeMonitorReal,
    monitorChangeData,
    isLoadingChange,
    executeMonitorChange,
    riskAnalysis,
    cadastralParcels,
    alerts
  } = useLake();

  const isRefreshing = isLoadingMonitor || isLoadingChange;

  const handleRefresh = () => {
    executeMonitorReal();
    executeMonitorChange();
  };

  // Metrics extraction
  const waterPct = monitorRealData ? monitorRealData.detected_water_percentage : 18.86;
  const beforeWaterPct = monitorChangeData ? monitorChangeData.before_water_percentage : 24.50;
  const afterWaterPct = monitorChangeData ? monitorChangeData.after_water_percentage : waterPct;
  const changePct = monitorChangeData ? monitorChangeData.change_percentage : (riskAnalysis.waterLossPercentage || 5.64);
  const changeStatus = monitorChangeData ? monitorChangeData.change_status : (riskAnalysis.isWaterLoss ? `Water loss detected (-${changePct}%)` : 'Water extent variation');
  const satelliteSource = monitorRealData ? monitorRealData.satellite : 'Sentinel-2';
  const analysisDate = monitorRealData ? monitorRealData.image_date : '2026-09-06';

  const affectedParcelsCount = cadastralParcels?.filter((p) => p.isIntersectingChange).length ?? 0;
  const totalParcelsCount = cadastralParcels?.length ?? 0;

  // Chart data: Temporal comparison
  const temporalChartData = [
    {
      period: monitorChangeData ? monitorChangeData.before_date : '2026-08-10 (Before)',
      waterPercentage: beforeWaterPct
    },
    {
      period: monitorChangeData ? monitorChangeData.after_date : '2026-09-06 (After)',
      waterPercentage: afterWaterPct
    }
  ];

  // Pie chart data: Pixel coverage inside 256x256 patch (65,536 total)
  const waterPixels = monitorRealData ? monitorRealData.water_pixels : 12357;
  const nonWaterPixels = 65536 - waterPixels;
  const pixelDistributionData = [
    { name: 'Water Surface (NDWI > 0)', value: waterPixels, color: '#38bdf8' },
    { name: 'Dry Land / Built-up Buffer', value: nonWaterPixels, color: '#1e293b' }
  ];

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'MODERATE':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Refresh Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{currentLake.name}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
              Live Analysis
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Coordinates: {currentLake.latitude.toFixed(4)}°N, {currentLake.longitude.toFixed(4)}°E &bull; {currentLake.state || 'India'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="refresh-dashboard-analysis-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Re-analyzing Patch...' : 'Refresh Sentinel-2'}</span>
          </button>
          <button
            onClick={() => setActiveTab('gis')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-600/30 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full GIS Map</span>
          </button>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Water % */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Water Extent (NDWI)</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-semibold text-white tracking-tight">{waterPct}%</span>
            <span className="text-xs text-slate-400">of 256×256 patch</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>{waterPixels.toLocaleString()} water pixels</span>
            <span>Date: {analysisDate}</span>
          </div>
        </div>

        {/* Metric 2: Net Temporal Change */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Bi-Temporal Change</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-3xl font-semibold tracking-tight ${
                changeStatus.toLowerCase().includes('loss') || changeStatus.toLowerCase().includes('decreas')
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {changePct}%
            </span>
            <span className="text-xs text-slate-400">{changeStatus}</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Before: {beforeWaterPct}%</span>
            <span>After: {afterWaterPct}%</span>
          </div>
        </div>

        {/* Metric 3: Risk Level */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Encroachment Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-semibold text-white tracking-tight">{riskAnalysis.riskScore}/100</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium border ${getRiskBadgeColor(
                riskAnalysis.riskLevel
              )}`}
            >
              {riskAnalysis.riskLevel}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate pt-1 border-t border-slate-800">
            {riskAnalysis.riskFactors[0] || 'Observation active'}
          </div>
        </div>

        {/* Metric 4: Cadastral Parcels */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cadastral Parcels</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            {cadastralParcels ? (
              <>
                <span className="text-3xl font-semibold text-amber-400 tracking-tight">{affectedParcelsCount}</span>
                <span className="text-xs text-slate-400">/ {totalParcelsCount} affected</span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-400">No Cadastre Loaded</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            {cadastralParcels ? 'Intersecting change zone' : 'Upload custom GeoJSON in GIS'}
          </div>
        </div>
      </div>

      {/* Interactive Map & Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map View */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">Spatial Analysis Map (256×256 Patch)</h2>
              <span className="text-[10px] text-cyan-400 font-medium px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                10m Sentinel-2 GSD
              </span>
            </div>
            <button
              onClick={() => setActiveTab('gis')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium"
            >
              <span>Full Layer Controls</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <MapView heightClass="h-[460px]" showAllControls={false} />
          <p className="text-[11px] text-slate-400">
            <b className="text-slate-300 font-medium">Geospatial Scope:</b> Analysis represents the monitored 256×256 Sentinel-2 optical patch (~2.56 km × 2.56 km centered at coordinates), establishing local shoreline telemetry.
          </p>
        </div>

        {/* Right 1 Col: Visual Analytics */}
        <div className="space-y-4">
          {/* Chart 1: Bi-Temporal Water Comparison */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Temporal Water Extent</span>
              <span className="text-cyan-400 font-mono text-[11px]">% Coverage</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={temporalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 30]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="waterPercentage" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Water %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Patch Pixel Composition */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Patch Composition (65,536 px)</span>
              <span className="text-slate-400 text-[10px]">Sentinel-2 NDWI</span>
            </div>
            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pixelDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pixelDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val.toLocaleString()} pixels`, '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-4 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-300">Water ({waterPct}%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="text-slate-400">Land / Buffer ({(100 - waterPct).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Encroachment Alerts Feed */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Active Environmental Alerts & Encroachment Flags</h3>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
          >
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Water Body</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Change Signal</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.slice(0, 3).map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300">{alert.id}</td>
                  <td className="py-3 px-3 font-semibold text-white">{alert.lakeName}</td>
                  <td className="py-3 px-3 text-slate-400">{alert.date}</td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{alert.changeDetected}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadgeColor(
                        alert.riskLevel
                      )}`}
                    >
                      {alert.riskLevel} ({alert.riskScore})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        alert.status === 'Verified'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : alert.status === 'Rejected'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setActiveTab('field')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
