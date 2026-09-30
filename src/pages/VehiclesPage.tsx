import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { Vehicle, VehicleTrajectory } from '../types';
import { VEHICLE_TRAJECTORIES } from '../data/mockData';
import {
  Car,
  Search,
  Shield,
  Route,
  Clock,
  Gauge,
  Video,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const VehiclesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vehicles } = useSimulation();
  const { addToast } = useToast();

  const initialPlate = searchParams.get('plate') || 'KA19AB1234';
  const [searchQuery, setSearchQuery] = useState(initialPlate);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('ALL');

  useEffect(() => {
    const found = vehicles.find(
      (v) => v.plateNumber.toUpperCase() === searchQuery.toUpperCase().trim()
    );
    if (found) {
      setSelectedVehicle(found);
    } else if (vehicles.length > 0) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [searchQuery, vehicles]);

  const trajectory = selectedVehicle ? VEHICLE_TRAJECTORIES[selectedVehicle.plateNumber] || null : null;

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setSearchQuery(v.plateNumber);
    setSearchParams({ plate: v.plateNumber });
  };

  const handleExportEvidence = () => {
    addToast(
      'Re-ID Forensic Dossier Exported',
      `Exported cryptographically signed cross-camera tracking record for ${selectedVehicle?.plateNumber} (PDF/CSV).`,
      'success',
      4000
    );
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesFilter = vehicleTypeFilter === 'ALL' || v.vehicleType === vehicleTypeFilter;
    const matchesQuery =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter || matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Vehicle Intelligence & Spatiotemporal Re-ID
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              CROSS-CAMERA MATCH ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            AI-driven vehicle re-identification fusing OCR plate recognition, deep visual embedding, and temporal graph consistency.
          </p>
        </div>

        <button
          onClick={handleExportEvidence}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Export Forensic Evidence
        </button>
      </div>

      {/* Prominent Search Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 shadow-2xl">
        <label className="block text-xs font-bold font-mono uppercase tracking-wider text-cyan-400 mb-2">
          Search Target Registration Number
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. KA19AB1234, KA01MN4587, KL14Q7788..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all uppercase tracking-widest shadow-inner"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['KA19AB1234', 'KA01MN4587', 'KL14Q7788', 'KA19EM0001'].map((plate) => (
              <button
                key={plate}
                onClick={() => {
                  setSearchQuery(plate);
                  setSearchParams({ plate });
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  selectedVehicle?.plateNumber === plate
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {plate}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Vehicle Profile & Re-ID Analytics */}
      {selectedVehicle ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vehicle Profile Card */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 absolute top-0 left-0" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Target Profile</span>
                  <h2 className="text-xl font-bold font-mono text-white mt-0.5">
                    {selectedVehicle.vehicleId}
                  </h2>
                </div>
                <div className="px-3 py-1 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-sm font-bold tracking-wider">
                  {selectedVehicle.plateNumber}
                </div>
              </div>

              {/* Attributes List */}
              <div className="mt-4 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Vehicle Classification</span>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {selectedVehicle.vehicleType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Detected Color</span>
                  <span className="font-bold text-white">{selectedVehicle.color}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Make / Model</span>
                  <span className="font-bold text-slate-200">{selectedVehicle.makeModel}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">ANPR Confidence</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedVehicle.confidence}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Current Optical Node</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {selectedVehicle.currentCamera}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Estimated Speed</span>
                  <span className="font-mono font-bold text-amber-400">
                    {selectedVehicle.speed} km/h
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">First Sighted</span>
                  <span className="font-mono text-slate-300">{selectedVehicle.firstSeen}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Last Sighted</span>
                  <span className="font-mono text-slate-300">{selectedVehicle.lastSeen}</span>
                </div>
              </div>

              {/* Jump to Trajectory Map */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => navigate('/trajectories')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Route className="w-4 h-4 fill-current" />
                  Reconstruct City-Wide Trajectory
                </button>
              </div>
            </div>

            {/* Re-ID Feature Vector Meter */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Multi-Modal Re-ID Confidence
                </h3>
                <span className="text-sm font-mono font-extrabold text-emerald-400">
                  {selectedVehicle.reIdScore}% Match
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Plate OCR Similarity</span>
                    <span className="text-emerald-400 font-bold">{selectedVehicle.reIdBreakdown.plateSimilarity}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${selectedVehicle.reIdBreakdown.plateSimilarity}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Appearance & Geometry Match</span>
                    <span className="text-cyan-400 font-bold">{selectedVehicle.reIdBreakdown.appearanceSimilarity}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${selectedVehicle.reIdBreakdown.appearanceSimilarity}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Time & Kinematic Consistency</span>
                    <span className="text-indigo-400 font-bold">{selectedVehicle.reIdBreakdown.timeConsistency}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${selectedVehicle.reIdBreakdown.timeConsistency}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Route Topology Consistency</span>
                    <span className="text-purple-400 font-bold">{selectedVehicle.reIdBreakdown.routeConsistency}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${selectedVehicle.reIdBreakdown.routeConsistency}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Cross-Camera Detection Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold font-sans text-white">
                    Cross-Camera Detection Timeline
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sequential multi-hop optical detections verified by the spatio-temporal graph engine.
                  </p>
                </div>

                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {trajectory?.camerasVisited.length || 4} Hops Recorded
                </span>
              </div>

              {/* Vertical Animated Timeline */}
              <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-emerald-500">
                {trajectory?.path.map((point, idx) => (
                  <div key={point.cameraId} className="relative flex items-start gap-4">
                    {/* Node Dot */}
                    <div className="relative z-10 w-10 h-10 rounded-xl bg-slate-950 border-2 border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-300 text-xs shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                      0{idx + 1}
                    </div>

                    {/* Timeline Item Card */}
                    <div className="flex-1 rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 hover:border-cyan-500/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <span className="text-xs font-bold font-mono text-cyan-400">
                            {point.cameraId}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{point.cameraName}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            🕒 {point.timestamp}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 font-bold">
                            {point.confidence}% Conf.
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                        <span>Radar Speed: <strong className="text-amber-400">{point.speed} km/h</strong></span>
                        <span>•</span>
                        <span>Optical Flow: <strong className="text-cyan-400">Tracked</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Recognized Vehicles Quick Table */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                  Recent Multi-Camera Target Database
                </h3>
                <span className="text-xs font-mono text-slate-400">{vehicles.length} Vehicles In Memory</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <th className="pb-2">Target ID</th>
                      <th className="pb-2">Plate</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Color</th>
                      <th className="pb-2">Location</th>
                      <th className="pb-2">Speed</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredVehicles.slice(0, 5).map((v) => (
                      <tr key={v.vehicleId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-mono text-slate-400">{v.vehicleId}</td>
                        <td className="py-2.5 font-mono font-bold text-cyan-300">{v.plateNumber}</td>
                        <td className="py-2.5 text-slate-300">{v.vehicleType}</td>
                        <td className="py-2.5 text-slate-400">{v.color}</td>
                        <td className="py-2.5 font-mono text-slate-400">{v.currentCamera}</td>
                        <td className="py-2.5 font-mono text-amber-300">{v.speed} km/h</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleSelectVehicle(v)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 font-mono">
          No matching vehicle found in the selected time window.
        </div>
      )}
    </div>
  );
};

