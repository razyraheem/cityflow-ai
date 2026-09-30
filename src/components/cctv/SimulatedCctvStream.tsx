import React, { useState, useEffect } from 'react';
import { Camera as CameraIcon, Shield, Radio, Layers, RefreshCw } from 'lucide-react';
import { Camera } from '../../types';

interface SimulatedCctvStreamProps {
  camera: Camera;
  height?: string;
  showDetails?: boolean;
  interactive?: boolean;
}

export const SimulatedCctvStream: React.FC<SimulatedCctvStreamProps> = ({
  camera,
  height = 'h-52',
  showDetails = true,
  interactive = true
}) => {
  const [streamMode, setStreamMode] = useState<'RGB' | 'ANPR_HUD' | 'OPTICAL_FLOW'>('ANPR_HUD');
  const [hudTick, setHudTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHudTick((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Generates randomized bounding box positions for vehicles detected on camera
  const vehicles = camera.recentDetections || [];

  return (
    <div className={`relative w-full ${height} rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-between select-none group shadow-inner`}>
      {/* CCTV Camera Background Simulation */}
      <div className="absolute inset-0 bg-[#070e1b]">
        {/* Road & Perspective lines */}
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`roadGrad-${camera.cameraId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
            </linearGradient>
            <pattern id={`grid-${camera.cameraId}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Optical Matrix Grid */}
          <rect width="100%" height="100%" fill={`url(#grid-${camera.cameraId})`} />

          {/* Perspective Horizon */}
          <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Road Perspective */}
          <polygon points="120,70 280,70 380,200 20,200" fill={`url(#roadGrad-${camera.cameraId})`} stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
          
          {/* Lane Markings */}
          <line x1="200" y1="70" x2="200" y2="200" stroke="#facc15" strokeWidth="1.5" strokeDasharray="10 8" opacity="0.6" />
          <line x1="160" y1="70" x2="110" y2="200" stroke="#ffffff" strokeWidth="1" strokeDasharray="8 8" opacity="0.4" />
          <line x1="240" y1="70" x2="290" y2="200" stroke="#ffffff" strokeWidth="1" strokeDasharray="8 8" opacity="0.4" />

          {/* Optical Flow Vectors if active */}
          {streamMode === 'OPTICAL_FLOW' && (
            <g stroke="#06b6d4" strokeWidth="1.5" opacity="0.8">
              <line x1="140" y1="130" x2="135" y2="160" markerEnd="url(#arrow)" />
              <line x1="210" y1="110" x2="208" y2="145" />
              <line x1="260" y1="120" x2="265" y2="155" />
              <circle cx="135" cy="160" r="2" fill="#06b6d4" />
              <circle cx="208" cy="145" r="2" fill="#06b6d4" />
              <circle cx="265" cy="155" r="2" fill="#06b6d4" />
            </g>
          )}
        </svg>

        {/* Dynamic Simulated AI Bounding Boxes */}
        <div className="absolute inset-0 pointer-events-none p-4">
          {vehicles.slice(0, 3).map((v, i) => {
            const positions = [
              { left: '22%', top: '48%', width: '100px', height: '55px' },
              { left: '55%', top: '35%', width: '85px', height: '50px' },
              { left: '72%', top: '55%', width: '95px', height: '52px' },
            ];
            const pos = positions[i] || positions[0];

            return (
              <div
                key={v.id || i}
                className="absolute border border-cyan-400/80 bg-cyan-500/10 rounded transition-all duration-700"
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  height: pos.height,
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.25)'
                }}
              >
                {/* Crosshairs on corners */}
                <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

                {/* Tag Overlay */}
                <div className="absolute -top-6 left-0 bg-slate-900/95 border border-cyan-500/60 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 flex items-center gap-1 shadow-md whitespace-nowrap">
                  <span className="font-bold text-white">{v.plateNumber}</span>
                  <span className="text-emerald-400">{v.confidence}%</span>
                  <span className="text-amber-400 font-sans">{v.speed}km/h</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent pointer-events-none animate-scanline" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
      </div>

      {/* Top CCTV HUD */}
      <div className="relative z-10 p-3 flex items-start justify-between bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-[10px] font-mono text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE REC</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wider">
            {camera.cameraId}
          </span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            [{camera.resolution}]
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {interactive && (
            <div className="flex rounded-lg bg-slate-900/90 border border-slate-800 p-0.5">
              <button
                onClick={() => setStreamMode('ANPR_HUD')}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                  streamMode === 'ANPR_HUD' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                ANPR
              </button>
              <button
                onClick={() => setStreamMode('OPTICAL_FLOW')}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                  streamMode === 'OPTICAL_FLOW' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                FLOW
              </button>
              <button
                onClick={() => setStreamMode('RGB')}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                  streamMode === 'RGB' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                RAW
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Reticle / HUD */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-16 h-16 border border-cyan-400/40 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-cyan-400 rounded-full" />
        </div>
      </div>

      {/* Bottom CCTV HUD */}
      <div className="relative z-10 p-3 flex items-end justify-between bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent text-[10px] font-mono text-slate-300">
        <div>
          <div className="text-white font-medium truncate max-w-[200px] text-xs font-sans">
            {camera.name}
          </div>
          <div className="text-slate-400 flex items-center gap-2 mt-0.5">
            <span>FPS: {camera.fps}</span>
            <span>LAT: {camera.health.latencyMs}ms</span>
            <span className="text-cyan-400">FLOW: {camera.opticalFlowRate}%</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-cyan-300 font-mono">
            {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-emerald-400 text-[10px] font-mono">
            ANPR CONF: 98.4%
          </div>
        </div>
      </div>
    </div>
  );
};

