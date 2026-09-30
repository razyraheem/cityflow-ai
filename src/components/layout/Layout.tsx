import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ShieldCheck, Info } from 'lucide-react';

export const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="flex flex-1 min-h-screen">
        {/* Persistent Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen((p) => !p)} />

          {/* Page Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
            <Outlet />
          </main>

          {/* Institutional SIH Footer */}
          <footer className="border-t border-slate-800/80 bg-[#080d19] px-6 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-mono text-slate-300">
                CITYFLOW AI (SIH26127) • Smart India Hackathon Internal Prototype
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span>Edge AI OCR: v4.2</span>
              <span>•</span>
              <span>Re-ID Graph Engine: ACTIVE</span>
              <span>•</span>
              <span className="text-amber-400">SIMULATION MODE</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

