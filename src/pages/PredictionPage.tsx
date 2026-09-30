import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { cityFlowWebSocket } from '../services/WebSocket';
import { Modal } from '../components/common/Modal';

import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Sliders,
  AlertTriangle,
  Gauge,
  Layers,
  Activity,
  CheckCircle2,
  Cpu
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const PredictionPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    predictionJ12,
    applyAiSignalPlan
  } = useSimulation();

  const [showImpactModal, setShowImpactModal] =
    useState(false);

  const [isApplying, setIsApplying] =
    useState(false);

  // ==================================================
  // LIVE PREDICTION STATE
  // ==================================================

  const [livePrediction, setLivePrediction] =
    useState<any>(null);

  // ==================================================
  // SUBSCRIBE TO BACKEND prediction.updated EVENTS
  // ==================================================

  useEffect(() => {
    const unsubscribe =
      cityFlowWebSocket.subscribe((event) => {

        if (event.event !== 'prediction.updated') {
          return;
        }

        const data = event.data;

        if (!data?.cameraId) {
          return;
        }

        console.log(
          '🔮 LIVE PREDICTION:',
          data.cameraId,
          data
        );

        /*
         * Our backend currently publishes predictions
         * for every camera.
         *
         * CAM-005 is the main hotspot represented
         * by the J12 prediction card.
         *
         * CAM-004 is also high-risk, so we use it
         * as a fallback if CAM-005 has not reported yet.
         */

        if (
          data.cameraId === 'CAM-005' ||
          data.cameraId === 'CAM-004'
        ) {
          setLivePrediction(data);
        }
      });

    return () => {
      unsubscribe();
    };
  }, []);

  // ==================================================
  // USE LIVE DATA WHEN AVAILABLE
  // OTHERWISE USE EXISTING SIMULATION DATA
  // ==================================================

  const currentCongestion =
    livePrediction?.currentCongestion ??
    predictionJ12.currentCongestion;

  const predicted5Min =
    livePrediction?.predicted5Min ??
    predictionJ12.predicted5Min;

  const predicted10Min =
    livePrediction?.predicted10Min ??
    predictionJ12.predicted10Min;

  const predicted15Min =
    livePrediction?.predicted15Min ??
    predictionJ12.predicted15Min;

  const predictionStatus =
    livePrediction?.status ??
    predictionJ12.status;

  const predictionRecommendation =
    livePrediction?.recommendation ??
    predictionJ12.recommendation;

  const predictionConfidence =
    livePrediction?.confidence ?? 0;

  const averageSpeed =
    livePrediction?.averageSpeed ?? 0;

  const vehiclesDetected =
    livePrediction?.vehiclesDetected ?? 0;

  // ==================================================
  // DYNAMIC TREND CALCULATIONS
  // ==================================================

  const fiveMinuteChange =
    Number(predicted5Min) -
    Number(currentCongestion);

  const tenMinuteChange =
    Number(predicted10Min) -
    Number(currentCongestion);

  const fifteenMinuteChange =
    Number(predicted15Min) -
    Number(currentCongestion);

  // ==================================================
  // SIMULATION COMPARATIVE CURVE
  // ==================================================

  const simulationComparisonData = [
    {
      minute: 'Now (0m)',
      baseline: Number(currentCongestion),
      aiOptimized: Number(currentCongestion)
    },

    {
      minute: '+3m',
      baseline: Math.min(
        100,
        Number(currentCongestion) + 4
      ),
      aiOptimized: Math.max(
        0,
        Number(currentCongestion) - 3
      )
    },

    {
      minute: '+5m',
      baseline: Math.min(
        100,
        Number(predicted5Min) + 2
      ),
      aiOptimized: Math.max(
        0,
        Number(predicted5Min) - 4
      )
    },

    {
      minute: '+8m',
      baseline: Math.min(
        100,
        Number(predicted10Min) + 4
      ),
      aiOptimized: Math.max(
        0,
        Number(predicted10Min) - 8
      )
    },

    {
      minute: '+10m',
      baseline: Math.min(
        100,
        Number(predicted10Min) + 6
      ),
      aiOptimized: Math.max(
        0,
        Number(predicted10Min) - 10
      )
    },

    {
      minute: '+15m',
      baseline: Math.min(
        100,
        Number(predicted15Min) + 5
      ),
      aiOptimized: Math.max(
        0,
        Number(predicted15Min) - 12
      )
    },

    {
      minute: '+20m',
      baseline: Math.min(
        100,
        Number(predicted15Min) + 8
      ),
      aiOptimized: Math.max(
        0,
        Number(predicted15Min) - 16
      )
    }
  ];

  // ==================================================
  // APPLY SIGNAL PLAN
  // ==================================================

  const handleApplySignal = async () => {
    setIsApplying(true);

    try {
      await applyAiSignalPlan('J12');

      setShowImpactModal(false);

      navigate('/signals');

    } finally {
      setIsApplying(false);
    }
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2.5">

            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Predictive Traffic Intelligence
            </h1>

            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
              SPATIO-TEMPORAL FORECAST
            </span>

          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Predict traffic conditions before congestion becomes critical using upstream trajectory graphs.
          </p>

        </div>


        {/* LIVE STATUS */}

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">

          <Cpu className="w-4 h-4 text-emerald-400" />

          <span>
            {livePrediction
              ? `LIVE • Confidence ${predictionConfidence}%`
              : 'Connecting to prediction stream...'
            }
          </span>

        </div>

      </div>


      {/* ==================================================
          HERO
      ================================================== */}

      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />


        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">

          <div>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold mb-1">

              <span>
                Primary Critical Hotspot Node
              </span>

              <span>•</span>

              <span>
                {livePrediction?.cameraId || 'CAM-005'}
              </span>

            </div>


            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">

              {livePrediction?.cameraName ||
                predictionJ12.intersectionName}

            </h2>


            <p className="text-xs sm:text-sm text-slate-400 mt-1">

              {livePrediction?.road
                ? `${livePrediction.road} • Live camera prediction`
                : 'Convergence point between Central Business District outflow and East Tech Corridor.'
              }

            </p>

          </div>


          {/* STATUS */}

          <div className="flex items-center gap-3">

            <span className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.25)]">

              <AlertTriangle className="w-4 h-4 text-rose-400" />

              {predictionStatus}

            </span>

          </div>

        </div>


        {/* ==================================================
            FORECAST NUMBERS
        ================================================== */}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


          {/* CURRENT */}

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">

            <span className="text-xs font-mono uppercase text-slate-400 block">
              Current Congestion
            </span>

            <div className="mt-2 flex items-baseline gap-2">

              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">

                {currentCongestion}%

              </span>

              <span className="text-xs font-mono text-amber-400">
                Live
              </span>

            </div>

            <span className="text-[11px] text-slate-400 font-sans mt-2 block">

              Vehicles detected:{' '}

              {vehiclesDetected
                ? vehiclesDetected.toLocaleString()
                : '—'
              }

            </span>

          </div>


          {/* +5 */}

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.08)]">

            <div className="flex items-center justify-between">

              <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                +5 MIN PREDICTION
              </span>

              <Clock className="w-4 h-4 text-amber-400" />

            </div>


            <div className="mt-2 flex items-baseline gap-2">

              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">

                {predicted5Min}%

              </span>


              <span className="text-xs font-mono text-rose-400 font-bold flex items-center">

                {fiveMinuteChange >= 0
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />
                }

                {fiveMinuteChange >= 0 ? '+' : ''}
                {fiveMinuteChange.toFixed(1)}%

              </span>

            </div>


            <span className="text-[11px] text-slate-400 font-sans mt-2 block">

              Forecast generated by CITYFLOW baseline model

            </span>

          </div>


          {/* +10 */}

          <div className="p-5 rounded-2xl bg-slate-950/90 border-2 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.2)] relative">

            <span className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-mono font-extrabold text-[10px] uppercase tracking-wider">

              Critical Warning

            </span>


            <div className="flex items-center justify-between">

              <span className="text-xs font-mono uppercase text-rose-300 font-bold block">

                +10 MIN PREDICTION

              </span>

              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />

            </div>


            <div className="mt-2 flex items-baseline gap-2">

              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400">

                {predicted10Min}%

              </span>


              <span className="text-xs font-mono text-rose-400 font-bold flex items-center">

                {tenMinuteChange >= 0
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />
                }

                {tenMinuteChange >= 0 ? '+' : ''}
                {tenMinuteChange.toFixed(1)}%

              </span>

            </div>


            <span className="text-[11px] text-slate-300 font-sans mt-2 block font-medium">

              Prediction status: {predictionStatus}

            </span>

          </div>


          {/* +15 */}

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">

            <span className="text-xs font-mono uppercase text-slate-400 block">

              +15 MIN PREDICTION

            </span>


            <div className="mt-2 flex items-baseline gap-2">

              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-300">

                {predicted15Min}%

              </span>


              <span className="text-xs font-mono text-slate-500">

                {fifteenMinuteChange >= 0
                  ? 'Rising'
                  : 'Falling'
                }

              </span>

            </div>


            <span className="text-[11px] text-slate-400 font-sans mt-2 block">

              Current camera speed:{' '}

              {averageSpeed
                ? `${averageSpeed} km/h`
                : '—'
              }

            </span>

          </div>

        </div>


        {/* ==================================================
            FACTORS
        ================================================== */}

        <div className="mt-8 pt-6 border-t border-slate-800">

          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">

            <Layers className="w-4 h-4 text-cyan-400" />

            Causal Multi-Camera Prediction Factors

          </h3>


          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">


            {/* CONGESTION */}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">

              <span className="text-[11px] text-slate-400 font-mono block">
                Congestion Pressure
              </span>

              <div className="mt-1 flex items-center gap-1.5 text-rose-400 font-mono font-bold text-base">

                <TrendingUp className="w-4 h-4" />

                <span>
                  {currentCongestion}%
                </span>

              </div>

              <span className="text-[10px] text-slate-500 font-sans">
                Current camera load
              </span>

            </div>


            {/* SPEED */}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">

              <span className="text-[11px] text-slate-400 font-mono block">
                Speed Pressure
              </span>

              <div className="mt-1 flex items-center gap-1.5 text-amber-400 font-mono font-bold text-base">

                <TrendingDown className="w-4 h-4" />

                <span>
                  {averageSpeed
                    ? `${averageSpeed} km/h`
                    : '—'
                  }
                </span>

              </div>

              <span className="text-[10px] text-slate-500 font-sans">
                Camera average speed
              </span>

            </div>


            {/* VOLUME */}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">

              <span className="text-[11px] text-slate-400 font-mono block">
                Traffic Volume
              </span>

              <div className="mt-1 flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-base">

                <Gauge className="w-4 h-4" />

                <span>
                  {vehiclesDetected
                    ? vehiclesDetected.toLocaleString()
                    : '—'
                  }
                </span>

              </div>

              <span className="text-[10px] text-slate-500 font-sans">
                Latest camera detections
              </span>

            </div>


            {/* TREND */}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">

              <span className="text-[11px] text-slate-400 font-mono block">
                15-Min Trend
              </span>

              <div className="mt-1 flex items-center gap-1.5 text-rose-400 font-mono font-bold text-base">

                {fifteenMinuteChange >= 0
                  ? <TrendingUp className="w-4 h-4" />
                  : <TrendingDown className="w-4 h-4" />
                }

                <span>
                  {fifteenMinuteChange >= 0
                    ? '+'
                    : ''
                  }

                  {fifteenMinuteChange.toFixed(1)}%
                </span>

              </div>

              <span className="text-[10px] text-slate-500 font-sans">
                Forecast movement
              </span>

            </div>


            {/* CONFIDENCE */}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">

              <span className="text-[11px] text-slate-400 font-mono block">
                Model Confidence
              </span>

              <div className="mt-1 flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-base">

                <CheckCircle2 className="w-4 h-4" />

                <span>
                  {predictionConfidence
                    ? `${predictionConfidence}%`
                    : '—'
                  }
                </span>

              </div>

              <span className="text-[10px] text-slate-500 font-sans">
                CITYFLOW predictor
              </span>

            </div>

          </div>

        </div>


        {/* ==================================================
            AI RECOMMENDATION
        ================================================== */}

        <div className="mt-8 p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-start gap-3.5">

            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">

              <Sparkles className="w-5 h-5" />

            </div>


            <div>

              <span className="text-xs font-mono font-bold uppercase text-cyan-400">

                AI Autonomous Recommendation Engine

              </span>


              <h4 className="text-base font-bold text-white mt-0.5">

                {predictionRecommendation}

              </h4>


              <p className="text-xs text-slate-300 mt-1">

                Live recommendation generated from current
                camera congestion, speed and traffic-volume
                signals.

              </p>

            </div>

          </div>


          <div className="flex items-center gap-3 shrink-0">

            <button
              onClick={() => setShowImpactModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-xs font-semibold flex items-center gap-2 border border-slate-600 transition-colors"
            >

              <Activity className="w-4 h-4 text-cyan-400" />

              Simulate Impact

            </button>


            <button
              onClick={() => navigate('/signals')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >

              <Sliders className="w-4 h-4 fill-current" />

              View Signal Plan

            </button>

          </div>

        </div>

      </div>


      {/* ==================================================
          IMPACT SIMULATION MODAL
      ================================================== */}

      <Modal
        isOpen={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        title="Predictive Impact Simulation"
        subtitle="Evaluating baseline vs AI-optimized signal adaptation curves"
        maxWidth="3xl"
        badge={
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            LIVE PREDICTION INPUT
          </span>
        }
      >

        <div className="space-y-6">


          {/* SUMMARY */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">

              <span className="text-[10px] font-mono text-slate-400 block">
                Current
              </span>

              <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                {currentCongestion}%
              </span>

              <span className="text-[10px] text-slate-500">
                Live congestion
              </span>

            </div>


            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30">

              <span className="text-[10px] font-mono text-rose-400 block">
                +10 Min
              </span>

              <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                {predicted10Min}%
              </span>

              <span className="text-[10px] text-rose-500">
                Forecast
              </span>

            </div>


            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">

              <span className="text-[10px] font-mono text-slate-400 block">
                Vehicles
              </span>

              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">

                {vehiclesDetected
                  ? vehiclesDetected.toLocaleString()
                  : '—'
                }

              </span>

              <span className="text-[10px] text-slate-500">
                Camera detections
              </span>

            </div>


            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">

              <span className="text-[10px] font-mono text-slate-400 block">
                Confidence
              </span>

              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">

                {predictionConfidence
                  ? `${predictionConfidence}%`
                  : '—'
                }

              </span>

              <span className="text-[10px] text-slate-500">
                Predictor confidence
              </span>

            </div>

          </div>


          {/* CHART */}

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4">

            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3">

              Congestion Progression (+20 min Window)

            </h4>


            <div className="h-60 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={simulationComparisonData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="minute"
                    stroke="#64748b"
                    tick={{
                      fontSize: 11,
                      fill: '#94a3b8'
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
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
                      fontSize: '12px'
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: '11px'
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="aiOptimized"
                    name="AI Optimized"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* FOOTER */}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">

            <span className="text-xs font-mono text-amber-400">

              * Impact curve is a simulation for
              hackathon demonstration.

            </span>


            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setShowImpactModal(false)
                }
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Close
              </button>


              <button
                onClick={handleApplySignal}
                disabled={isApplying}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >

                {isApplying
                  ? 'Applying...'
                  : 'Apply Plan to Signal Simulator'
                }

                <ArrowRight className="w-3.5 h-3.5" />

              </button>

            </div>

          </div>

        </div>

      </Modal>

    </div>
  );
};