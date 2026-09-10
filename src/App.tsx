import React, { useState } from 'react';
import { LakeProvider } from './context/LakeContext';
import { Navbar } from './components/Navbar';
import { LakeSelectorBar } from './components/LakeSelectorBar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { MonitorLake } from './pages/MonitorLake';
import { ChangeDetection } from './pages/ChangeDetection';
import { GisCadastral } from './pages/GisCadastral';
import { RiskAlerts } from './pages/RiskAlerts';
import { FieldVerification } from './pages/FieldVerification';
import { Reports } from './pages/Reports';
import { AiMlArchitecture } from './pages/AiMlArchitecture';
import { About } from './pages/About';
import { Shield, ExternalLink, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'monitor':
        return <MonitorLake setActiveTab={setActiveTab} />;
      case 'change':
        return <ChangeDetection setActiveTab={setActiveTab} />;
      case 'gis':
        return <GisCadastral />;
      case 'alerts':
        return <RiskAlerts setActiveTab={setActiveTab} />;
      case 'field':
        return <FieldVerification />;
      case 'reports':
        return <Reports />;
      case 'aiml':
        return <AiMlArchitecture />;
      case 'about':
        return <About />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <LakeProvider>
      <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Global Lake & Coordinates Selector (always accessible across analysis pages) */}
        {activeTab !== 'about' && activeTab !== 'aiml' && (
          <div className="no-print border-b border-slate-800/80 bg-[#0a101f]/70 backdrop-blur-md sticky top-16 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
              <LakeSelectorBar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveTab()}
        </main>

        {/* Footer */}
        <footer className="no-print border-t border-slate-800 bg-[#050811] text-xs text-slate-400 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white">LakeHealth</span>
                <span className="text-slate-400 ml-2">
                  — Water Body Health & Encroachment Monitor
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <button
                onClick={() => setActiveTab('aiml')}
                className="hover:text-cyan-400 transition-colors"
              >
                AI/ML Roadmap
              </button>
              <span>&bull;</span>
              <button
                onClick={() => setActiveTab('about')}
                className="hover:text-cyan-400 transition-colors"
              >
                About & Ethics
              </button>
              <span>&bull;</span>
              <a
                href="https://lake-encroachment-api.onrender.com/docs"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                FastAPI Swagger Docs
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-slate-400 text-center sm:text-right">
              Copernicus Sentinel-2 &bull; OpenStreetMap GIS &bull; State Cadastre
            </div>
          </div>
        </footer>
      </div>
    </LakeProvider>
  );
}

