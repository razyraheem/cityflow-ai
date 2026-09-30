import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { VEHICLE_TRAJECTORIES } from '../data/mockData';
import { TrajectoryMap } from '../components/map/TrajectoryMap';
import { VehicleTrajectory } from '../types';
import { Route, Search, SlidersHorizontal, MapPin, Clock, Gauge, ArrowRight, Video, Car, Sparkles } from 'lucide-react';

export const TrajectoriesPage: React.FC = () => {
  const { vehicles } = useSimulation();
  const [selectedPlate, setSelectedPlate] = useState<string>('KA19AB1234');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTrajectory: VehicleTrajectory = VEHICLE_TRAJECTORIES[selectedPlate] || VEHICLE_TRAJECTORIES['KA19AB1234'];

  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = filterType === 'ALL' || v.vehicleType === filterType;
    const matchesQuery = v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || v.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              City-Wide Vehicle Trajectory Reconstruction
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              SPATIAL GRAPH RECONSTRUCTION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Spatiotemporally reconstruct contiguous vehicle journey paths across multi-camera optical networks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Graph Connectivity: 99.4%</span>
        </div>
      </div>

      {/* Main Grid: Trajectory Map + Vehicle Selector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tactical Interactive Trajectory Animator */}
        <div className="lg:col-span-2 space-y-4">
          <TrajectoryMap trajectory={activeTrajectory} />

          {/* Selected Journey Telemetry Card */}
          {activeTrajectory && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      <span>{activeTrajectory.plateNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">
                        {activeTrajectory.vehicleType}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Journey: {activeTrajectory.origin} → {activeTrajectory.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">DURATION</span>
                    <span className="text-emerald-400 font-bold">{activeTrajectory.totalTravelTime}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">AVG SPEED</span>
                    <span className="text-amber-400 font-bold">{activeTrajectory.averageSpeed} km/h</span>
                  </div>
                </div>
              </div>

              {/* Waypoint Cameras Visited Sequence */}
              <div className="mt-4">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Multi-Camera Waypoint Hops:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeTrajectory.path.map((pt, i) => (
                    <div key={pt.cameraId} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                        <span className="text-cyan-400 font-bold">{pt.cameraId}</span>
                        <span className="text-slate-500">{pt.timestamp}</span>
                      </div>
                      <div className="text-slate-300 truncate font-sans text-[11px]">{pt.cameraName.split('-')[0]}</div>
                      <div className="text-emerald-400 font-mono text-[10px] mt-1">{pt.speed} km/h • {pt.confidence}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Vehicle Trajectory Selector & Filters */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              Filter Reconstructed Journeys
            </h3>

            {/* Type filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
              {['ALL', 'Car', 'Bus', 'Truck', 'Bike', 'Ambulance'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    filterType === t
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plate..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Vehicle List */}
            <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
              {filteredVehicles.map((veh) => {
                const isSelected = selectedPlate === veh.plateNumber;
                return (
                  <div
                    key={veh.vehicleId}
                    onClick={() => setSelectedPlate(veh.plateNumber)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">
                        {veh.plateNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {veh.vehicleType}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Node: {veh.currentCamera}</span>
                      <span className="text-amber-400 font-mono">{veh.speed} km/h</span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Re-ID: {veh.reIdScore}%</span>
                      <span className="text-cyan-400 flex items-center gap-1">
                        View Replay <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

