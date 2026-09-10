import React from 'react';
import {
  Shield,
  Droplets,
  Satellite,
  Layers,
  FileCheck,
  Scale,
  Code2,
  ExternalLink,
  Award,
  Globe2,
  Lock,
  HeartHandshake
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-xs font-semibold text-cyan-300">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>LakeHealth Initiative &bull; Municipal Intelligence & Encroachment Risk Platform</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About LakeHealth
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
          An open-source satellite intelligence and environmental surveillance platform designed to preserve natural lakes, wetlands, and urban water bodies through automated Sentinel-2 remote sensing and cadastral parcel alignment.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Problem */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
            <Droplets className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">The Encroachment Crisis</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Across rapidly urbanizing basins, vital lakes and catchment reservoirs are disappearing under debris dumping, unauthorized real estate expansion, and illegal boundary walls. Manual patrolling across hundreds of square kilometers is slow, resource-intensive, and often detects infringements only after irreversible concrete damage has occurred.
          </p>
        </div>

        {/* The Solution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
            <Satellite className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">The LakeHealth Solution</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            By democratizing satellite optical passes from the European Space Agency’s Sentinel-2 constellation, LakeHealth provides continuous bi-temporal surveillance at 10m resolution. Spectral NDWI analytics flag shoreline retraction in days rather than months, automatically overlaying government survey parcel numbers to support swift legal enforcement.
          </p>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          Open-Source Technology Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">Frontend & UI</div>
            <div className="text-cyan-300 font-mono">React 18 &bull; Vite &bull; Tailwind CSS</div>
            <p className="text-slate-400 text-[11px]">
              Fast, reactive single-page architecture with dark aesthetic and accessible data tables.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">Interactive GIS Engine</div>
            <div className="text-teal-300 font-mono">Leaflet &bull; OpenStreetMap &bull; GeoJSON</div>
            <p className="text-slate-400 text-[11px]">
              Pure open-source mapping with no proprietary API tokens or billing dependencies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">Remote Sensing Backend</div>
            <div className="text-sky-300 font-mono">FastAPI &bull; Python &bull; Render Cloud</div>
            <p className="text-slate-400 text-[11px]">
              High-performance REST API calculating optical NDWI arrays over Sentinel-2 scenes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white">Visualization & Reports</div>
            <div className="text-amber-300 font-mono">Recharts &bull; Browser Print API</div>
            <p className="text-slate-400 text-[11px]">
              Instant statutory dossiers with pixel distribution charts and audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* Data Sources & Transparency Statement */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Data Sources & Geospatial Attribution
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Copernicus Sentinel-2</div>
            <p className="text-slate-400">
              European Space Agency (ESA) & European Commission open-access multispectral optical telemetry at 10m GSD.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white">OpenStreetMap & CartoDB</div>
            <p className="text-slate-400">
              Open-source global collaborative cartography providing topological base layers and boundary context.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Revenue Department Cadastre</div>
            <p className="text-slate-400">
              State survey and settlement cadastral schema (Sy. No.) for ground correlation and parcel reconciliation.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance & Ethical AI */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-sm font-bold text-white">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Compliance & Ethical Geospatial AI Statement</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          LakeHealth is developed in strict accordance with the National Geospatial Policy. All satellite observations utilize publicly available earth observation feeds. The system operates as an investigative screening aid (decision-support tool), and requires on-ground verification by authorized revenue and environmental inspectors before administrative action.
        </p>
      </div>

      {/* Platform Deployment Info */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-teal-950/40 border border-cyan-800/40 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <div className="text-sm font-bold text-white">
            National Municipal Lake & Wetland Surveillance Platform
          </div>
          <div className="text-slate-400 mt-0.5">
            Mission: Autonomous Satellite Protection for Every Freshwater Lake & Wetland
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-cyan-900/60 text-cyan-300 font-mono border border-cyan-700">
            LakeHealth Platform v2.4
          </span>
        </div>
      </div>
    </div>
  );
};
