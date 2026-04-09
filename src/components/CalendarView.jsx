/**
 * CalendarView.jsx
 * ----------------
 * Glassmorphism calendar with week and month views.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString('sv');
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const offset = startDow === 0 ? -6 : 1 - startDow;
  const start = new Date(year, month, 1 + offset);
  start.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  // trim trailing week if entirely in next month
  if (days[35].getMonth() !== month) days.splice(35, 7);
  return days;
}

function SessionBlock({ dateStr, subjectId, subjectName, hours, done, color, onToggle, compact }) {
  return (
    <motion.button
      key={subjectId}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: done ? 0.4 : 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      onClick={() => onToggle?.(dateStr, subjectId)}
      title={`${subjectName}: ${hours}h — click to ${done ? 'unmark' : 'mark done'}`}
      className={`w-full text-left rounded-lg font-semibold leading-tight hover:opacity-80 active:scale-95 transition-transform relative overflow-hidden ${
        compact ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-1 text-[10px]'
      }`}
      style={{ backgroundColor: color + '28', color }}
    >
      {done && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      <span className={`block truncate ${done ? 'invisible' : ''}`}>{subjectName}</span>
      {!compact && <span className={`text-[9px] font-normal opacity-80 ${done ? 'invisible' : ''}`}>{hours}h</span>}
    </motion.button>
  );
}

export default function CalendarView({ plan, subjects, colorMap, progress, onToggleProgress }) {
  const todayStr = new Date().toLocaleDateString('sv');
  const [view, setView] = useState('week');
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const planMap = new Map();
  plan.forEach((entry) => planMap.set(entry.date, entry.sessions));

  const progressSet = new Set(progress ?? []);

  function getColor(subjectId) {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.color ?? colorMap?.get(subjectId)?.hex ?? '#94a3b8';
  }

  // --- Week helpers ---
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekLabel = `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  function prevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }
  function nextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  // --- Month helpers ---
  const monthDays = getMonthDays(monthDate.year, monthDate.month);
  const monthLabel = new Date(monthDate.year, monthDate.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  function prevMonth() {
    setMonthDate((prev) => {
      const d = new Date(prev.year, prev.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }
  function nextMonth() {
    setMonthDate((prev) => {
      const d = new Date(prev.year, prev.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const navLabel = view === 'week' ? weekLabel : monthLabel;
  const onPrev = view === 'week' ? prevWeek : prevMonth;
  const onNext = view === 'week' ? nextWeek : nextMonth;

  return (
    <div className="space-y-4">

      {/* View toggle + navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          className="p-2 rounded-xl glass-card shadow-card hover:shadow-card-md transition-all"
          aria-label={view === 'week' ? 'Previous week' : 'Previous month'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{navLabel}</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-[11px] font-semibold transition-colors ${
                view === 'week'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-[11px] font-semibold transition-colors ${
                view === 'month'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <button
          onClick={onNext}
          className="p-2 rounded-xl glass-card shadow-card hover:shadow-card-md transition-all"
          aria-label={view === 'week' ? 'Next week' : 'Next month'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Week view */}
      {view === 'week' && (
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 min-w-0">

            {/* Day headers */}
            {weekDays.map((day, i) => {
              const dateStr  = formatDate(day);
              const isToday  = dateStr === todayStr;
              const dow = day.getDay();
              const isWeekend = dow === 0 || dow === 6;
              return (
                <div
                  key={dateStr}
                  className={[
                    'text-center py-2 rounded-xl text-xs font-bold',
                    isToday
                      ? 'text-white shadow-glow-sm'
                      : isWeekend
                      ? 'text-slate-400 dark:text-slate-500 glass-card'
                      : 'text-slate-500 dark:text-slate-400 glass-card',
                  ].join(' ')}
                  style={isToday ? { background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' } : {}}
                >
                  <div className="text-[10px] uppercase tracking-wide">{WEEKDAYS[i]}</div>
                  <div className={`text-base font-extrabold mt-0.5 ${isToday ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Session cells */}
            {weekDays.map((day) => {
              const dateStr  = formatDate(day);
              const sessions = planMap.get(dateStr) ?? [];
              const isToday  = dateStr === todayStr;
              const dow = day.getDay();
              const isWeekend = dow === 0 || dow === 6;

              return (
                <div
                  key={dateStr + '-cell'}
                  className={[
                    'min-h-[70px] sm:min-h-[90px] rounded-lg sm:rounded-xl border p-1 sm:p-1.5 space-y-0.5 sm:space-y-1',
                    isToday
                      ? 'bg-primary-50/70 dark:bg-primary-500/20 border-primary-200/70 dark:border-primary-400/50'
                      : isWeekend
                      ? 'bg-slate-50/40 dark:bg-slate-800/30 border-slate-100/60 dark:border-slate-700/30'
                      : 'glass-card',
                  ].join(' ')}
                >
                  {sessions.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                    </div>
                  )}
                  <AnimatePresence>
                    {sessions.map(({ subjectId, subjectName, hours }) => (
                      <SessionBlock
                        key={subjectId}
                        dateStr={dateStr}
                        subjectId={subjectId}
                        subjectName={subjectName}
                        hours={hours}
                        done={progressSet.has(`${dateStr}|${subjectId}`)}
                        color={getColor(subjectId)}
                        onToggle={onToggleProgress}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* Month view */}
      {view === 'month' && (
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-7 gap-1 min-w-0">

            {/* Day-of-week headers */}
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {wd}
              </div>
            ))}

            {/* Day cells */}
            {monthDays.map((day) => {
              const dateStr = formatDate(day);
              const sessions = planMap.get(dateStr) ?? [];
              const isToday = dateStr === todayStr;
              const dow = day.getDay();
              const isWeekend = dow === 0 || dow === 6;
              const isCurrentMonth = day.getMonth() === monthDate.month;

              return (
                <div
                  key={dateStr}
                  className={[
                    'min-h-[70px] rounded-lg border p-1 space-y-0.5',
                    !isCurrentMonth
                      ? 'opacity-40'
                      : '',
                    isToday
                      ? 'bg-primary-50/70 dark:bg-primary-500/20 border-primary-200/70 dark:border-primary-400/50'
                      : isWeekend
                      ? 'bg-slate-50/40 dark:bg-slate-800/30 border-slate-100/60 dark:border-slate-700/30'
                      : 'glass-card',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'text-[10px] font-bold text-right px-0.5 mb-0.5',
                      isToday
                        ? 'text-primary-600 dark:text-primary-400'
                        : isWeekend
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-slate-500 dark:text-slate-400',
                    ].join(' ')}
                  >
                    {day.getDate()}
                  </div>
                  <AnimatePresence>
                    {sessions.slice(0, 3).map(({ subjectId, subjectName, hours }) => (
                      <SessionBlock
                        key={subjectId}
                        dateStr={dateStr}
                        subjectId={subjectId}
                        subjectName={subjectName}
                        hours={hours}
                        done={progressSet.has(`${dateStr}|${subjectId}`)}
                        color={getColor(subjectId)}
                        onToggle={onToggleProgress}
                        compact
                      />
                    ))}
                  </AnimatePresence>
                  {sessions.length > 3 && (
                    <div className="text-[8px] text-slate-400 dark:text-slate-500 text-center font-medium">
                      +{sessions.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      )}
    </div>
  );
}
