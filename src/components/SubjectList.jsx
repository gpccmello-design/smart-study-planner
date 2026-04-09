/**
 * SubjectList.jsx
 * ---------------
 * Animated subject cards with Framer Motion, progress bars per subject.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { daysUntil } from '../utils/planGenerator';

function getUrgencyStyle(days) {
  if (days <= 3)  return { bg: 'rgba(239,68,68,0.1)',  text: '#ef4444' };
  if (days <= 10) return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' };
  return              { bg: 'rgba(16,185,129,0.1)',  text: '#10b981' };
}

function DifficultyBar({ value }) {
  const colors = ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="w-3.5 h-1 rounded-full"
            style={{ backgroundColor: n <= value ? colors[value - 1] : '#e2e8f0' }}
          />
        ))}
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        {['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'][value]}
      </span>
    </div>
  );
}

function SubjectCard({ subject, onDelete, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, index, subjectProgress }) {
  const days    = daysUntil(subject.examDate);
  const urgency = getUrgencyStyle(days);
  const accent  = subject.color ?? (days <= 3 ? '#ef4444' : days <= 10 ? '#f59e0b' : '#10b981');

  const prog   = subjectProgress?.get(subject.id);
  const hasPlan = (prog?.total ?? 0) > 0;
  const pct    = hasPlan ? Math.round((prog.done / prog.total) * 100) : 0;

  const formattedDate = new Date(subject.examDate + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      draggable
      onDragStart={(e) => onDragStart(e, subject.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, subject.id)}
      onDragEnd={onDragEnd}
      className={[
        'group glass-card rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing',
        'flex shadow-card hover:shadow-card-md transition-shadow duration-200',
        isDragging ? 'opacity-40' : '',
      ].join(' ')}
    >
      {/* Accent bar */}
      <div
        className="w-1 shrink-0"
        style={{ backgroundColor: accent, boxShadow: `2px 0 8px ${accent}55` }}
      />

      <div className="flex-1 px-4 py-3.5 flex items-center justify-between gap-4 min-w-0">
        {/* Drag handle */}
        <div className="text-slate-300 dark:text-slate-600 shrink-0 cursor-grab">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <circle cx="3" cy="2.5"  r="1.1" fill="currentColor"/>
            <circle cx="7" cy="2.5"  r="1.1" fill="currentColor"/>
            <circle cx="3" cy="7"    r="1.1" fill="currentColor"/>
            <circle cx="7" cy="7"    r="1.1" fill="currentColor"/>
            <circle cx="3" cy="11.5" r="1.1" fill="currentColor"/>
            <circle cx="7" cy="11.5" r="1.1" fill="currentColor"/>
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="font-bold text-slate-900 dark:text-slate-100 truncate leading-tight text-[15px]">
            {subject.name}
          </p>
          <DifficultyBar value={subject.difficulty} />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none" className="shrink-0">
              <rect x="1" y="1.5" width="9" height="8.5" rx="1.5" stroke="#94a3b8" strokeWidth="1"/>
              <path d="M3.5 1v1.5M7.5 1v1.5M1 4.5h9" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            {formattedDate}
          </p>

          {/* Progress bar */}
          {hasPlan && (
            <div className="space-y-0.5 pt-0.5">
              <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500">
                <span>{prog.done}/{prog.total} sessions done</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                <motion.div
                  className="h-1 rounded-full"
                  style={{ backgroundColor: accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Badge + delete */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: urgency.bg, color: urgency.text }}
          >
            {days === 0 ? 'Today!' : `${days}d left`}
          </span>
          <button
            onClick={() => onDelete(subject.id)}
            aria-label={`Remove ${subject.name}`}
            className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors
                       opacity-0 group-hover:opacity-100"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.li>
  );
}

export default function SubjectList({ subjects, onDelete, onReorder, conflicts, subjectProgress }) {
  const [draggedId, setDraggedId] = useState(null);

  function handleDragStart(e, id) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) onReorder?.(draggedId, targetId);
    setDraggedId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
  }

  if (subjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-2xl glass-card shadow-card flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 5h14M4 9h10M4 13h12M4 17h7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No subjects yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add your first subject using the form.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {conflicts && conflicts.map((group, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl
                       bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-700/50
                       text-xs text-amber-800 dark:text-amber-300"
          >
            <span className="shrink-0">⚠️</span>
            <span>
              <strong>{group.map((s) => s.name).join(' and ')}</strong> share the same exam date ({group[0].examDate}).
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      <ul className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {subjects.map((s, i) => (
            <SubjectCard
              key={s.id}
              index={i}
              subject={s}
              onDelete={onDelete}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedId === s.id}
              subjectProgress={subjectProgress}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
