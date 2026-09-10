import React from 'react';
import {
  Shield,
  Satellite,
  Layers,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Cpu,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Sparkles,
  Droplets,
  Scale
} from 'lucide-react';
import { useLake } from '../context/LakeContext';
import { PRESET_LAKES } from '../data/lakes';

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const { currentLake, selectPresetLake, backendStatus, monitorRealData, monitorChangeData } = useLake();

  const workflowSteps = [
    {
      step: '01',
      title: 'Detect',
      subtitle: 'Multispectral Water Detection',
      desc: 'Automated retrieval of Sentinel-2 L2A Top-of-Atmosphere multispectral data with cloud-shadow filtering and 10m spatial resolution.',
      badge: 'ESA Copernicus',
      icon: Satellite,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-400'
    },
    {
      step: '02',
      title: 'Locate',
      subtitle: 'Geographic Centering & Bounding Window',
      desc: 'Center telemetry on target lake coordinates with adaptive bounding box calculations and official open GIS shoreline baselines.',
      badge: 'Spatial Ingress',
      icon: MapPin,
      color: 'from-cyan-500/20 to-teal-500/20 border-teal-500/40 text-teal-300'
    },
    {
      step: '03',
      title: 'Prioritize',
      subtitle: 'Bi-Temporal Delta & Risk Scoring',
      desc: 'Normalized Difference Water Index (NDWI) differential matrix comparing temporal baselines to rank contraction into High, Moderate, or Low risk.',
      badge: 'Spectral Delta',
      icon: TrendingUp,
      color: 'from-teal-500/20 to-emerald-500/20 border-emerald-500/40 text-emerald-400'
    },
    {
      step: '04',
      title: 'Verify',
      subtitle: 'Cadastral Parcel Overlap & Ground Truthing',
      desc: 'Cross-reference detected shoreline contraction against state revenue survey parcel records, 30m statutory buffer zones, and officer dispatch.',
      badge: 'Revenue Cadastre',
      icon: Layers,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400'
    },
    {
      step: '05',
      title: 'Act',
      subtitle: 'Officer Dispatch & Field Verification',
      desc: 'Dispatch field inspection teams to record geotagged photographs, GPS coordinates, observed ground activity, and status determination.',
      badge: 'Enforcement Action',
      icon: ClipboardCheck,
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/40 text-rose-400'
    },
    {
      step: '06',
      title: 'Report',
      subtitle: 'Intelligence Dossier & Decision Support',
      desc: 'Compile unified multi-source Environmental Intelligence Dossiers synthesizing satellite telemetry, cadastral parcels, and verified field evidence.',
      badge: 'Decision Support',
      icon: FileText,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-400'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-[#0b1320] to-[#0b1320] p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-xs font-semibold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Municipal & State Lake Protection Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lake<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Health</span>
            <br />
            <span className="text-2xl sm:text-4xl text-slate-200 font-semibold">
              Water Body Health & Encroachment Monitor
            </span>
          </h1>

          {/* Workflow Chain Pill Banner */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-cyan-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 w-fit">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold mr-1">Workflow:</span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/60">Detect</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 border border-teal-800/60">Locate</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/60">Prioritize</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800/60">Verify</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/60">Act</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800/60">Report</span>
          </div>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            Protect vital wetlands and freshwater lakes from debris dumping, unauthorized construction, and buffer zone violations. Powered by European Space Agency Sentinel-2 satellite telemetry, spatial NDWI differential analytics, revenue survey cadastral overlays, and closed-loop field enforcement.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-sm"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('gis')}
              className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-all text-sm"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Interactive GIS & Cadastral</span>
            </button>

            <button
              onClick={() => setActiveTab('monitor')}
              className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 hover:text-white font-medium px-4 py-3 rounded-xl border border-slate-800 transition-all text-sm"
            >
              <Satellite className="w-4 h-4 text-teal-400" />
              <span>Monitor Any Lake</span>
            </button>
          </div>

          {/* Live Backend Connection Indicator Card */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 font-medium">FastAPI Backend:</span>
              <a
                href="https://lake-encroachment-api.onrender.com/docs"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                lake-encroachment-api.onrender.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <span className="hidden sm:inline text-slate-700">&bull;</span>

            <div className="text-slate-400">
              Active Lake Target:{' '}
              <span className="text-white font-bold">{currentLake.name}</span>{' '}
              <span className="font-mono text-cyan-400">
                ({currentLake.latitude.toFixed(4)}, {currentLake.longitude.toFixed(4)})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Stage Scientific Workflow */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="text-xs uppercase font-bold tracking-widest text-cyan-400">
            Scientific Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            End-to-End Encroachment Detection Workflow
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            From raw multispectral satellite passes down to field verification and cadastral survey numbers, here is how LakeHealth processes any lake coordinates:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 hover:border-slate-700 hover:bg-slate-900/90 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                    STAGE {item.step}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-br ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">{item.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Any-Lake Quick Selectors */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Tested Benchmark Lakes & Global Coordinate Support
            </h3>
            <p className="text-xs text-slate-400">
              Click any benchmark lake to switch coordinates, or enter ANY coordinates in the top selector bar:
            </p>
          </div>
          <span className="text-[11px] font-medium text-cyan-400 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800/60">
            Never Hardcoded &bull; Global Latitude/Longitude Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_LAKES.map((lake) => {
            const isSelected = lake.name === currentLake.name;
            return (
              <button
                key={lake.name}
                onClick={() => selectPresetLake(lake)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {lake.name}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{lake.state} &bull; {lake.district}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  {lake.latitude.toFixed(4)}°N, {lake.longitude.toFixed(4)}°E
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Core Integrity & Honest Data Commitment Banner */}
      <section className="rounded-2xl border border-teal-800/40 bg-teal-950/20 p-5 flex items-start space-x-3 text-xs text-teal-200/90">
        <Scale className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-teal-300">Scientific Honesty Guarantee:</span>
          <p className="text-slate-300 leading-relaxed">
            LakeHealth strictly adheres to authentic geospatial principles: Sentinel-2 NDWI analysis is calculated over an actual 256×256 pixel patch (10m ground resolution, ~2.56km × 2.56km coverage). Cadastral survey numbers are loaded only where verified government revenue records exist, and unavailable layers are transparently noted rather than fabricated.
          </p>
        </div>
      </section>
    </div>
  );
};
