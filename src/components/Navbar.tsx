import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Layers,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Cpu,
  Info,
  Menu,
  X,
  Satellite,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { useLake } from '../context/LakeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentLake, backendStatus, refreshBackendHealth, alerts } = useLake();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingAlertsCount = alerts.filter((a) => a.status === 'Pending').length;

  const navItems = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'monitor', label: 'Monitor Lake', icon: Satellite },
    { id: 'change', label: 'Change Detection', icon: TrendingUp },
    { id: 'gis', label: 'GIS & Cadastral', icon: Layers },
    { id: 'alerts', label: 'Risk & Alerts', icon: AlertTriangle, badge: pendingAlertsCount },
    { id: 'field', label: 'Field Verification', icon: ClipboardCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'aiml', label: 'AI/ML', icon: Cpu },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b1320]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo-button"
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-lg tracking-wider text-white">
                  Lake<span className="text-cyan-400">Health</span>
                </span>
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Sentinel-2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Water Body Health & Encroachment Monitor
              </p>
            </div>
          </div>

          {/* Center Info: Active Lake & Coordinates */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-medium">
              <MapPin className="w-3.5 h-3.5 animate-pulse" />
              <span className="truncate max-w-[140px] text-white font-semibold">
                {currentLake.name}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-300">
              {currentLake.latitude.toFixed(4)}°N, {currentLake.longitude.toFixed(4)}°E
            </span>
          </div>

          {/* Right Status Indicator */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              id="refresh-backend-status-btn"
              onClick={refreshBackendHealth}
              disabled={backendStatus.isChecking}
              title={backendStatus.message}
              className="flex items-center space-x-2 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.isHealthy
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="font-medium">
                {backendStatus.isHealthy ? 'FastAPI Online' : 'API Connecting'}
              </span>
              <RefreshCw
                className={`w-3 h-3 text-slate-400 ${
                  backendStatus.isChecking ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/50 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1726] border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 px-3 mb-2 rounded bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-300 font-semibold truncate">{currentLake.name}</span>
            <span className="font-mono text-cyan-400 text-[11px]">
              {currentLake.latitude.toFixed(4)}, {currentLake.longitude.toFixed(4)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
