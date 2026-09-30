import React from 'react';
import { Camera } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { SimulatedCctvStream } from './SimulatedCctvStream';
import { Activity, Cpu, Shield, Wifi, HardDrive, Zap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CameraDetailsModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CameraDetailsModal: React.FC<CameraDetailsModalProps> = ({
  camera,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  if (!camera) return null;

  const handleTrackVehicle = (plate: string) => {
    onClose();
    navigate(`/vehicles?plate=${plate}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${camera.cameraId} — ${camera.name}`}
      subtitle={`${camera.road} • Zone: ${camera.zone}`}
      maxWidth="4xl"
      badge={<StatusBadge status={camera.status} variant={camera.status === 'ONLINE' ? 'green' : 'amber'} />}
    >
      <div className="space-y-5">
        {/* Expanded Live CCTV Feed */}
        <SimulatedCctvStream camera={camera} height="h-72" showDetails={true} interactive={true} />

        {/* Live Diagnostics & Health Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>Stream Latency</span>
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {camera.health.latencyMs} <span className="text-xs text-slate-400 font-sans">ms</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">0.0% Packet Loss</span>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Vehicles Detected</span>
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {camera.vehiclesDetected} <span className="text-xs text-slate-400 font-sans">veh/min</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Avg {camera.averageSpeed} km/h</span>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Congestion Level</span>
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {camera.congestion}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  camera.congestion > 75 ? 'bg-rose-500' : camera.congestion > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${camera.congestion}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edge AI Engine</span>
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {camera.opticalFlowRate}%
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Uptime {camera.health.uptime}</span>
          </div>
        </div>

        {/* Recent Real-Time ANPR Detections on this Camera */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Live Edge ANPR & Vehicle Detections
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-sync active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-2 font-medium">Plate Number</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Color</th>
                  <th className="pb-2 font-medium">Speed</th>
                  <th className="pb-2 font-medium">ANPR Conf.</th>
                  <th className="pb-2 font-medium">Timestamp</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {camera.recentDetections.map((det) => (
                  <tr key={det.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-cyan-300">
                      {det.plateNumber}
                    </td>
                    <td className="py-2.5 text-slate-300">{det.vehicleType}</td>
                    <td className="py-2.5 text-slate-400">{det.color}</td>
                    <td className="py-2.5 font-mono text-amber-300">{det.speed} km/h</td>
                    <td className="py-2.5 font-mono text-emerald-400">{det.confidence}%</td>
                    <td className="py-2.5 font-mono text-slate-400">{det.timestamp}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleTrackVehicle(det.plateNumber)}
                        className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                      >
                        <Search className="w-3 h-3" />
                        Track Re-ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] font-mono text-slate-400">
            GPS: [{camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}]
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            Close Feed
          </button>
        </div>
      </div>
    </Modal>
  );
};

