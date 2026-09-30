import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  Play,
  Pause,
  Clock,
  Shield,
  User,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { DemoTourModal } from '../common/DemoTourModal';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const {
    alerts,
    activeAlertsCount,
    isSimulating,
    toggleSimulation,
    demoMode,
    toggleDemoMode,
    markAlertRead,
    clearAllAlerts
  } = useSimulation();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (q.toUpperCase().startsWith('CAM-')) {
      navigate('/cameras');
    } else if (q.toUpperCase().startsWith('J')) {
      navigate('/signals');
    } else if (q.toUpperCase().includes('AMB')) {
      navigate('/emergency');
    } else {
      navigate(`/vehicles?plate=${encodeURIComponent(q.toUpperCase())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle plate (e.g. KA19AB1234), camera, junction..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner"
          />
        </form>
      </div>

      {/* Right: Actions, Live Clock, SIH Tour, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* SIH Interactive Judge Guided Tour Button */}
        <button
          onClick={() => setShowDemoModal(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">🎯 SIH Demo Tour</span>
          <span className="sm:hidden">Tour</span>
        </button>

        {/* Simulation Pause / Play toggle */}
        <button
          onClick={toggleSimulation}
          className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
            isSimulating
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
          }`}
          title={isSimulating ? 'Pause Live Engine' : 'Resume Live Engine'}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isSimulating ? 'LIVE' : 'PAUSED'}</span>
        </button>

        {/* Demo Mode Pill */}
        <button
          onClick={toggleDemoMode}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border transition-all ${
            demoMode
              ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title="Toggle Simulation vs Live Infrastructure Mode"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SIMULATION MODE</span>
        </button>

        {/* Clock & Date */}
        <div className="hidden xl:flex flex-col items-end px-3 py-1 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-100">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{currentTime}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">{currentDate}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu((p) => !p)}
            className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Alert Dropdown Menu */}
          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-200">
                    Live System Alerts
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {alerts.length} Total
                  </span>
                </div>
                <button
                  onClick={clearAllAlerts}
                  className="text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markAlertRead(alert.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      alert.read
                        ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                        : alert.type === 'emergency'
                        ? 'bg-red-950/40 border-red-500/40 text-red-200'
                        : 'bg-slate-950 border-amber-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-slate-100">{alert.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">{alert.description}</p>
                    <div className="mt-1.5 text-[10px] font-mono text-cyan-400">
                      📍 {alert.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-200 leading-none">Traffic AI Unit</div>
            <span className="text-[10px] text-emerald-400 font-mono">SIH26127 Operator</span>
          </div>
        </div>
      </div>

      {/* Guided Tour Modal */}
      <DemoTourModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </header>
  );
};

