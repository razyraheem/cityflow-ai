import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { useSimulation } from '../../context/SimulationContext';
import { CheckCircle, ArrowRight, ArrowLeft, Play, Sparkles, Navigation, ShieldCheck } from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { applyAiSignalPlan, activateEmergencyCorridor } = useSimulation();
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: '1. City-Wide Command Center (Dashboard)',
      route: '/dashboard',
      desc: 'Start at the high-density City Traffic Intelligence dashboard. Notice the live 24/24 cameras online, 12,482+ vehicles tracked, real-time tactical map, and the 8-stage AI perception pipeline.',
      actionLabel: 'Go to Dashboard',
      action: () => navigate('/dashboard')
    },
    {
      title: '2. Multi-Camera Network Overview',
      route: '/cameras',
      desc: 'Inspect the 24 optical nodes spanning the city. Each camera runs edge optical flow vectors, real-time vehicle classification, and ANPR plate character recognition.',
      actionLabel: 'Explore Camera Grid',
      action: () => navigate('/cameras')
    },
    {
      title: '3. Search & Track Vehicle KA19AB1234',
      route: '/vehicles?plate=KA19AB1234',
      desc: 'Search for target vehicle KA19AB1234. Review the AI re-identification confidence (96.4% cross-camera match) with plate, color, temporal, and route consistency breakdown.',
      actionLabel: 'Search KA19AB1234',
      action: () => navigate('/vehicles?plate=KA19AB1234')
    },
    {
      title: '4. Cross-Camera Trajectory Reconstruction',
      route: '/trajectories',
      desc: 'Reconstruct the full journey across CAM-001 → CAM-003 → CAM-006 → CAM-009. Click "Replay Journey" to watch the animated vehicle marker trace the path in real-time.',
      actionLabel: 'Replay Trajectory',
      action: () => navigate('/trajectories')
    },
    {
      title: '5. Urban Traffic Analytics & Hotspots',
      route: '/analytics',
      desc: 'Examine macro analytics: 5 Recharts flow curves, modal vehicle splits, and the Hotspot Ranking identifying Intersection J12 at 92% and J08 at 87% capacity.',
      actionLabel: 'View Analytics',
      action: () => navigate('/analytics')
    },
    {
      title: '6. Predictive Congestion Intelligence',
      route: '/prediction',
      desc: 'View the predictive forecast for Intersection J12: current congestion (78%) climbing to 86% in +5 min and 94% critical bottleneck in +10 min.',
      actionLabel: 'View Prediction',
      action: () => navigate('/prediction')
    },
    {
      title: '7. Adaptive Signal Optimization',
      route: '/signals',
      desc: 'Inspect the 4-way intersection visualizer for J12. Compare baseline 30s/30s timing with AI recommended 48s NS / 22s EW plan. Click "APPLY AI PLAN" in simulation.',
      actionLabel: 'Optimize Signals & Apply',
      action: async () => {
        navigate('/signals');
        await applyAiSignalPlan('J12');
      }
    },
    {
      title: '8. Emergency Green Corridor (Ambulance A17)',
      route: '/emergency',
      desc: 'Coordinate priority response for Ambulance A17 (City Hospital → District Emergency Center). Click "ACTIVATE GREEN CORRIDOR" to trigger sequential green-wave preempt on J01 → J03 → J06 → J08.',
      actionLabel: 'Trigger Green Wave Priority',
      action: async () => {
        navigate('/emergency');
        await activateEmergencyCorridor('A17');
      }
    },
    {
      title: '9. Digital Twin & Simulated Validation',
      route: '/simulation',
      desc: 'Validate city-wide impact on the Digital Twin: 38% wait time reduction (82s → 51s), 22% travel time savings (16.4m → 12.7m), and 38% queue reduction.',
      actionLabel: 'Inspect Digital Twin',
      action: () => navigate('/simulation')
    }
  ];

  const step = demoSteps[currentStep];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      demoSteps[nextIdx].action();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      demoSteps[prevIdx].action();
    }
  };

  const handleExecuteCurrent = () => {
    step.action();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SIH 2026 Interactive Evaluation Tour"
      subtitle="Step-by-step demonstration walkthrough for judges & evaluators"
      maxWidth="3xl"
      badge={
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          SIH26127 DEMO FLOW
        </span>
      }
    >
      <div className="space-y-6">
        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 border-b border-slate-800">
          {demoSteps.map((s, idx) => (
            <button
              key={s.title}
              onClick={() => {
                setCurrentStep(idx);
                demoSteps[idx].action();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
                currentStep === idx
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : idx < currentStep
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/40 text-slate-500 hover:text-slate-300'
              }`}
            >
              {idx < currentStep ? (
                <CheckCircle className="w-3 h-3 text-emerald-400" />
              ) : (
                <span>0{idx + 1}</span>
              )}
            </button>
          ))}
        </div>

        {/* Current Active Step Box */}
        <div className="rounded-xl bg-slate-950/70 border border-cyan-500/30 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Navigation className="w-24 h-24 text-cyan-400" />
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-semibold">
              Demo Phase {currentStep + 1} of {demoSteps.length}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Route: {step.route}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">{step.desc}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExecuteCurrent}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {step.actionLabel}
            </button>
          </div>
        </div>

        {/* SIH Core Innovation Pill */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Key Pitch to Evaluators: </span>
            CITYFLOW AI transcends isolated ANPR by fusing multi-camera spatiotemporal graphs to reconstruct trajectories, accurately forecast congestion 15 minutes ahead, and dynamically actuate signal waves.
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white bg-slate-800/60'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              Close Guide
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              {currentStep === demoSteps.length - 1 ? 'Finish Tour' : 'Next Step'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

