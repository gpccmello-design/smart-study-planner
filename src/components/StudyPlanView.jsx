/**
 * StudyPlanView.jsx
 * -----------------
 * Glassmorphism study plan with custom animated checkboxes and loading state.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildColorMap } from '../utils/colors';
import { exportCSV, exportPrint } from '../utils/exportUtils';
import CalendarView from './CalendarView';

// ── Custom checkbox ───────────────────────────────────────────────────────────

export function CustomCheckbox({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        'w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors duration-150 border-2',
        checked
          ? 'bg-primary-600 border-primary-600'
          : 'border-slate-300 dark:border-slate-500 bg-white/60 dark:bg-slate-700/60 hover:border-primary-400',
      ].join(' ')}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
            width="9" height="9" viewBox="0 0 10 10" fill="none"
          >
            <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <motion.div
      className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend({ subjects, colorMap }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {subjects.map((s) => {
        const color = s.color ?? colorMap.get(s.id)?.hex ?? '#94a3b8';
        return (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {s.name}
          </div>
        );
      })}
    </div>
  );
}

// ── Day row ───────────────────────────────────────────────────────────────────

function DayRow({ entry, subjects, colorMap, isToday, isWeekend, progress, onToggleProgress, index }) {
  const { date, sessions } = entry;
  const totalHours  = sessions.reduce((sum, s) => sum + s.hours, 0);
  const dateObj     = new Date(date + 'T00:00:00');
  const weekday     = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
  const dayNum      = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const progressSet = new Set(progress ?? []);

  function getColor(subjectId) {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.color ?? colorMap.get(subjectId)?.hex ?? '#94a3b8';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.25) }}
      className={[
        'flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors',
        isToday
          ? 'bg-primary-50/80 dark:bg-primary-500/20 border-primary-200/80 dark:border-primary-400/50'
          : isWeekend
          ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100/80 dark:border-slate-700/40'
          : 'glass-card hover:shadow-card-md',
      ].join(' ')}
    >
      <div className="w-20 shrink-0 text-right">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${isToday ? 'text-primary-500 dark:text-primary-300' : 'text-slate-400 dark:text-slate-500'}`}>
          {weekday}
        </p>
        <p className={`text-sm font-semibold leading-tight ${isToday ? 'text-primary-700 dark:text-primary-200' : 'text-slate-700 dark:text-slate-300'}`}>
          {dayNum}
        </p>
        {isToday && <span className="text-[9px] font-black text-primary-500 dark:text-primary-300 uppercase tracking-widest">Today</span>}
      </div>

      <div className="flex-1 space-y-1">
        {sessions.map(({ subjectId, subjectName, hours, isReview }) => {
          const key   = `${date}|${subjectId}`;
          const done  = progressSet.has(key);
          const color = getColor(subjectId);
          return (
            <div key={subjectId} className="flex items-center gap-2">
              <CustomCheckbox checked={done} onChange={() => onToggleProgress?.(date, subjectId)} />
              <div
                className={`flex-1 h-6 rounded-lg flex items-center px-2.5 transition-opacity ${done ? 'opacity-35' : ''}`}
                style={{ backgroundColor: color + '28' }}
              >
                <span className="text-xs font-semibold truncate" style={{ color }}>
                  {subjectName}{isReview ? ' · Review' : ''} — {hours}h
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-10 shrink-0 text-right">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{totalHours}h</span>
      </div>
    </motion.div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────

function EmptyNoSubjects() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl glass-card shadow-card flex items-center justify-center mb-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="2" stroke="#94a3b8" strokeWidth="1.5"/>
          <path d="M3 9h18M8 2v3M16 2v3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="font-bold text-slate-700 dark:text-slate-300">No subjects added yet</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
        Go to the Subjects tab and add at least one subject.
      </p>
    </div>
  );
}

function EmptyReadyToGenerate({ subjects, onGenerate, generating }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-glow"
        style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="font-bold text-slate-800 dark:text-slate-200 text-lg tracking-tight">Ready to build your plan?</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
        {subjects.length} subject{subjects.length > 1 ? 's' : ''} ready to be scheduled.
      </p>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="btn-glow px-7 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}
      >
        {generating && <Spinner />}
        {generating ? 'Generating…' : 'Generate Study Plan'}
      </button>
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                 text-slate-600 dark:text-slate-300 glass-card shadow-card
                 hover:shadow-card-md transition-all duration-150"
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudyPlanView({ subjects, plan, onGenerate, generating, progress, onToggleProgress }) {
  const [viewMode, setViewMode] = useState('calendar');

  if (!subjects.length) return <EmptyNoSubjects />;
  if (!plan.length)     return <EmptyReadyToGenerate subjects={subjects} onGenerate={onGenerate} generating={generating} />;

  const colorMap   = buildColorMap(subjects.map((s) => s.id));
  const todayStr   = new Date().toLocaleDateString('sv');
  const totalHours = plan.reduce(
    (sum, day) => sum + day.sessions.reduce((s2, sess) => s2 + sess.hours, 0),
    0
  );

  return (
    <div className="space-y-4 print-plan">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Your Study Schedule</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {plan.length} days &middot; {totalHours.toFixed(1)}h total &middot; {subjects.length} subjects
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center glass-card rounded-lg p-0.5 gap-0.5 shadow-card">
            {['calendar', 'list'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize',
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-card'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700',
                ].join(' ')}
              >
                {mode}
              </button>
            ))}
          </div>

          <ActionBtn onClick={() => exportCSV(plan, subjects)}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M3.5 5.5L6 8l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 9v1.5h10V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            CSV
          </ActionBtn>

          <ActionBtn onClick={exportPrint}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="3" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 3V1h4v2M4 9v2h4V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Print
          </ActionBtn>

          <ActionBtn onClick={onGenerate}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M6 1.5 8 3.5 6 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Regenerate
          </ActionBtn>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl px-4 py-3 shadow-card">
        <Legend subjects={subjects} colorMap={colorMap} />
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-1.5"
          >
            {plan.map((entry, i) => {
              const dow = new Date(entry.date + 'T00:00:00').getDay();
              return (
                <DayRow
                  key={entry.date}
                  index={i}
                  entry={entry}
                  subjects={subjects}
                  colorMap={colorMap}
                  isToday={entry.date === todayStr}
                  isWeekend={dow === 0 || dow === 6}
                  progress={progress}
                  onToggleProgress={onToggleProgress}
                />
              );
            })}
          </motion.div>
        )}

        {viewMode === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CalendarView
              plan={plan}
              subjects={subjects}
              colorMap={colorMap}
              progress={progress}
              onToggleProgress={onToggleProgress}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
