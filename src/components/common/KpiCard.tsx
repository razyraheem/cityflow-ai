import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    isGood?: boolean;
  };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = 'cyan',
  onClick
}) => {
  const accentBorders = {
    cyan: 'hover:border-cyan-500/40 text-cyan-400 group-hover:bg-cyan-500/10',
    emerald: 'hover:border-emerald-500/40 text-emerald-400 group-hover:bg-emerald-500/10',
    amber: 'hover:border-amber-500/40 text-amber-400 group-hover:bg-amber-500/10',
    rose: 'hover:border-rose-500/40 text-rose-400 group-hover:bg-rose-500/10',
    indigo: 'hover:border-indigo-500/40 text-indigo-400 group-hover:bg-indigo-500/10'
  };

  const topGradients = {
    cyan: 'from-cyan-500/60 to-transparent',
    emerald: 'from-emerald-500/60 to-transparent',
    amber: 'from-amber-500/60 to-transparent',
    rose: 'from-rose-500/60 to-transparent',
    indigo: 'from-indigo-500/60 to-transparent'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-lg backdrop-blur-md transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${accentBorders[accentColor]}`}
    >
      {/* Top subtle ambient glow line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${topGradients[accentColor]}`} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              {value}
            </span>
          </div>
        </div>

        <div className={`rounded-xl p-2.5 bg-slate-800/80 border border-slate-700/60 transition-colors ${accentBorders[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs">
          {subtext && <span className="text-slate-400 truncate">{subtext}</span>}

          {trend && (
            <span
              className={`flex items-center gap-1 font-mono font-medium ${
                trend.direction === 'neutral'
                  ? 'text-slate-400'
                  : trend.isGood
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

