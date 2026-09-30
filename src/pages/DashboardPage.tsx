import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityFlowWebSocket } from '../services/WebSocket';

import {
  Video,
  Car,
  AlertTriangle,
  Activity,
  Gauge,
  Ambulance,
  ArrowRight,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import { useSimulation } from '../context/SimulationContext';
import { KpiCard } from '../components/common/KpiCard';
import { PipelineVisualizer } from '../components/common/PipelineVisualizer';
import { CityMap } from '../components/map/CityMap';
import { CameraDetailsModal } from '../components/cctv/CameraDetailsModal';

import { Camera, Intersection } from '../types';
import { TIME_SERIES_TRAFFIC } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    cameras,
    vehicles,
    intersections,
    emergencyVehicles,
    alerts,
    totalTrackedVehicles,
    cityAvgSpeed,
    cityCongestionIndex,
    activeAlertsCount
  } = useSimulation();

  // --------------------------------------------------
  // Existing UI state
  // --------------------------------------------------

  const [selectedCamera, setSelectedCamera] =
    useState<Camera | null>(null);

  const [selectedIntersection, setSelectedIntersection] =
    useState<Intersection | null>(null);

  // --------------------------------------------------
  // LIVE WEBSOCKET STATE
  // --------------------------------------------------

  const [liveVehicleCount, setLiveVehicleCount] =
    useState<number | null>(null);

  const [liveAverageSpeed, setLiveAverageSpeed] =
    useState<number | null>(null);

  // --------------------------------------------------
  // CAMERA ONLINE COUNT
  // --------------------------------------------------

  const onlineCameras = cameras.filter(
    (camera) => camera.status === 'ONLINE'
  ).length;

  // --------------------------------------------------
  // SUBSCRIBE TO CITYFLOW traffic.updated
  // --------------------------------------------------

  useEffect(() => {
    /**
     * Stores the latest telemetry received
     * from every camera.
     *
     * Map key:
     *   CAM-001
     *   CAM-002
     *   etc.
     *
     * This prevents double-counting when
     * the same camera sends another update.
     */
    const cameraTelemetry = new Map<
      string,
      {
        vehiclesDetected: number;
        averageSpeed: number;
      }
    >();

    const unsubscribe = cityFlowWebSocket.subscribe((event) => {
      // We only care about traffic.updated
      if (event.event !== 'traffic.updated') {
        return;
      }

      const data = event.data;

      // Basic validation
      if (!data?.cameraId) {
        return;
      }

      // ------------------------------------------------
      // UPDATE THIS CAMERA
      // ------------------------------------------------

      cameraTelemetry.set(data.cameraId, {
        vehiclesDetected: Number(
          data.vehiclesDetected || 0
        ),

        averageSpeed: Number(
          data.averageSpeed || 0
        )
      });

      // ------------------------------------------------
      // GET LATEST DATA FROM ALL CAMERAS
      // THAT HAVE REPORTED
      // ------------------------------------------------

      const cameraValues =
        Array.from(cameraTelemetry.values());

      if (cameraValues.length === 0) {
        return;
      }

      // ------------------------------------------------
      // TOTAL VEHICLE DETECTIONS
      // ------------------------------------------------

      const totalVehicles =
        cameraValues.reduce(
          (total, camera) =>
            total + camera.vehiclesDetected,
          0
        );

      // ------------------------------------------------
      // AVERAGE SPEED
      // ------------------------------------------------

      const totalSpeed =
        cameraValues.reduce(
          (total, camera) =>
            total + camera.averageSpeed,
          0
        );

      const averageSpeed =
        totalSpeed / cameraValues.length;

      // ------------------------------------------------
      // UPDATE REACT STATE
      // ------------------------------------------------

      setLiveVehicleCount(totalVehicles);

      setLiveAverageSpeed(
        Number(averageSpeed.toFixed(1))
      );
    });

    // ------------------------------------------------
    // CLEANUP
    // ------------------------------------------------

    return () => {
      unsubscribe();
    };
  }, []);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2.5">

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              City Traffic Intelligence
            </h1>

            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              SIH26127 COMMAND
            </span>

          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Real-time multi-camera perception, trajectory intelligence and predictive traffic management.
          </p>

        </div>

        {/* Product Positioning */}

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 max-w-xl shadow-lg">

          <span className="font-bold text-cyan-400 font-mono">
            CORE ADVANCEMENT:{' '}
          </span>

          <span>
            Existing cameras provide localized perception.{' '}
            <strong>CITYFLOW AI</strong> fuses observations
            across cameras to reconstruct city-wide vehicle
            trajectories and convert them into predictive
            traffic intelligence and coordinated response.
          </span>

        </div>

      </div>


      {/* ==================================================
          PERCEPTION PIPELINE
      ================================================== */}

      <PipelineVisualizer />


      {/* ==================================================
          TOP KPI CARDS
      ================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">

        {/* CAMERAS */}

        <KpiCard
          title="Cameras Online"
          value={`${onlineCameras} / 24`}
          subtext="Optical Nodes"
          icon={Video}
          accentColor="cyan"
          onClick={() => navigate('/cameras')}
        />


        {/* VEHICLES */}

        <KpiCard
          title="Vehicles Detected"
          value={
            liveVehicleCount !== null
              ? liveVehicleCount.toLocaleString()
              : totalTrackedVehicles.toLocaleString()
          }
          subtext="Live Camera Detections"
          icon={Car}
          trend={{
            value: '+4.2%',
            direction: 'up',
            isGood: true
          }}
          accentColor="indigo"
          onClick={() => navigate('/vehicles')}
        />


        {/* ALERTS */}

        <KpiCard
          title="Active Alerts"
          value={activeAlertsCount}
          subtext="1 Urgent Corridor"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: '4 Critical',
            direction: 'up',
            isGood: false
          }}
          onClick={() => navigate('/incidents')}
        />


        {/* CONGESTION */}

        <KpiCard
          title="Congestion Index"
          value={`${cityCongestionIndex}%`}
          subtext="Peak in J12 Hub"
          icon={Activity}
          accentColor="amber"
          trend={{
            value: '+1.5%',
            direction: 'up',
            isGood: false
          }}
          onClick={() => navigate('/prediction')}
        />


        {/* SPEED */}

        <KpiCard
          title="Average Speed"
          value={`${
            liveAverageSpeed !== null
              ? liveAverageSpeed
              : cityAvgSpeed
          } km/h`}
          subtext="Arterial Corridors"
          icon={Gauge}
          accentColor="emerald"
          trend={{
            value: '-2.1%',
            direction: 'down',
            isGood: false
          }}
          onClick={() => navigate('/analytics')}
        />


        {/* EMERGENCY */}

        <KpiCard
          title="Emergency Units"
          value={emergencyVehicles.length}
          subtext="Ambulance A17 Active"
          icon={Ambulance}
          accentColor="rose"
          onClick={() => navigate('/emergency')}
        />

      </div>


      {/* ==================================================
          MAIN COMMAND CENTER
      ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* ==================================================
            CITY MAP
        ================================================== */}

        <div className="lg:col-span-2 space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200">
                Live City Perception Grid
              </h2>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Spatial Re-ID Fusion
              </span>

            </div>

            <span className="text-xs text-cyan-400 font-mono">
              Click node to inspect CCTV / Signal
            </span>

          </div>


          <CityMap
            cameras={cameras}
            intersections={intersections}
            vehicles={vehicles}
            emergencyVehicles={emergencyVehicles}

            onSelectCamera={(cam) =>
              setSelectedCamera(cam)
            }

            onSelectIntersection={(inter) => {
              setSelectedIntersection(inter);
              navigate('/signals');
            }}

            height="h-[520px]"
          />

        </div>


        {/* ==================================================
            RIGHT PANEL
        ================================================== */}

        <div className="space-y-6">


          {/* ==================================================
              LIVE TELEMETRY
          ================================================== */}

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">

              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">

                <Zap className="w-4 h-4 text-cyan-400" />

                Live Traffic Telemetry

              </h3>


              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />

                STREAM 3.2s

              </span>

            </div>


            <div className="mt-4 grid grid-cols-2 gap-3">


              {/* VEHICLES / MIN */}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">

                <span className="text-[11px] text-slate-400 block font-mono">
                  Vehicles / min
                </span>

                <span className="text-xl font-bold font-mono text-white mt-1 block">

                  {liveVehicleCount !== null
                    ? liveVehicleCount.toLocaleString()
                    : (
                        totalTrackedVehicles % 900 + 420
                      ).toLocaleString()
                  }

                </span>

                <span className="text-[10px] text-cyan-400 font-mono">
                  ↑ 6.4% inflow
                </span>

              </div>


              {/* AVG CITY SPEED */}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">

                <span className="text-[11px] text-slate-400 block font-mono">
                  Avg City Speed
                </span>

                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">

                  {liveAverageSpeed !== null
                    ? liveAverageSpeed
                    : cityAvgSpeed
                  } km/h

                </span>

                <span className="text-[10px] text-slate-400 font-mono">
                  Target: 40 km/h
                </span>

              </div>


              {/* DENSITY */}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">

                <span className="text-[11px] text-slate-400 block font-mono">
                  Density Index
                </span>

                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                  84.2 veh/km
                </span>

                <span className="text-[10px] text-amber-400 font-mono">
                  High Density
                </span>

              </div>


              {/* CONGESTION */}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">

                <span className="text-[11px] text-slate-400 block font-mono">
                  Congestion Index
                </span>

                <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                  {cityCongestionIndex}%
                </span>

                <span className="text-[10px] text-rose-400 font-mono">
                  Severe in East
                </span>

              </div>

            </div>


            {/* ==================================================
                PREDICTION BUTTON
            ================================================== */}

            <div className="mt-4 pt-3 border-t border-slate-800">

              <button
                onClick={() => navigate('/prediction')}
                className="w-full p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold flex items-center justify-between transition-all"
              >

                <span className="flex items-center gap-2">

                  <Sparkles className="w-3.5 h-3.5" />

                  J12 Congestion Forecast (94%)

                </span>

                <ArrowRight className="w-4 h-4" />

              </button>

            </div>

          </div>


          {/* ==================================================
              ACTIVE ALERTS
          ================================================== */}

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">

              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">

                <AlertCircle className="w-4 h-4 text-amber-400" />

                Live Incident & Priority Alerts

              </h3>

              <button
                onClick={() => navigate('/incidents')}
                className="text-[11px] font-mono text-cyan-400 hover:underline"
              >
                View all ({alerts.length})
              </button>

            </div>


            <div className="mt-3 space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">

              {alerts.slice(0, 4).map((alert) => (

                <div
                  key={alert.id}

                  onClick={() => {

                    if (
                      alert.type === 'emergency'
                    ) {
                      navigate('/emergency');

                    } else if (
                      alert.title.includes('J12')
                    ) {
                      navigate('/prediction');

                    } else {
                      navigate('/incidents');
                    }

                  }}

                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.01] ${
                    alert.type === 'emergency'
                      ? 'bg-red-950/50 border-red-500/50 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : alert.type === 'warning'
                      ? 'bg-slate-950/80 border-amber-500/40 text-slate-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >

                  <div className="flex items-start justify-between gap-1">

                    <span className="font-bold text-white flex items-center gap-1.5">

                      {alert.type === 'emergency'
                        ? '🚨'
                        : alert.type === 'warning'
                        ? '⚠️'
                        : '✓'
                      }

                      {alert.title}

                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      {alert.timestamp}
                    </span>

                  </div>

                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {alert.description}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          TRAFFIC FLOW GRAPH
      ================================================== */}

      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">

          <div>

            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">

              <Activity className="w-4 h-4 text-cyan-400" />

              Urban Vehicle Flow & Throughput Dynamics
              (Last 60 Minutes)

            </h3>

            <p className="text-xs text-slate-400 mt-0.5">

              Aggregated spatiotemporal count from
              24 optical edge cameras with rolling
              congestion density curve.

            </p>

          </div>


          <div className="flex items-center gap-4 text-xs font-mono">

            <div className="flex items-center gap-1.5 text-cyan-400">

              <span className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-400" />

              <span>
                Vehicle Flow (veh/10m)
              </span>

            </div>


            <div className="flex items-center gap-1.5 text-amber-400">

              <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-400" />

              <span>
                Congestion Index (%)
              </span>

            </div>

          </div>

        </div>


        <div className="h-64 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              data={TIME_SERIES_TRAFFIC}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0
              }}
            >

              <defs>

                <linearGradient
                  id="flowGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="5%"
                    stopColor="#06b6d4"
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="95%"
                    stopColor="#06b6d4"
                    stopOpacity={0}
                  />

                </linearGradient>


                <linearGradient
                  id="congGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="5%"
                    stopColor="#f59e0b"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="95%"
                    stopColor="#f59e0b"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>


              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                opacity={0.6}
              />


              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{
                  fontSize: 11,
                  fill: '#94a3b8'
                }}
              />


              <YAxis
                stroke="#64748b"
                tick={{
                  fontSize: 11,
                  fill: '#94a3b8'
                }}
              />


              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow:
                    '0 10px 25px rgba(0,0,0,0.5)'
                }}
              />


              <Area
                type="monotone"
                dataKey="vehicleFlow"
                name="Vehicle Flow"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#flowGrad)"
              />


              <Area
                type="monotone"
                dataKey="congestion"
                name="Congestion %"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#congGrad)"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* ==================================================
          CCTV DETAILS MODAL
      ================================================== */}

      <CameraDetailsModal
        camera={selectedCamera}
        isOpen={Boolean(selectedCamera)}
        onClose={() => setSelectedCamera(null)}
      />

    </div>
  );
};