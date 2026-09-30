import React, { useEffect, useMemo, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  Sliders,
  Sparkles,
  Activity,
  TrendingDown,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cityFlowWebSocket } from '../services/WebSocket';

type SignalPlan = {
  nsDuration: number;
  ewDuration: number;
  cycleTime: number;
  currentPhase: string;
  timeRemaining: number;
};

type SignalData = {
  intersectionId: string;
  name: string;
  latitude: number;
  longitude: number;
  currentCongestion: number;
  predictedCongestion: number;
  traffic: {
    northSouth: number;
    eastWest: number;
  };
  currentSignalPlan: {
    nsDuration: number;
    ewDuration: number;
    cycleTime: number;
  };
  recommendedSignalPlan: {
    nsDuration: number;
    ewDuration: number;
    cycleTime: number;
  };
  expectedCongestionReduction: number;
  expectedQueueReduction: number;
  reason: string;
  confidence: number;
  status: string;
};

export const SignalsPage: React.FC = () => {
  const { intersections, applyAiSignalPlan } = useSimulation();

  const [selectedIntersectionId, setSelectedIntersectionId] =
    useState('INT-001');

  const [liveSignals, setLiveSignals] = useState<
    Record<string, SignalData>
  >({});

  const [isApplying, setIsApplying] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  /*
   * ---------------------------------------------------------
   * LIVE WEBSOCKET SIGNAL DATA
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const unsubscribe = cityFlowWebSocket.subscribe((event) => {
      if (event.event !== 'signal.recommended') {
        return;
      }

      const data = event.data as SignalData;

      setLiveSignals((previous) => ({
        ...previous,
        [data.intersectionId]: data,
      }));
    });

    const connectionTimer = window.setInterval(() => {
      setWsConnected(cityFlowWebSocket.isConnected());
    }, 1000);

    setWsConnected(cityFlowWebSocket.isConnected());

    return () => {
      unsubscribe();
      window.clearInterval(connectionTimer);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * SELECTED BACKEND SIGNAL
   * ---------------------------------------------------------
   */
  const liveSignal = liveSignals[selectedIntersectionId];

  /*
   * ---------------------------------------------------------
   * FALLBACK TO EXISTING FRONTEND DATA
   * ---------------------------------------------------------
   */
  const fallbackIntersection = intersections.find(
    (intersection) =>
      intersection.intersectionId === selectedIntersectionId
  );

  const selectedIntersection = fallbackIntersection || intersections[0];

  /*
   * If backend data has arrived, use it.
   * Otherwise use the existing SimulationContext data.
   */
  const currentCongestion =
    liveSignal?.currentCongestion ??
    selectedIntersection?.congestion ??
    0;

  const predictedCongestion =
    liveSignal?.predictedCongestion ??
    selectedIntersection?.congestion ??
    0;

  const trafficNorthSouth =
    liveSignal?.traffic?.northSouth ??
    0;

  const trafficEastWest =
    liveSignal?.traffic?.eastWest ??
    0;

  const currentPlan: SignalPlan = useMemo(
    () => ({
      nsDuration:
        liveSignal?.currentSignalPlan?.nsDuration ??
        selectedIntersection?.currentSignalPlan?.nsDuration ??
        30,

      ewDuration:
        liveSignal?.currentSignalPlan?.ewDuration ??
        selectedIntersection?.currentSignalPlan?.ewDuration ??
        30,

      cycleTime:
        liveSignal?.currentSignalPlan?.cycleTime ??
        selectedIntersection?.currentSignalPlan?.cycleTime ??
        60,

      currentPhase:
        selectedIntersection?.currentSignalPlan?.currentPhase ??
        'NS_GREEN',

      timeRemaining:
        selectedIntersection?.currentSignalPlan?.timeRemaining ??
        20,
    }),
    [liveSignal, selectedIntersection]
  );

 const aiPlan: SignalPlan = useMemo(
  () => ({
    nsDuration:
      liveSignal?.recommendedSignalPlan?.nsDuration ??
      selectedIntersection?.recommendedSignalPlan?.nsDuration ??
      30,

    ewDuration:
      liveSignal?.recommendedSignalPlan?.ewDuration ??
      selectedIntersection?.recommendedSignalPlan?.ewDuration ??
      30,

    cycleTime:
      liveSignal?.recommendedSignalPlan?.cycleTime ??
      selectedIntersection?.recommendedSignalPlan?.cycleTime ??
      60,

    // Recommended plan does not contain live phase information.
    // Phase information comes from the current signal plan.
    currentPhase:
      selectedIntersection?.currentSignalPlan?.currentPhase ??
      'NS_GREEN',

    timeRemaining:
      selectedIntersection?.currentSignalPlan?.timeRemaining ??
      20,
  }),
  [liveSignal, selectedIntersection]
);
  const expectedCongestionReduction =
    liveSignal?.expectedCongestionReduction ??
    0;

  const expectedQueueReduction =
    liveSignal?.expectedQueueReduction ??
    selectedIntersection?.recommendedSignalPlan?.predictedWaitReduction ??
    0;

  const confidence =
    liveSignal?.confidence ??
    0;

  const reason =
    liveSignal?.reason ??
    'Waiting for live AI signal recommendation...';

  const signalStatus =
    liveSignal?.status ??
    'WAITING';

  /*
   * ---------------------------------------------------------
   * CALCULATED FLOW RATIO
   * ---------------------------------------------------------
   */
  const totalTraffic = trafficNorthSouth + trafficEastWest;

  const nsRatio =
    totalTraffic > 0
      ? Math.round((trafficNorthSouth / totalTraffic) * 100)
      : 50;

  const ewRatio = 100 - nsRatio;

  /*
   * ---------------------------------------------------------
   * APPLY AI PLAN
   * ---------------------------------------------------------
   */
  const handleApply = async () => {
    setIsApplying(true);

    try {
      await applyAiSignalPlan(
        selectedIntersection?.intersectionId ||
          selectedIntersectionId
      );
    } finally {
      setIsApplying(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * EMPTY STATE
   * ---------------------------------------------------------
   */
  if (!selectedIntersection) {
    return (
      <div className="p-8 text-center text-slate-400">
        No intersections available.
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">

            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Predictive Adaptive Signal Optimization
            </h1>

            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              AI OPTIMIZED
            </span>

          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time signal recommendations generated from CITYFLOW traffic predictions.
          </p>
        </div>

        {/* WEBSOCKET STATUS */}
        <div
          className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            wsConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          {wsConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              LIVE SIGNAL STREAM
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              CONNECTING...
            </>
          )}
        </div>
      </div>

      {/* INTERSECTION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">

        {intersections.map((intersection) => {
          const live = liveSignals[intersection.intersectionId];

          const congestion =
            live?.currentCongestion ??
            intersection.congestion ??
            0;

          return (
            <button
              key={intersection.intersectionId}
              onClick={() =>
                setSelectedIntersectionId(
                  intersection.intersectionId
                )
              }
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedIntersectionId ===
                intersection.intersectionId
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{intersection.intersectionId}</span>

              <span className="text-[10px] opacity-75 font-normal">
                ({congestion}%)
              </span>

              {live && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}

      </div>

      {/* LIVE AI SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-500">
            Current Congestion
          </span>

          <div className="text-2xl font-bold font-mono text-white mt-1">
            {currentCongestion}%
          </div>

          <span className="text-[10px] text-slate-500">
            Live camera state
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30">
          <span className="text-[10px] uppercase font-mono text-amber-400">
            Predicted +10m
          </span>

          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {predictedCongestion}%
          </div>

          <span className="text-[10px] text-slate-500">
            CITYFLOW prediction
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30">
          <span className="text-[10px] uppercase font-mono text-cyan-400">
            AI Confidence
          </span>

          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {confidence || '--'}%
          </div>

          <span className="text-[10px] text-slate-500">
            Recommendation confidence
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30">
          <span className="text-[10px] uppercase font-mono text-emerald-400">
            Queue Reduction
          </span>

          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {expectedQueueReduction}%
          </div>

          <span className="text-[10px] text-slate-500">
            Expected improvement
          </span>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* INTERSECTION VISUALIZER */}
        <div className="lg:col-span-7 rounded-3xl bg-[#080e1b] border border-slate-800 p-6 shadow-2xl">

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">

            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                Intersection Visualizer
              </span>

              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {liveSignal?.name ??
                  selectedIntersection.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">

              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Phase:{' '}
                <strong className="text-cyan-300">
                  {currentPlan.currentPhase}
                </strong>
              </span>

              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                ⏱ {currentPlan.timeRemaining}s
              </span>

            </div>

          </div>

          {/* SVG INTERSECTION */}
          <div className="relative w-full h-[420px] flex items-center justify-center my-4">

            <svg
              viewBox="0 0 500 500"
              className="w-full h-full max-w-[440px] max-h-[440px]"
            >

              <defs>

                <filter id="sigGlowGreen">
                  <feGaussianBlur
                    stdDeviation="4"
                    result="blur"
                  />

                  <feComposite
                    in="SourceGraphic"
                    in2="blur"
                    operator="over"
                  />
                </filter>

                <filter id="sigGlowRed">
                  <feGaussianBlur
                    stdDeviation="4"
                    result="blur"
                  />

                  <feComposite
                    in="SourceGraphic"
                    in2="blur"
                    operator="over"
                  />
                </filter>

              </defs>

              {/* BACKGROUND */}
              <rect
                width="500"
                height="500"
                rx="16"
                fill="#040812"
                stroke="#1e293b"
              />

              {/* ROADS */}
              <rect
                x="180"
                y="0"
                width="140"
                height="500"
                fill="#0d1829"
                stroke="#1e293b"
              />

              <rect
                x="0"
                y="180"
                width="500"
                height="140"
                fill="#0d1829"
                stroke="#1e293b"
              />

              {/* CENTER */}
              <rect
                x="180"
                y="180"
                width="140"
                height="140"
                fill="#09121f"
                stroke="#0ea5e9"
                strokeDasharray="4 4"
              />

              {/* ROAD MARKINGS */}
              <line
                x1="250"
                y1="0"
                x2="250"
                y2="180"
                stroke="#facc15"
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              <line
                x1="250"
                y1="320"
                x2="250"
                y2="500"
                stroke="#facc15"
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              <line
                x1="0"
                y1="250"
                x2="180"
                y2="250"
                stroke="#facc15"
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              <line
                x1="320"
                y1="250"
                x2="500"
                y2="250"
                stroke="#facc15"
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              {/* STOP LINES */}
              <line
                x1="180"
                y1="180"
                x2="250"
                y2="180"
                stroke="white"
                strokeWidth="4"
              />

              <line
                x1="250"
                y1="320"
                x2="320"
                y2="320"
                stroke="white"
                strokeWidth="4"
              />

              <line
                x1="180"
                y1="250"
                x2="180"
                y2="320"
                stroke="white"
                strokeWidth="4"
              />

              <line
                x1="320"
                y1="180"
                x2="320"
                y2="250"
                stroke="white"
                strokeWidth="4"
              />

              {/* NORTH VEHICLES */}
              <g fill="#38bdf8">

                <rect
                  x="205"
                  y="40"
                  width="16"
                  height="26"
                  rx="3"
                />

                <rect
                  x="228"
                  y="75"
                  width="16"
                  height="26"
                  rx="3"
                />

                <rect
                  x="205"
                  y="110"
                  width="16"
                  height="26"
                  rx="3"
                />

                <rect
                  x="228"
                  y="140"
                  width="16"
                  height="26"
                  rx="3"
                />

              </g>

              {/* SOUTH VEHICLES */}
              <g fill="#38bdf8">

                <rect
                  x="260"
                  y="430"
                  width="16"
                  height="26"
                  rx="3"
                />

                <rect
                  x="282"
                  y="390"
                  width="16"
                  height="26"
                  rx="3"
                />

                <rect
                  x="260"
                  y="350"
                  width="16"
                  height="26"
                  rx="3"
                />

              </g>

              {/* EAST */}
              <g fill="#94a3b8">

                <rect
                  x="420"
                  y="205"
                  width="26"
                  height="16"
                  rx="3"
                />

                <rect
                  x="360"
                  y="205"
                  width="26"
                  height="16"
                  rx="3"
                />

              </g>

              {/* WEST */}
              <g fill="#94a3b8">

                <rect
                  x="50"
                  y="270"
                  width="26"
                  height="16"
                  rx="3"
                />

                <rect
                  x="110"
                  y="270"
                  width="26"
                  height="16"
                  rx="3"
                />

              </g>

              {/* NS SIGNAL */}
              <g transform="translate(140,140)">

                <rect
                  width="24"
                  height="24"
                  rx="4"
                  fill="#020617"
                  stroke="#334155"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="7"
                  fill={
                    currentPlan.currentPhase.includes(
                      'NS_GREEN'
                    )
                      ? '#10b981'
                      : currentPlan.currentPhase.includes(
                          'NS_YELLOW'
                        )
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                />

              </g>

              {/* EW SIGNAL */}
              <g transform="translate(336,140)">

                <rect
                  width="24"
                  height="24"
                  rx="4"
                  fill="#020617"
                  stroke="#334155"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="7"
                  fill={
                    currentPlan.currentPhase.includes(
                      'EW_GREEN'
                    )
                      ? '#10b981'
                      : currentPlan.currentPhase.includes(
                          'EW_YELLOW'
                        )
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                />

              </g>

              {/* LABELS */}
              <text
                x="250"
                y="28"
                fill="#38bdf8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                NORTH-SOUTH: {trafficNorthSouth || '--'}
              </text>

              <text
                x="250"
                y="490"
                fill="#38bdf8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                NS FLOW
              </text>

              <text
                x="440"
                y="245"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                EAST-WEST
              </text>

              <text
                x="60"
                y="245"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                EW FLOW
              </text>

            </svg>

          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">

            <span>
              Flow Ratio:{' '}
              <strong className="text-white">
                {nsRatio}% NS / {ewRatio}% EW
              </strong>
            </span>

            <span className="text-cyan-400">
              AI Flow Analysis Active
            </span>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-5 space-y-5">

          {/* TIMING COMPARISON */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">

            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 flex items-center gap-2">

              <Sliders className="w-4 h-4 text-cyan-400" />

              Signal Timing Plan Comparison

            </h3>

            {/* CURRENT */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">

              <div className="flex items-center justify-between">

                <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Current Fixed-Time Plan
                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Cycle: {currentPlan.cycleTime}s
                </span>

              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">

                  <span className="text-[10px] text-slate-400 block font-mono">
                    North-South
                  </span>

                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                    {currentPlan.nsDuration}s
                  </span>

                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">

                  <span className="text-[10px] text-slate-400 block font-mono">
                    East-West
                  </span>

                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                    {currentPlan.ewDuration}s
                  </span>

                </div>

              </div>

            </div>

            {/* AI PLAN */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.12)] space-y-3">

              <div className="flex items-center justify-between">

                <span className="text-xs font-mono uppercase text-cyan-300 font-bold flex items-center gap-1.5">

                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />

                  AI Adaptive Optimized Plan

                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  {signalStatus}
                </span>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-center">

                  <span className="text-[10px] text-cyan-400 block font-mono">
                    North-South
                  </span>

                  <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
                    {aiPlan.nsDuration}s
                  </span>

                  <span className="text-[9px] text-emerald-400 font-mono">
                    AI allocation
                  </span>

                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">

                  <span className="text-[10px] text-slate-400 block font-mono">
                    East-West
                  </span>

                  <span className="text-2xl font-bold font-mono text-amber-400 mt-0.5 block">
                    {aiPlan.ewDuration}s
                  </span>

                  <span className="text-[9px] text-slate-400 font-mono">
                    AI allocation
                  </span>

                </div>

              </div>

              {/* REDUCTIONS */}
              <div className="grid grid-cols-2 gap-3">

                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40">

                  <span className="text-[10px] text-emerald-300 font-mono block">
                    Congestion Reduction
                  </span>

                  <span className="text-xl font-extrabold font-mono text-emerald-400 flex items-center gap-1 mt-1">

                    <TrendingDown className="w-4 h-4" />

                    {expectedCongestionReduction}%

                  </span>

                </div>

                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40">

                  <span className="text-[10px] text-emerald-300 font-mono block">
                    Queue Reduction
                  </span>

                  <span className="text-xl font-extrabold font-mono text-emerald-400 flex items-center gap-1 mt-1">

                    <TrendingDown className="w-4 h-4" />

                    {expectedQueueReduction}%

                  </span>

                </div>

              </div>

            </div>

            {/* AI REASON */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">

              <div className="flex items-start gap-3">

                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">

                  <Sparkles className="w-4 h-4 text-cyan-400" />

                </div>

                <div>

                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                    AI Recommendation Reason
                  </span>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {reason}
                  </p>

                </div>

              </div>

            </div>

            {/* APPLY BUTTON */}
            <button
              onClick={handleApply}
              disabled={isApplying || !liveSignal}
              className={`w-full py-3.5 rounded-2xl font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                !liveSignal
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-cyan-500/25'
              }`}
            >

              {isApplying ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  Applying to Simulation...
                </>
              ) : !liveSignal ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Waiting for AI Recommendation
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  APPLY AI PLAN
                </>
              )}

            </button>

          </div>

          {/* AI STATUS */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Activity className="w-4 h-4 text-cyan-400" />

                <span className="text-xs font-mono text-slate-300">
                  CITYFLOW Signal Engine
                </span>

              </div>

              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                ACTIVE

              </span>

            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">

              <div className="text-center p-2 rounded-lg bg-slate-950">

                <span className="text-[9px] text-slate-500 block">
                  CURRENT
                </span>

                <span className="text-sm font-mono text-white">
                  {currentCongestion}%
                </span>

              </div>

              <div className="text-center p-2 rounded-lg bg-slate-950">

                <span className="text-[9px] text-slate-500 block">
                  FORECAST
                </span>

                <span className="text-sm font-mono text-amber-400">
                  {predictedCongestion}%
                </span>

              </div>

              <div className="text-center p-2 rounded-lg bg-slate-950">

                <span className="text-[9px] text-slate-500 block">
                  CONFIDENCE
                </span>

                <span className="text-sm font-mono text-cyan-400">
                  {confidence || '--'}%
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};