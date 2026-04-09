/**
 * Header.jsx
 * ----------
 * Sticky header with glassmorphism, brand, dark-mode toggle,
 * and Framer Motion animated tab pill.
 */

import { motion } from 'framer-motion';

const TABS = [
  { id: 'subjects', label: 'Subjects'   },
  { id: 'plan',     label: 'Study Plan' },
  { id: 'stats',    label: 'Stats'      },
  { id: 'settings', label: 'Settings'   },
];

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Header({ activeTab, onTabChange, isDark, onToggleDark }) {
  return (
    <header className="sticky top-0 z-20 no-print">
      {/* Glass panel */}
      <div className="glass-card border-b border-white/60 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-0 sm:h-[58px] flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6">

          {/* ── Top row on mobile: brand + dark mode ─────────── */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M2 3h12M2 6h8M2 9h10M2 12h6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-sm sm:text-[15px]">
                Smart Study
                <span className="text-primary-600 dark:text-primary-400"> Planner</span>
              </span>
            </div>

            <button
              onClick={() => onToggleDark?.((prev) => !prev)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-lg flex items-center justify-center sm:hidden
                         text-slate-500 dark:text-slate-400
                         hover:bg-slate-100/80 dark:hover:bg-slate-700/80
                         border border-slate-200/80 dark:border-slate-600/50
                         transition-all duration-200"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* ── Dark mode toggle (desktop) ─────────────────── */}
            <button
              onClick={() => onToggleDark?.((prev) => !prev)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-lg hidden sm:flex items-center justify-center
                         text-slate-500 dark:text-slate-400
                         hover:bg-slate-100/80 dark:hover:bg-slate-700/80
                         border border-slate-200/80 dark:border-slate-600/50
                         transition-all duration-200"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* ── Animated segmented tabs ─────────────────────── */}
            <nav
              className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1 gap-0.5"
              role="tablist"
            >
              {TABS.map(({ id, label }) => {
                const active = id === activeTab;
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => onTabChange(id)}
                    className="relative px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 focus:outline-none"
                  >
                    {active && (
                      <motion.div
                        layoutId="tab-pill"
                        className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-card"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={[
                      'relative z-10 transition-colors duration-150',
                      active
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                    ].join(' ')}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

        </div>
      </div>

      {/* Gradient accent line */}
      <div
        aria-hidden="true"
        className="h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #a78bfa 30%, #7c3aed 60%, transparent 100%)' }}
      />
    </header>
  );
}
