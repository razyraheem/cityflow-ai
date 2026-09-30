import React from 'react';
import { Camera, Eye, Cpu, Network, Route, BarChart3, Sparkles, Sliders, Ambulance, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

export const PipelineVisualizer: React.FC = () => {
  const steps = [
    { label: 'CCTV Feeds', sub: 'Perceive', icon: Camera, color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10' },
    { label: 'ANPR & OCR', sub: 'Identify', icon: Cpu, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
    { label: 'Vehicle Re-ID', sub: 'Connect', icon: Network, color: 'text-indigo-400', border: 'border-indigo-500/40', bg: 'bg-indigo-500/10' },
    { label: 'Trajectories', sub: 'Understand', icon: Route, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
    { label: 'Urban Analytics', sub: 'Quantify', icon: BarChart3, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
    { label: 'AI Prediction', sub: 'Forecast', icon: Sparkles, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
    { label: 'Adaptive Signals', sub: 'Optimize', icon: Sliders, color: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-500/10' },
    { label: 'Green Corridor', sub: 'Respond', icon: Ambulance, color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
    { label: 'Digital Twin', sub: 'Measure', icon: Gauge, color: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-500/10' }
  ];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              City Intelligence Perception Pipeline
            </h3>
            <p className="text-[11px] text-slate-400">
              Cross-Camera Optical Fusion → Re-ID Trajectory Graph → Multi-Agent Predictive Actuation
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          ACTIVE STREAM SYNC
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 hover:scale-[1.02] ${step.bg} ${step.border}`}
            >
              <div className={`p-1.5 rounded-lg mb-1.5 ${step.color} bg-slate-950/60 border border-slate-800`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 tracking-tight leading-none truncate w-full">
                {step.label}
              </span>
              <span className={`text-[9px] font-mono uppercase mt-1 font-semibold ${step.color}`}>
                {step.sub}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

