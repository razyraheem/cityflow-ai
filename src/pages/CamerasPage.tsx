import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Camera } from '../types';
import { SimulatedCctvStream } from '../components/cctv/SimulatedCctvStream';
import { CameraDetailsModal } from '../components/cctv/CameraDetailsModal';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Video,
  Search,
  SlidersHorizontal,
  Activity,
  Gauge,
  Zap,
  Eye,
  Maximize2,
  HardDrive,
  Cpu
} from 'lucide-react';

export const CamerasPage: React.FC = () => {
  const { cameras } = useSimulation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const zones = ['ALL', 'Central Business District', 'East Corridor', 'South Corridor', 'Tech Corridor', 'North Gateway', 'West Highway'];

  const filteredCameras = cameras.filter((cam) => {
    const matchesSearch =
      cam.cameraId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.road.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'ALL' || cam.zone.includes(selectedZone) || selectedZone.includes(cam.zone);
    return matchesSearch && matchesZone;
  });

  const onlineCount = cameras.filter((c) => c.status === 'ONLINE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Multi-Camera Network
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              {onlineCount} / {cameras.length} ONLINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            City-wide edge optical perception nodes running synchronized ANPR, vector flow, and vehicle re-identification.
          </p>
        </div>

        {/* Global stats pills */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Avg Latency: 15ms</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>4K Edge AI Stream</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Camera ID or Location..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                selectedZone === zone
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* 24 Cameras Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCameras.map((camera) => (
          <div
            key={camera.cameraId}
            className="group rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden shadow-xl hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between"
          >
            {/* Simulated Live Stream Preview */}
            <div className="relative cursor-pointer" onClick={() => setSelectedCamera(camera)}>
              <SimulatedCctvStream camera={camera} height="h-48" showDetails={false} interactive={false} />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xl">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Inspect Telemetry & ANPR
                </span>
              </div>
            </div>

            {/* Camera Card Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-400">{camera.cameraId}</span>
                    <StatusBadge status={camera.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 font-sans truncate max-w-[220px]">
                    {camera.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{camera.road}</p>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {camera.zone.split(' ')[0]}
                </span>
              </div>

              {/* Real-time telemetry metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono block">Vehicles</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">
                    {camera.vehiclesDetected}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono block">Speed</span>
                  <span className="font-mono font-bold text-amber-400 mt-0.5 block">
                    {camera.averageSpeed} km/h
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono block">Congestion</span>
                  <span
                    className={`font-mono font-bold mt-0.5 block ${
                      camera.congestion > 75 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {camera.congestion}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setSelectedCamera(camera)}
                  className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Feed
                </button>
                <button
                  onClick={() => setSelectedCamera(camera)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  View Detections
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Modal */}
      <CameraDetailsModal
        camera={selectedCamera}
        isOpen={Boolean(selectedCamera)}
        onClose={() => setSelectedCamera(null)}
      />
    </div>
  );
};

