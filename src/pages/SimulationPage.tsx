import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { DIGITAL_TWIN_BENCHMARK } from '../data/mockData';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const SimulationPage: React.FC = () => {
  const { isSimulating, toggleSimulation, simulationSpeed, setSimulationSpeed } = useSimulation();

  const [simStep, setSimStep] = useState(0);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimStep((prev) => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const comparisonTimeData = [
    { hour: '07:00', baselineWait: 45, aiWait: 32, baselineTravel: 11.2, aiTravel: 9.4 },
    { hour: '08:00', baselineWait: 75, aiWait: 48, baselineTravel: 15.8, aiTravel: 12.1 },
    { hour: '09:00', baselineWait: 92, aiWait: 54, baselineTravel: 19.5, aiTravel: 13.8 },
    { hour: '10:00', baselineWait: 82, aiWait: 51, baselineTravel: 16.4, aiTravel: 12.7 },
    { hour: '11:00', baselineWait: 60, aiWait: 41, baselineTravel: 13.0, aiTravel: 10.5 },
    { hour: '12:00', baselineWait: 52, aiWait: 38, baselineTravel: 12.2, aiTravel: 9.8 },
    { hour: '13:00', baselineWait: 48, aiWait: 35, baselineTravel: 11.5, aiTravel: 9.2 },
    { hour: '14:00', baselineWait: 50, aiWait: 37, baselineTravel: 11.8, aiTravel: 9.5 },
    { hour: '15:00', baselineWait: 68, aiWait: 44, baselineTravel: 14.5, aiTravel: 11.3 },
    { hour: '16:00', baselineWait: 86, aiWait: 52, baselineTravel: 18.2, aiTravel: 13.4 },
    { hour: '17:00', baselineWait: 98, aiWait: 56, baselineTravel: 21.0, aiTravel: 14.2 },
    { hour: '18:00', baselineWait: 94, aiWait: 53, baselineTravel: 20.4, aiTravel: 13.9 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Traffic Digital Twin & Simulation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              MICRO-SIMULATION VALIDATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Compare baseline city-wide traffic dynamics with AI-optimized adaptive signal timing.
          </p>
        </div>

        {/* Watermark notice */}
        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          SIMULATED RESULTS (SIH26127 DEMO BENCHMARK)
        </div>
      </div>

      {/* Simulation Control Panel */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={toggleSimulation}
            className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                PAUSE SIMULATION
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                START SIMULATION
              </>
            )}
          </button>

          <button
            onClick={() => setSimStep(0)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reset Simulation Clock"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed multipliers */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Execution Speed:</span>
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs font-mono">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Visual Digital Twin: BEFORE AI vs AFTER AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: BEFORE AI (Baseline) */}
        <div className="rounded-3xl bg-[#090d16] border border-rose-500/30 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                  Baseline (Pre-AI Fixed Signals)
                </span>
                <h3 className="text-lg font-bold text-white font-sans mt-0.5">
                  Static Time-of-Day Traffic Plan
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                UNOPTIMIZED
              </span>
            </div>

            {/* Baseline Animated Grid Simulation */}
            <div className="relative w-full h-44 rounded-2xl bg-slate-950/80 border border-slate-800/80 my-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                {/* Horizontal Road */}
                <rect x="0" y="40" width="300" height="40" fill="#0d1829" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#facc15" strokeDasharray="6 4" strokeWidth="1.5" />
                {/* Congested Stalled Queue (Red vehicles piled up) */}
                <rect x="180" y="45" width="14" height="10" rx="2" fill="#ef4444" />
                <rect x="160" y="45" width="14" height="10" rx="2" fill="#ef4444" />
                <rect x="140" y="45" width="14" height="10" rx="2" fill="#ef4444" />
                <rect x="120" y="45" width="14" height="10" rx="2" fill="#ef4444" />
                <rect x="100" y="45" width="14" height="10" rx="2" fill="#ef4444" />
                <rect x="80" y="45" width="14" height="10" rx="2" fill="#ef4444" />

                {/* Red Signal Light */}
                <circle cx="210" cy="30" r="5" fill="#ef4444" className="animate-ping" />
                <circle cx="210" cy="30" r="5" fill="#ef4444" />
                <text x="220" y="33" fill="#f87171" fontSize="9" fontFamily="monospace">RED: 30s Fixed</text>
              </svg>
            </div>

            {/* Baseline Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Avg Waiting Time</span>
                <span className="text-xl font-extrabold font-mono text-rose-400 mt-1 block">82 sec</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Avg Travel Duration</span>
                <span className="text-xl font-extrabold font-mono text-rose-400 mt-1 block">16.4 min</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Junction Queue</span>
                <span className="text-xl font-extrabold font-mono text-rose-400 mt-1 block">47 veh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AFTER AI (CITYFLOW AI Engine) */}
        <div className="rounded-3xl bg-[#090d16] border border-emerald-500/40 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between shadow-emerald-950/20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  After CITYFLOW AI Optimization
                </span>
                <h3 className="text-lg font-bold text-white font-sans mt-0.5">
                  Predictive Multi-Agent Adaptive Control
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                AI ACTIVE
              </span>
            </div>

            {/* AI Animated Grid Simulation */}
            <div className="relative w-full h-44 rounded-2xl bg-slate-950/80 border border-slate-800/80 my-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                {/* Horizontal Road */}
                <rect x="0" y="40" width="300" height="40" fill="#0d1829" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#facc15" strokeDasharray="6 4" strokeWidth="1.5" />
                {/* Flowing Vehicles Moving Freely */}
                <rect x="240" y="45" width="14" height="10" rx="2" fill="#10b981" />
                <rect x="170" y="45" width="14" height="10" rx="2" fill="#10b981" />
                <rect x="90" y="45" width="14" height="10" rx="2" fill="#10b981" />

                {/* Green Signal Light */}
                <circle cx="210" cy="30" r="5" fill="#10b981" className="animate-ping" />
                <circle cx="210" cy="30" r="5" fill="#10b981" />
                <text x="220" y="33" fill="#34d399" fontSize="9" fontFamily="monospace">GREEN: Adaptive 48s</text>
              </svg>
            </div>

            {/* AI Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-mono block">Avg Waiting Time</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">51 sec</span>
                <span className="text-[10px] text-emerald-400 font-mono">↓ 37.8%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-mono block">Avg Travel Duration</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">12.7 min</span>
                <span className="text-[10px] text-emerald-400 font-mono">↓ 22.5%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-mono block">Junction Queue</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">29 veh</span>
                <span className="text-[10px] text-emerald-400 font-mono">↓ 38.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Impact Highlights */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Measured Digital Twin Impact Breakdown
        </h3>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 block">Waiting Time Reduction</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">
                ↓ 37.8%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 block">Commute Travel Time Saved</span>
              <span className="text-2xl font-extrabold font-mono text-cyan-400 mt-1 block">
                ↓ 22.5%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 block">Queue Length Dissipation</span>
              <span className="text-2xl font-extrabold font-mono text-purple-400 mt-1 block">
                ↓ 38.3%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 24-Hour Comparative Benchmark Curve */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3">
            Waiting Time Comparison Across 24-Hour Cycle (Seconds per Vehicle)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="baselineWait"
                  name="Baseline Wait Time (s)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="aiWait"
                  name="AI Optimized Wait Time (s)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

