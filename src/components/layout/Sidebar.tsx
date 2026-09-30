import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Car,
  Route,
  BarChart3,
  Sparkles,
  Sliders,
  Ambulance,
  AlertTriangle,
  Cpu,
  Settings,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const { cameras, isSimulating } = useSimulation();

  const onlineCameras = cameras.filter((c) => c.status === 'ONLINE').length;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
    { label: 'Camera Network', path: '/cameras', icon: Video, badge: `${onlineCameras}/24` },
    { label: 'Vehicle Tracking', path: '/vehicles', icon: Car, badge: 'Re-ID' },
    { label: 'Trajectories', path: '/trajectories', icon: Route, badge: 'Graph' },
    { label: 'Traffic Analytics', path: '/analytics', icon: BarChart3, badge: 'Trends' },
    { label: 'Prediction', path: '/prediction', icon: Sparkles, badge: 'AI-Forecast' },
    { label: 'Signal Optimization', path: '/signals', icon: Sliders, badge: 'Adaptive' },
    { label: 'Emergency Corridor', path: '/emergency', icon: Ambulance, badge: 'Priority' },
    { label: 'Incident Detection', path: '/incidents', icon: AlertTriangle, badge: 'Optical' },
    { label: 'Digital Twin', path: '/simulation', icon: Cpu, badge: 'Twin' },
    { label: 'Settings', path: '/settings', icon: Settings, badge: '' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#080d1a] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold tracking-wider text-white font-mono">
                    CITYFLOW AI
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-bold">
                    SIH26127
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    v1.0-RC
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 leading-snug font-sans italic border-l-2 border-cyan-500/50 pl-2">
            “From Camera Perception to Predictive City Intelligence.”
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Command Center Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850/60 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-sans font-medium">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md transition-colors ${
                      isActive
                        ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer System Status Panel */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500'}`} />
              </span>
              <div>
                <div className="text-[11px] font-bold font-mono text-slate-200 leading-none">
                  {isSimulating ? 'All Systems Operational' : 'Telemetry Paused'}
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                  Edge Fusion Core v2.6
                </span>
              </div>
            </div>

            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};

