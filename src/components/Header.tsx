import React from 'react';

export const Header: React.FC = () => {

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-slate-900 dark:bg-sky-500 text-white flex items-center justify-center font-bold text-base tracking-wider shrink-0">
              N
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Niubiz PAC Certification
            </span>
          </div>

          {/* Zone 2: Section Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection('sec-overview')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              Overview Metrics
            </button>
            <button
              onClick={() => scrollToSection('sec-chart')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              Status Chart
            </button>
            <button
              onClick={() => scrollToSection('sec-cases')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              Test Cases by Status
            </button>
          </nav>

          {/* Zone 3: In-Scope Scope Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700">
              93 In-Scope Cases
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
