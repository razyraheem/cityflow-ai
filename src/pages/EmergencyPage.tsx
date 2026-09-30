import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  Ambulance,
  Sparkles,
  Zap,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Route,
  Activity,
  Compass,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EmergencyPage: React.FC = () => {
  const { emergencyVehicles, activateEmergencyCorridor } = useSimulation();
  const [selectedAmbId, setSelectedAmbId] = useState('A17');
  const [isActivating, setIsActivating] = useState(false);

  const ambulance =
    emergencyVehicles.find((a) => a.ambulanceId === selectedAmbId) || emergencyVehicles[0];

  const isCorridorActive = ambulance.priorityStatus === 'GREEN_CORRIDOR_ACTIVE';

  const handleActivate = async () => {
    setIsActivating(true);
    await activateEmergencyCorridor(ambulance.ambulanceId);
    setTimeout(() => {
      setIsActivating(false);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Emergency Green Corridor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-red-400 text-xs font-mono font-bold">
              PRIORITY SIGNAL PREEMPTION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Coordinated traffic signal preemption creating a green wave clearance corridor for high-priority emergency vehicles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {emergencyVehicles.map((amb) => (
            <button
              key={amb.ambulanceId}
              onClick={() => setSelectedAmbId(amb.ambulanceId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                selectedAmbId === amb.ambulanceId
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ambulance className="w-4 h-4" />
              <span>Ambulance {amb.ambulanceId}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ambulance Mission Overview Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950 border border-red-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Ambulance className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-white font-mono">
                  AMBULANCE {ambulance.ambulanceId}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {ambulance.vehiclePlate}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
                <span className="text-slate-400">
                  Origin: <strong className="text-slate-200">{ambulance.currentLocation}</strong>
                </span>
                <span className="text-slate-600">→</span>
                <span className="text-slate-400">
                  Destination: <strong className="text-slate-200">{ambulance.destination}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border ${
                isCorridorActive
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-red-950/80 border-red-500/60 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              {isCorridorActive ? 'GREEN CORRIDOR ACTIVE' : 'EMERGENCY MISSION STANDBY'}
            </span>
          </div>
        </div>

        {/* ETA Comparison Numbers Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center sm:text-left">
            <span className="text-xs font-mono uppercase text-slate-400 block">Normal Unmanaged Route ETA</span>
            <div className="text-3xl font-extrabold font-mono text-slate-300 mt-2">
              {ambulance.normalETA} <span className="text-xs font-sans text-slate-500">mins</span>
            </div>
            <span className="text-[11px] text-rose-400 font-mono mt-1 block">Delayed by 4 Junction Queues</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-center sm:text-left shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold block">AI-Optimized Green Wave ETA</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">
              {ambulance.optimizedETA} <span className="text-xs font-sans text-emerald-500">mins</span>
            </div>
            <span className="text-[11px] text-emerald-300 font-mono mt-1 block">Synchronized Green Clearance</span>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/50 text-center sm:text-left shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold block">Time Saved for Critical Care</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-2">
              {ambulance.timeSaved} <span className="text-xs font-sans text-cyan-500">min savings</span>
            </div>
            <span className="text-[11px] text-cyan-300 font-mono mt-1 block">26.8% Transit Reduction</span>
          </div>
        </div>

        {/* Route Intersections Cascade Step Visualizer */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Route className="w-4 h-4 text-cyan-400" />
              Coordinated Corridor Intersections
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Hospital → J01 → J03 → J06 → J08 → District Emergency Center
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ambulance.intersections.map((node, idx) => {
              const isPriority = node.status === 'Priority';

              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 1 }}
                  animate={{ scale: isPriority ? [1, 1.02, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
                    isPriority
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      Step 0{idx + 1} • {node.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isPriority
                          ? 'bg-emerald-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {node.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-sans truncate">{node.name}</h4>
                  <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
                    <span>Dist: {node.distanceMeters}m</span>
                    <span className={isPriority ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      ETA: {node.etaSeconds}s
                    </span>
                  </div>

                  {/* Signal Light Indicator */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Signal State:</span>
                    <span className={isPriority ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {isPriority ? '🟢 GREEN WAVE CLEAR' : '🟡 STANDARD CYCLE'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Trigger Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400">
            {isCorridorActive ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                All 4 Corridor Nodes Synchronized in Simulation.
              </span>
            ) : (
              <span>Click below to execute autonomous sequential priority preemption.</span>
            )}
          </div>

          <button
            onClick={handleActivate}
            disabled={isActivating || isCorridorActive}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-95 ${
              isCorridorActive
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 cursor-default'
                : 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white shadow-red-500/30 animate-pulse'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            {isActivating
              ? 'Synchronizing Corridor Signals...'
              : isCorridorActive
              ? 'GREEN CORRIDOR ACTIVE'
              : 'ACTIVATE GREEN CORRIDOR'}
          </button>
        </div>

        {/* Prototype Disclaimer */}
        <div className="mt-4 text-[11px] font-mono text-slate-500 text-center italic">
          “Prototype simulation — integration with authorized municipal traffic infrastructure required for real-world deployment.”
        </div>
      </div>
    </div>
  );
};

