import React, { useState } from 'react';
import { Camera, Intersection, Vehicle, EmergencyVehicle } from '../../types';
import { Layers, Video, Navigation, Ambulance, AlertCircle, Maximize2, Compass, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CityMapProps {
  cameras: Camera[];
  intersections: Intersection[];
  vehicles?: Vehicle[];
  emergencyVehicles?: EmergencyVehicle[];
  onSelectCamera?: (camera: Camera) => void;
  onSelectIntersection?: (intersection: Intersection) => void;
  selectedCameraId?: string;
  selectedIntersectionId?: string;
  height?: string;
  showControls?: boolean;
}

export const CityMap: React.FC<CityMapProps> = ({
  cameras,
  intersections,
  vehicles = [],
  emergencyVehicles = [],
  onSelectCamera,
  onSelectIntersection,
  selectedCameraId,
  selectedIntersectionId,
  height = 'h-[540px]',
  showControls = true
}) => {
  const [showCameras, setShowCameras] = useState(true);
  const [showIntersections, setShowIntersections] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showAmbulance, setShowAmbulance] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<{
    type: 'camera' | 'intersection' | 'vehicle' | 'ambulance';
    data: any;
    x: number;
    y: number;
  } | null>(null);

  // Tactical SVG Coordinates Projection
  // Base bounds for Bangalore / Demo metropolitan grid
  // Lat: 12.84 to 13.04 (Span ~0.20)
  // Lng: 77.53 to 77.73 (Span ~0.20)
  const minLat = 12.84;
  const maxLat = 13.04;
  const minLng = 77.53;
  const maxLng = 77.73;

  const projectCoords = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = 800 - ((lat - minLat) / (maxLat - minLat)) * 800;
    return { x: Math.max(30, Math.min(970, x)), y: Math.max(30, Math.min(770, y)) };
  };

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden bg-[#070d18] border border-slate-800 shadow-2xl group select-none flex flex-col justify-between`}>
      {/* Tactical Canvas / SVG Map Engine */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full object-cover"
          style={{ background: 'radial-gradient(ellipse at center, #0c1629 0%, #060a13 100%)' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 165, 233, 0.05)" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="rgba(14, 165, 233, 0.2)" />
            </pattern>

            {/* Radar glow */}
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.15)" />
              <stop offset="70%" stopColor="rgba(6, 182, 212, 0.03)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Road glow filters */}
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="800" fill="url(#tacticalGrid)" />

          {/* Major Urban Arterial Road Network */}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Outer Ring Road Express */}
            <path
              d="M 100 680 C 250 690, 480 620, 680 500 C 820 400, 880 250, 780 100"
              fill="none"
              stroke="#0f2942"
              strokeWidth="16"
              opacity="0.7"
            />
            <path
              d="M 100 680 C 250 690, 480 620, 680 500 C 820 400, 880 250, 780 100"
              fill="none"
              stroke="#1e40af"
              strokeWidth="4"
              strokeDasharray="8 6"
              opacity="0.5"
            />

            {/* MG Road Central Axis */}
            <line x1="200" y1="380" x2="800" y2="400" stroke="#162c46" strokeWidth="12" />
            <line x1="200" y1="380" x2="800" y2="400" stroke="#38bdf8" strokeWidth="2.5" opacity="0.6" />

            {/* Airport Road / NH44 North Corridor */}
            <line x1="450" y1="780" x2="480" y2="50" stroke="#162c46" strokeWidth="12" />
            <line x1="450" y1="780" x2="480" y2="50" stroke="#38bdf8" strokeWidth="2.5" opacity="0.6" />

            {/* Hosur Road South-East Diagonal */}
            <line x1="450" y1="400" x2="750" y2="750" stroke="#162c46" strokeWidth="12" />
            <line x1="450" y1="400" x2="750" y2="750" stroke="#38bdf8" strokeWidth="2.5" opacity="0.6" />

            {/* Indiranagar / Old Madras Link */}
            <line x1="300" y1="280" x2="850" y2="280" stroke="#162c46" strokeWidth="10" />
            <line x1="300" y1="280" x2="850" y2="280" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />

            {/* West Ring Road Link */}
            <line x1="120" y1="180" x2="250" y2="650" stroke="#162c46" strokeWidth="10" />
            <line x1="120" y1="180" x2="250" y2="650" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />

            {/* Congested Segments (Red/Amber Heat Polylines) */}
            {/* J12 to Silk Board Congestion Segment */}
            <line x1="560" y1="390" x2="480" y2="580" stroke="#ef4444" strokeWidth="5" opacity="0.75" filter="url(#glowRed)" />
            {/* NH66 Congestion Drop Segment */}
            <line x1="120" y1="260" x2="220" y2="340" stroke="#f59e0b" strokeWidth="4" opacity="0.7" />
          </g>

          {/* Emergency Green Wave Corridor Active Route */}
          {showAmbulance && emergencyVehicles.some((a) => a.priorityStatus === 'GREEN_CORRIDOR_ACTIVE') && (
            <g>
              <path
                d="M 380 340 L 460 380 L 560 440 L 520 560"
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                filter="url(#glowCyan)"
                strokeDasharray="10 6"
                className="animate-pulse"
              />
            </g>
          )}

          {/* Dynamic Intersections Nodes */}
          {showIntersections &&
            intersections.map((inter) => {
             const coordinates = inter.coordinates;

if (
  !Array.isArray(coordinates) ||
  coordinates.length < 2 ||
  typeof coordinates[0] !== 'number' ||
  typeof coordinates[1] !== 'number'
) {
  return null;
}

const pos = projectCoords(coordinates[0], coordinates[1]);
              const isSelected = selectedIntersectionId === inter.intersectionId;
              const isHighCongestion = inter.congestion > 75;

              return (
                <g
                  key={inter.intersectionId}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => onSelectIntersection && onSelectIntersection(inter)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                      type: 'intersection',
                      data: inter,
                      x: rect.left,
                      y: rect.top
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {/* Outer Radar Ripple */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 18 : 12}
                    fill={isHighCongestion ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.15)'}
                    stroke={isHighCongestion ? '#ef4444' : '#06b6d4'}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px`, animationDuration: '8s' }}
                  />

                  {/* Core Intersection Hub */}
                  <rect
                    x={pos.x - 7}
                    y={pos.y - 7}
                    width="14"
                    height="14"
                    rx="3"
                    fill={isHighCongestion ? '#991b1b' : '#0e3b5e'}
                    stroke={isHighCongestion ? '#f87171' : '#38bdf8'}
                    strokeWidth="1.5"
                  />

                  {/* Signal Light Indicator */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="3"
                    fill={inter.currentSignalPlan.currentPhase.includes('GREEN') ? '#10b981' : '#f59e0b'}
                  />

                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y - 12}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {inter.intersectionId}
                  </text>
                </g>
              );
            })}

          {/* Dynamic Camera Markers */}
          {showCameras &&
            cameras.map((cam) => {
              const pos = projectCoords(cam.latitude, cam.longitude);
              const isSelected = selectedCameraId === cam.cameraId;

              return (
                <g
                  key={cam.cameraId}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => onSelectCamera && onSelectCamera(cam)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                      type: 'camera',
                      data: cam,
                      x: rect.left,
                      y: rect.top
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {/* Field of View Cone */}
                  <path
                    d={`M ${pos.x} ${pos.y} L ${pos.x - 14} ${pos.y - 24} L ${pos.x + 14} ${pos.y - 24} Z`}
                    fill="rgba(6, 182, 212, 0.12)"
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="0.5"
                  />

                  {/* Camera Dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 6 : 4.5}
                    fill="#0284c7"
                    stroke="#e0f2fe"
                    strokeWidth="1"
                    filter="url(#glowCyan)"
                  />

                  <circle cx={pos.x} cy={pos.y} r="1.5" fill="#ffffff" />
                </g>
              );
            })}

          {/* Tracked Vehicles Markers */}
          {showVehicles &&
            vehicles.map((v, idx) => {
              // Interpolate approximate positions along corridors
              const positions = [
                { x: 380, y: 390 },
                { x: 470, y: 395 },
                { x: 570, y: 440 },
                { x: 510, y: 570 },
                { x: 670, y: 510 },
                { x: 460, y: 220 },
                { x: 230, y: 380 },
                { x: 180, y: 290 },
              ];
              const pos = positions[idx % positions.length];

              return (
                <g
                  key={v.vehicleId}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                      type: 'vehicle',
                      data: v,
                      x: rect.left,
                      y: rect.top
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <circle cx={pos.x} cy={pos.y} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                  <text
                    x={pos.x + 6}
                    y={pos.y + 3}
                    fill="#38bdf8"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {v.plateNumber}
                  </text>
                </g>
              );
            })}

          {/* Live Ambulance Priority Marker */}
{showAmbulance &&
  emergencyVehicles.map((amb) => {
  const ambulanceData = amb as EmergencyVehicle & {
  currentLat?: number;
  currentLng?: number;
};

const lat =
  ambulanceData.currentLat ??
  (Array.isArray(ambulanceData.currentCoords)
    ? ambulanceData.currentCoords[0]
    : undefined);

const lng =
  ambulanceData.currentLng ??
  (Array.isArray(ambulanceData.currentCoords)
    ? ambulanceData.currentCoords[1]
    : undefined);

    // Backend emergency data uses currentLat/currentLng.
    // Older mock data may still use currentCoords.
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return null;
    }

    const pos = projectCoords(lat, lng);
              return (
                <g
                  key={amb.ambulanceId}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                      type: 'ambulance',
                      data: amb,
                      x: rect.left,
                      y: rect.top
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    fill="rgba(239, 68, 68, 0.25)"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                  <circle cx={pos.x} cy={pos.y} r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    🚑
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y - 12}
                    fill="#f87171"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {amb.ambulanceId} ({amb.priorityStatus})
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Floating Tactical Header Bar */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Metropolitan Tactical Grid</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                24 CAM NODES
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">
              Live Spatiotemporal Vector Engine • Central Corridor Bounds
            </span>
          </div>
        </div>

        {/* Layer Toggles */}
        {showControls && (
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 backdrop-blur-md">
            <button
              onClick={() => setShowCameras((p) => !p)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all ${
                showCameras ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Cameras"
            >
              <Video className="w-3 h-3" />
              <span className="hidden sm:inline">Cameras</span>
            </button>

            <button
              onClick={() => setShowIntersections((p) => !p)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all ${
                showIntersections ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Intersections"
            >
              <Navigation className="w-3 h-3" />
              <span className="hidden sm:inline">Signals</span>
            </button>

            <button
              onClick={() => setShowAmbulance((p) => !p)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all ${
                showAmbulance ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Ambulance"
            >
              <Ambulance className="w-3 h-3" />
              <span className="hidden sm:inline">Corridors</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Tactical Footer Legend */}
      <div className="relative z-10 p-3 flex items-center justify-between bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
            <span>Active Camera</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
            <span>AI Signal Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span>Critical Congestion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span>Green Wave Priority</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 hidden sm:block">
          Click any camera or intersection for live telemetry
        </div>
      </div>
    </div>
  );
};

