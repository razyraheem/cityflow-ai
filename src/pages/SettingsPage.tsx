import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';
import {
  Settings as SettingsIcon,
  Shield,
  Eye,
  Sliders,
  Bell,
  HardDrive,
  Cpu,
  Lock,
  Moon,
  RefreshCw,
  Server,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { demoMode, toggleDemoMode } = useSimulation();
  const { addToast } = useToast();

  // Settings states
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [aiPredictionEngine, setAiPredictionEngine] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [plateMasking, setPlateMasking] = useState(false);
  const [roleBasedAccess, setRoleBasedAccess] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [mapRefreshRate, setMapRefreshRate] = useState('3 seconds');

  const handleSave = () => {
    addToast('Configuration Persisted', 'System runtime parameters saved successfully.', 'success', 3000);
  };

  const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-800'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              System Settings & Architecture
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              v1.0-RC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Configure edge perception rules, privacy masking, simulation modes, and API endpoints.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Runtime Configuration */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-bold font-mono uppercase text-slate-200">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>System & Intelligence Engine</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Real-Time Telemetry Updates</span>
                <span className="text-[11px] text-slate-400 font-sans">Continuous background vector stream ingestion</span>
              </div>
              <ToggleSwitch checked={realtimeUpdates} onChange={() => setRealtimeUpdates((p) => !p)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Simulation Mode Active</span>
                <span className="text-[11px] text-slate-400 font-sans">Enables interactive AI signal timing & corridor controls</span>
              </div>
              <ToggleSwitch checked={demoMode} onChange={toggleDemoMode} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">AI Predictive Modeling</span>
                <span className="text-[11px] text-slate-400 font-sans">Spatio-temporal congestion forecasting</span>
              </div>
              <ToggleSwitch checked={aiPredictionEngine} onChange={() => setAiPredictionEngine((p) => !p)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Audio-Visual Alert Bleeps</span>
                <span className="text-[11px] text-slate-400 font-sans">Web Audio synthesis on critical incidents</span>
              </div>
              <ToggleSwitch checked={notificationsEnabled} onChange={() => setNotificationsEnabled((p) => !p)} />
            </div>
          </div>
        </div>

        {/* Privacy & Compliance */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-bold font-mono uppercase text-slate-200">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Privacy, Security & Governance</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">License Plate Masking (DPDP Act)</span>
                <span className="text-[11px] text-slate-400 font-sans">Mask non-flagged civilian plates in UI views</span>
              </div>
              <ToggleSwitch checked={plateMasking} onChange={() => setPlateMasking((p) => !p)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Role-Based Access Control (RBAC)</span>
                <span className="text-[11px] text-slate-400 font-sans">Restrict signal override to verified commanders</span>
              </div>
              <ToggleSwitch checked={roleBasedAccess} onChange={() => setRoleBasedAccess((p) => !p)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Immutable Audit Logging</span>
                <span className="text-[11px] text-slate-400 font-sans">Log all signal preemption and trajectory query events</span>
              </div>
              <ToggleSwitch checked={auditLogging} onChange={() => setAuditLogging((p) => !p)} />
            </div>
          </div>
        </div>

        {/* Display & Tactical UI Settings */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-bold font-mono uppercase text-slate-200">
            <Moon className="w-4 h-4 text-purple-400" />
            <span>Display & Tactical Overlays</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Command-Center Dark Theme</span>
                <span className="text-[11px] text-slate-400 font-sans">Optimized for 24/7 control room displays</span>
              </div>
              <ToggleSwitch checked={darkMode} onChange={() => setDarkMode((p) => !p)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Tactical Map Refresh Rate</span>
                <span className="text-[11px] text-slate-400 font-sans">Spatiotemporal vector re-render frequency</span>
              </div>
              <select
                value={mapRefreshRate}
                onChange={(e) => setMapRefreshRate(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-cyan-300 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none"
              >
                <option>1 second</option>
                <option>3 seconds</option>
                <option>5 seconds</option>
                <option>10 seconds</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backend API Endpoints Mapping */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-sm font-bold font-mono uppercase text-slate-200">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Backend Integration Hooks</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">REST API Base:</span>
              <span className="text-cyan-400 font-bold">http://api.cityflow.ai/v1</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">WebSocket CCTV Hub:</span>
              <span className="text-emerald-400 font-bold">wss://stream.cityflow.ai/rtsp</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Re-ID Graph Solver:</span>
              <span className="text-indigo-400 font-bold">grpc://graph.cityflow.internal:50051</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

