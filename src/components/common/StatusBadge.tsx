import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'neutral';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'green',
  pulse = true,
  size = 'md'
}) => {
  const styles = {
    green: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_8px_rgba(52,211,153,0.5)]'
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_8px_rgba(251,191,36,0.5)]'
    },
    red: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
      glow: 'shadow-[0_0_8px_rgba(244,63,94,0.5)]'
    },
    blue: {
      bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      dot: 'bg-cyan-400',
      glow: 'shadow-[0_0_8px_rgba(6,182,212,0.5)]'
    },
    purple: {
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      dot: 'bg-indigo-400',
      glow: 'shadow-[0_0_8px_rgba(99,102,241,0.5)]'
    },
    neutral: {
      bg: 'bg-slate-800 border-slate-700 text-slate-300',
      dot: 'bg-slate-400',
      glow: ''
    }
  };

  const current = styles[variant] || styles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${current.bg} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot} ${current.glow}`} />
      </span>
      <span>{status}</span>
    </span>
  );
};

