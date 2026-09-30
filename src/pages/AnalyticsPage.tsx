import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { KpiCard } from '../components/common/KpiCard';
import {
  BarChart3,
  Car,
  Gauge,
  Activity,
  Clock,
  Layers,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { totalTrackedVehicles, cityAvgSpeed, cityCongestionIndex } = useSimulation();

  // Hourly Flow Data
  const hourlyData = [
    { hour: '06:00', flow: 180, speed: 48, congestion: 22 },
    { hour: '07:00', flow: 360, speed: 42, congestion: 38 },
    { hour: '08:00', flow: 680, speed: 28, congestion: 65 },
    { hour: '09:00', flow: 920, speed: 18, congestion: 89 },
    { hour: '10:00', flow: 880, speed: 21, congestion: 84 },
    { hour: '11:00', flow: 710, speed: 31, congestion: 58 },
    { hour: '12:00', flow: 640, speed: 35, congestion: 48 },
    { hour: '13:00', flow: 590, speed: 38, congestion: 42 },
    { hour: '14:00', flow: 620, speed: 36, congestion: 45 },
    { hour: '15:00', flow: 740, speed: 29, congestion: 62 },
    { hour: '16:00', flow: 890, speed: 20, congestion: 86 },
    { hour: '17:00', flow: 960, speed: 16, congestion: 93 },
    { hour: '18:00', flow: 990, speed: 14, congestion: 95 },
  ];

  // Vehicle Type Modal Split (Donut Chart)
  const vehicleTypeData = [
    { name: 'Cars & Cabs', value: 58, color: '#06b6d4' },
    { name: 'Two-Wheelers', value: 26, color: '#38bdf8' },
    { name: 'City Buses (BMTC)', value: 8, color: '#6366f1' },
    { name: 'Heavy Freight / Trucks', value: 6, color: '#f59e0b' },
    { name: 'Emergency Ambulances', value: 2, color: '#f43f5e' },
  ];

  // Road-Wise Congestion Comparison (Bar Chart)
  const roadWiseData = [
    { road: 'Indiranagar 100ft', vehicles: 480, congestion: 92, speed: 18 },
    { road: 'Sony World Junction', vehicles: 440, congestion: 87, speed: 19 },
    { road: 'Silk Board Ramp', vehicles: 520, congestion: 89, speed: 16 },
    { road: 'Richmond Bypass', vehicles: 310, congestion: 74, speed: 28 },
    { road: 'KR Puram Cable Node', vehicles: 490, congestion: 91, speed: 14 },
    { road: 'Hebbal Expressway', vehicles: 380, congestion: 44, speed: 48 },
  ];

  // Hotspot ranking
  const hotspotRankings = [
    { rank: 1, id: 'J12', name: 'Indiranagar - 100ft Hub', congestion: 92, status: 'Critical', link: '/prediction' },
    { rank: 2, id: 'J08', name: 'Sony World - Koramangala', congestion: 87, status: 'Heavy', link: '/signals' },
    { rank: 3, id: 'J04', name: 'Richmond Circle Bypass', congestion: 74, status: 'Moderate', link: '/signals' },
    { rank: 4, id: 'J15', name: 'Silk Board Expressway Ramp', congestion: 63, status: 'Active', link: '/signals' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Urban Traffic Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              SPATIAL MACRO ANALYTICS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Deep macroscopic insights derived from unified multi-camera trajectory reconstruction.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          title="Total Vehicles"
          value={totalTrackedVehicles.toLocaleString()}
          subtext="Today's Aggregation"
          icon={Car}
          accentColor="cyan"
        />
        <KpiCard
          title="Average Speed"
          value={`${cityAvgSpeed} km/h`}
          subtext="Corridor Mean"
          icon={Gauge}
          accentColor="emerald"
        />
        <KpiCard
          title="Traffic Density"
          value="84.2 / km"
          subtext="High Saturation"
          icon={Activity}
          accentColor="amber"
        />
        <KpiCard
          title="Avg Travel Time"
          value="18.4 min"
          subtext="Cross-Town Route"
          icon={Clock}
          accentColor="indigo"
        />
        <KpiCard
          title="Queue Length"
          value="42 veh/node"
          subtext="Junction Accumulation"
          icon={Layers}
          accentColor="rose"
        />
        <KpiCard
          title="Congested Roads"
          value="5 Arterials"
          subtext="> 75% Capacity"
          icon={AlertTriangle}
          accentColor="rose"
        />
      </div>

      {/* Charts Row 1: Vehicle Flow & Speed Curve + Hotspot Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Diurnal Vehicle Flow & Speed Curve */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200">
                1. Vehicle Flow & Average Speed Over Time (24h Diurnal)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inverse correlation between vehicle surge and kinematic speed decay during peak morning/evening hours.
              </p>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="flowArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="flow"
                  name="Vehicle Flow (veh/hr)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#flowArea)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="speed"
                  name="Avg Speed (km/h)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Traffic Hotspot Ranking */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Traffic Hotspot Ranking
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300">
                CRITICAL NODES
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {hotspotRankings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                        0{item.rank}
                      </span>
                      <div>
                        <span className="font-mono font-bold text-white text-xs">{item.id}</span>
                        <h4 className="text-xs text-slate-300 font-sans">{item.name}</h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-extrabold text-rose-400 text-sm">
                        {item.congestion}%
                      </span>
                      <span className="text-[10px] block font-mono text-slate-400">Load Factor</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.congestion > 85 ? 'bg-rose-500' : item.congestion > 70 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${item.congestion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-800">
            <button
              onClick={() => navigate('/prediction')}
              className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Inspect J12 Predictive Action <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Vehicle Type Modal Split + Road-Wise Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modal Split Donut Chart */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800">
            2. Vehicle Type Modal Split (OCR / Re-ID Classification)
          </h3>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {vehicleTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Road-Wise Congestion & Volume Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800">
            3. Road-Wise Traffic Inflow & Congestion Index Comparison
          </h3>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roadWiseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="road" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="vehicles" name="Vehicles (count)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="congestion" name="Congestion Index (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

