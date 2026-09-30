import React, { useState, useEffect } from 'react';
import { VehicleTrajectory, TrajectoryPoint } from '../../types';
import { Play, Pause, RotateCcw, Compass, MapPin, FastForward, CheckCircle2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrajectoryMapProps {
  trajectory: VehicleTrajectory | null;
  onReplayComplete?: () => void;
}

export const TrajectoryMap: React.FC<TrajectoryMapProps> = ({ trajectory }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [activeHopIndex, setActiveHopIndex] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    let animationFrame: number;
    if (isPlaying) {
      const step = 0.4 * speedMultiplier;
      const animate = () => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + step;
        });
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, speedMultiplier]);

  // Derive current position and active waypoint
  const path = trajectory?.path || [];

  const minLat = 12.88;
  const maxLat = 13.04;
  const minLng = 77.55;
  const maxLng = 77.72;

  const projectCoords = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    const y = 500 - ((lat - minLat) / (maxLat - minLat)) * 500;
    return { x: Math.max(50, Math.min(750, x)), y: Math.max(50, Math.min(450, y)) };
  };

  const svgPoints = path.map((pt) => projectCoords(pt.latitude, pt.longitude));

  // Compute interpolated vehicle coordinate along multi-segment path
  const getInterpolatedPosition = (pct: number) => {
    if (svgPoints.length < 2) return { x: 400, y: 250, currentSpeed: 35 };
    const totalSegments = svgPoints.length - 1;
    const scaledPct = (pct / 100) * totalSegments;
    const segIdx = Math.min(Math.floor(scaledPct), totalSegments - 1);
    const segT = scaledPct - segIdx;

    const p0 = svgPoints[segIdx];
    const p1 = svgPoints[segIdx + 1];

    const x = p0.x + (p1.x - p0.x) * segT;
    const y = p0.y + (p1.y - p0.y) * segT;

    const pt0 = path[segIdx];
    const pt1 = path[segIdx + 1];
    const currentSpeed = Math.round(pt0.speed + (pt1.speed - pt0.speed) * segT);

    return { x, y, currentSpeed, currentCam: pt0.cameraName };
  };

  const currentVehiclePos = getInterpolatedPosition(progress);

  const handleStartReplay = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  if (!trajectory) {
    return (
      <div className="h-96 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-sm">
        Select a vehicle to inspect cross-camera trajectory reconstruction.
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl bg-[#080e1b] border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Tactical Canvas for Trajectory Replay */}
      <div className="relative w-full h-[440px] overflow-hidden">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full object-cover"
          style={{ background: 'radial-gradient(ellipse at center, #0e1a30 0%, #060a13 100%)' }}
        >
          <defs>
            <pattern id="trajGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.04)" strokeWidth="0.5" />
            </pattern>
            <filter id="trajGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid */}
          <rect width="800" height="500" fill="url(#trajGrid)" />

          {/* City Context Roads Background (Subtle) */}
          <path
            d="M 80 420 Q 300 450, 480 320 T 720 120"
            fill="none"
            stroke="#162c46"
            strokeWidth="12"
            opacity="0.4"
          />
          <line x1="100" y1="200" x2="700" y2="280" stroke="#162c46" strokeWidth="8" opacity="0.3" />

          {/* Full Trajectory Ground Truth Polyline */}
          {svgPoints.length > 1 && (
            <g>
              <polyline
                points={svgPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#0284c7"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
              <polyline
                points={svgPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          )}

          {/* Camera Waypoint Nodes along Trajectory */}
          {path.map((pt, idx) => {
            const ptPos = svgPoints[idx];
            const isReached = progress >= (idx / (path.length - 1)) * 100;

            return (
              <g key={pt.cameraId} className="transition-all">
                {/* Field-of-view pulse when reached */}
                {isReached && (
                  <circle
                    cx={ptPos.x}
                    cy={ptPos.y}
                    r="18"
                    fill="rgba(6, 182, 212, 0.15)"
                    stroke="#06b6d4"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    className="animate-spin"
                    style={{ transformOrigin: `${ptPos.x}px ${ptPos.y}px`, animationDuration: '6s' }}
                  />
                )}

                {/* Waypoint Marker Pin */}
                <circle
                  cx={ptPos.x}
                  cy={ptPos.y}
                  r="7"
                  fill={isReached ? '#06b6d4' : '#1e293b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  filter="url(#trajGlow)"
                />

                <circle cx={ptPos.x} cy={ptPos.y} r="2" fill="#ffffff" />

                {/* Waypoint Labels */}
                <text
                  x={ptPos.x}
                  y={ptPos.y - 12}
                  fill={isReached ? '#38bdf8' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pt.cameraId} ({pt.timestamp})
                </text>
                <text
                  x={ptPos.x}
                  y={ptPos.y + 18}
                  fill="#cbd5e1"
                  fontSize="8"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  opacity="0.8"
                >
                  {pt.cameraName.split('-')[0]}
                </text>
              </g>
            );
          })}

          {/* Active Moving Animated Vehicle Marker */}
          {svgPoints.length > 0 && (
            <g
              transform={`translate(${currentVehiclePos.x}, ${currentVehiclePos.y})`}
              className="transition-transform duration-75"
            >
              {/* Radar ring */}
              <circle r="20" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1" className="animate-ping" />
              <circle r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" filter="url(#trajGlow)" />
              <circle r="3" fill="#ffffff" />

              {/* Dynamic Vehicle HUD Floating Card */}
              <g transform="translate(14, -28)">
                <rect width="130" height="42" rx="6" fill="#020617" stroke="#f59e0b" strokeWidth="1" opacity="0.95" />
                <text x="8" y="15" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  {trajectory.plateNumber}
                </text>
                <text x="8" y="32" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                  {currentVehiclePos.currentSpeed} km/h • {trajectory.vehicleType}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Top Floating Telemetry Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md pointer-events-auto flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">Tracked Target</span>
              <div className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <span>{trajectory.plateNumber}</span>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  {trajectory.vehicleType} ({trajectory.color})
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md pointer-events-auto flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Path</span>
              <span className="font-bold text-slate-200">{trajectory.camerasVisited.length} Cameras</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Avg Speed</span>
              <span className="font-bold text-amber-400">{trajectory.averageSpeed} km/h</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Travel Duration</span>
              <span className="font-bold text-emerald-400">{trajectory.totalTravelTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Replay Control Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={isPlaying ? () => setIsPlaying(false) : handleStartReplay}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Pause Replay
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Replay Journey
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset to origin"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed multiplier */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2 py-1 rounded-lg ${speedMultiplier === 1 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              1x
            </button>
            <button
              onClick={() => setSpeedMultiplier(2)}
              className={`px-2 py-1 rounded-lg ${speedMultiplier === 2 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              2x
            </button>
            <button
              onClick={() => setSpeedMultiplier(4)}
              className={`px-2 py-1 rounded-lg ${speedMultiplier === 4 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              4x
            </button>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="flex-1 w-full max-w-md flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">{trajectory.startTime}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[11px] font-mono text-slate-400">{trajectory.endTime}</span>
        </div>
      </div>
    </div>
  );
};

