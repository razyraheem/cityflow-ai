import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'emergency';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message: string, type: ToastType = 'info', duration = 4500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    // Subtle Web Audio synthesis alert tone
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'emergency') {
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
          osc.start();
          osc.stop(ctx.currentTime + 0.22);
        } else if (type === 'success') {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'warning') {
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      }
    } catch {
      // AudioContext muted/unsupported silently
    }

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
              emergency: <AlertCircle className="w-5 h-5 text-red-500 animate-pulse shrink-0" />,
              info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            };

            const borderColors = {
              success: 'border-emerald-500/40 bg-slate-900/95 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
              warning: 'border-amber-500/40 bg-slate-900/95 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
              error: 'border-rose-500/40 bg-slate-900/95 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
              emergency: 'border-red-500 bg-red-950/90 shadow-[0_0_30px_rgba(239,68,68,0.35)]',
              info: 'border-cyan-500/40 bg-slate-900/95 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ duration: 0.22 }}
                className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 text-slate-100 ${borderColors[toast.type]}`}
              >
                {icons[toast.type]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold tracking-wide text-slate-100">{toast.title}</h4>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                      {toast.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

