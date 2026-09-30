import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Incident, Camera } from '../types';
import { CameraDetailsModal } from '../components/cctv/CameraDetailsModal';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Activity,
  MapPin,
  Clock,
  Gauge,
  Layers,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { incidents, cameras, investigateIncident, resolveIncident } = useSimulation();
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<Camera | null>(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewLocation = (camId: string) => {
    const cam = cameras.find((c) => c.cameraId === camId);
    if (cam) setSelectedCameraForModal(cam);
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    const matchesQuery =
      inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.road.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesQuery;
  });

  const activeCount = incidents.filter((i) => i.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Traffic Incident & Anomaly Detection
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold">
              {activeCount} ACTIVE ANOMALIES
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Edge-optical anomaly detectors flagging rapid speed collapse, stationary vehicles, and counter-flow violations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident type, location, camera..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                filterSeverity === sev
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredIncidents.map((incident) => {
          const isResolved = incident.status === 'Resolved';
          const isInvestigating = incident.status === 'Investigating';

          return (
            <div
              key={incident.id}
              className={`rounded-2xl border p-5 shadow-xl transition-all flex flex-col justify-between ${
                isResolved
                  ? 'bg-slate-950/40 border-slate-800 opacity-70'
                  : incident.severity === 'CRITICAL'
                  ? 'bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border-rose-500/50 shadow-rose-950/20'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      {incident.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        incident.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : incident.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-semibold ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isInvestigating
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Incident Resolved
                      </>
                    ) : isInvestigating ? (
                      <>
                        <Activity className="w-3.5 h-3.5" /> Investigating
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Active Anomaly
                      </>
                    )}
                  </span>
                </div>

                {/* Incident Title & Details */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                    {incident.type}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {incident.cameraId} • {incident.road}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {incident.details}
                  </p>
                </div>

                {/* Quantitative Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono">
                  {incident.speedChange && (
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">SPEED DROP</span>
                      <span className="text-rose-400 font-bold mt-0.5 block">{incident.speedChange}</span>
                    </div>
                  )}

                  {incident.queueGrowth && (
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">QUEUE IMPACT</span>
                      <span className="text-amber-400 font-bold mt-0.5 block">{incident.queueGrowth}</span>
                    </div>
                  )}

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">AI CONFIDENCE</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block">{incident.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleViewLocation(incident.cameraId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  View Location
                </button>

                <div className="flex items-center gap-2">
                  {!isResolved && !isInvestigating && (
                    <button
                      onClick={() => investigateIncident(incident.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors"
                    >
                      Investigate
                    </button>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => resolveIncident(incident.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400">
                      ✓ Cleared at {incident.timestamp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Camera Live Modal */}
      <CameraDetailsModal
        camera={selectedCameraForModal}
        isOpen={Boolean(selectedCameraForModal)}
        onClose={() => setSelectedCameraForModal(null)}
      />
    </div>
  );
};

