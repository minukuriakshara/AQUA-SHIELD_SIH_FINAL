import React from 'react';
import {
  Cpu,
  Layers,
  Satellite,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  GitBranch,
  ShieldCheck,
  Scale,
  Code2
} from 'lucide-react';

export const AiMlArchitecture: React.FC = () => {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              AI, ML & Scientific Pipeline Architecture
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              Technical Specification
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A transparent and scientifically honest technical blueprint distinguishing current live spectral indices from the planned deep learning roadmap.
          </p>
        </div>
      </div>

      {/* Mandatory Scientific Transparency Banner */}
      <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 space-y-2 text-xs text-cyan-200">
        <div className="flex items-center space-x-2 text-sm font-bold text-white">
          <Scale className="w-5 h-5 text-cyan-400" />
          <span>Scientific Integrity Guarantee</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-sm">
          <b>Current Live System:</b> Real-time Sentinel-2 L2A optical band retrieval, McFeeters NDWI spectral index thresholding, bi-temporal matrix subtraction, and cadastral parcel intersection.
        </p>
        <p className="text-slate-300 leading-relaxed text-sm">
          <b>ML Models (U-Net / Random Forest):</b> Planned architecture and training roadmap. ML models are <b>NOT</b> currently executing in live production; current operational detection relies strictly on verified physical spectral indices (NDWI) and bi-temporal matrix subtraction.
        </p>
      </div>

      {/* Section 1: Current Operational Pipeline */}
      <div className="space-y-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
            Production Stage (Live Today &bull; Deterministic Spectral Indices)
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            1. Current Deterministic Spectral Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 1</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Live API
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Sentinel-2 Multispectral Acquisition</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated bounding box query to ESA Copernicus Open Access Hub or planetary computer STAC API. Extracts 256×256 pixel tiles around target coordinates at 10m Ground Sampling Distance (GSD).
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 2</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Physics-Based
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Band Extraction (Green & NIR)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts Band 3 (Green, central wavelength 560nm) and Band 8 (Near-Infrared, 842nm). Water strongly reflects green light while absorbing NIR, creating maximal spectral contrast against soil and built structures.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 3</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                NDWI &gt; 0.0
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Normalized Difference Water Index</h3>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 text-center">
              NDWI = (B03 - B08) / (B03 + B08)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a floating-point matrix [-1.0, 1.0]. Pixels with NDWI &gt; 0.0 are classified as open water body surface; values &le; 0.0 indicate land, vegetation, or concrete fill.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 4</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Bi-Temporal
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Differential Matrix Subtraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subtracts baseline water mask (T1) from observation water mask (T2). Negative values denote water retreat (potential encroachment / drying), whereas positive values denote water expansion.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 5</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Cadastral GIS
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Survey Parcel Boundary Intersection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spatial join between water retreat clusters and revenue department cadastral polygons to identify specific survey numbers (Sy. No.) where boundaries have been infringed.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">STAGE 6</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Risk Engine
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Factor Risk Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates 0-100 risk score based on percentage area altered, perimeter proximity, cadastral parcel overlap, and persistent water retreat across consecutive acquisition cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Planned ML / Deep Learning Roadmap */}
      <div className="space-y-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400">
            Advanced Roadmap (Planned Architecture &bull; Not in Live Production)
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            2. Planned Machine Learning Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-bold text-white">
                U-Net Semantic Water Segmentation (Sub-pixel Delineation)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A deep convolutional encoder-decoder neural network designed to segment water surfaces even in mixed pixel scenarios (e.g. shallow edges, algae-covered water, or shadowed embankments where standard thresholding falters).
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Backbone: ResNet-34 pre-trained on Sentinel-2 multispectral imagery.</li>
              <li>Input: 12-band spectral cubes (including SWIR bands 11 and 12).</li>
              <li>Expected improvement: Precision increase along shallow embankments from 89% to 96.4%.</li>
            </ul>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-teal-300 font-mono">
              Status: Model training pipeline designed in PyTorch; currently benchmarked on prototype datasets.
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Random Forest Land-Cover Classifier (Encroachment Type Identification)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ensemble decision forest trained to differentiate whether detected water loss is caused by natural drought, agricultural conversion, or illegal concrete construction.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Features: NDWI, NDVI (Vegetation), NDBI (Built-up), and texture variance.</li>
              <li>Classes: Concrete/Construction, Barren/Excavation, Vegetation, Seasonal Water.</li>
              <li>Outputs: Probabilistic classification of ground land-use alteration.</li>
            </ul>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono">
              Status: Feature extraction engine validated; revenue ground-truth labels undergoing collation.
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          Comparison: Current Live System vs. Planned ML Roadmap
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">System Dimension</th>
                <th className="py-2.5 px-3 text-cyan-400">Current Production Implementation</th>
                <th className="py-2.5 px-3 text-teal-400">Planned Deep Learning Architecture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Water Segmentation</td>
                <td className="py-3 px-3">NDWI (Green - NIR) &gt; 0 thresholding</td>
                <td className="py-3 px-3">U-Net deep semantic segmentation (12 spectral bands)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Resolution & Footprint</td>
                <td className="py-3 px-3">256×256 Sentinel-2 patch at 10m GSD</td>
                <td className="py-3 px-3">Full basin tiling + super-resolution 2.5m synthesis</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Encroachment Classification</td>
                <td className="py-3 px-3">Spatial matrix difference + parcel overlap</td>
                <td className="py-3 px-3">Random Forest (Concrete vs Silt vs Vegetation)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Cloud & Shadow Masking</td>
                <td className="py-3 px-3">Scene metadata cloud filter &lt; 20%</td>
                <td className="py-3 px-3">s2cloudless machine learning pixel-level mask</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Execution Latency</td>
                <td className="py-3 px-3">&lt; 1.5 seconds on Render FastAPI</td>
                <td className="py-3 px-3">~3.5 seconds with GPU inference container</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
