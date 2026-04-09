/**
 * SubjectForm.jsx
 * ---------------
 * Glassmorphism card form for adding a new subject.
 */

import { useState } from 'react';
import { PALETTE } from '../utils/colors';

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Very Easy', color: '#10b981' },
  { value: 2, label: 'Easy',      color: '#84cc16' },
  { value: 3, label: 'Medium',    color: '#f59e0b' },
  { value: 4, label: 'Hard',      color: '#f97316' },
  { value: 5, label: 'Very Hard', color: '#ef4444' },
];

function DifficultyPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Difficulty">
      {DIFFICULTY_OPTIONS.map(({ value: v, label, color }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={active}
            style={active ? { backgroundColor: color, borderColor: color, color: '#fff', boxShadow: `0 0 10px ${color}55` } : {}}
            className={[
              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150',
              active
                ? 'scale-105'
                : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 bg-white/60 dark:bg-slate-700/60',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap" role="group" aria-label="Subject color">
      {PALETTE.map(({ hex, name }) => {
        const active = value === hex;
        return (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            aria-label={name}
            aria-pressed={active}
            className={[
              'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150',
              active ? 'scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100',
            ].join(' ')}
            style={{
              backgroundColor: hex,
              boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${hex}, 0 0 10px ${hex}88` : undefined,
            }}
          >
            {active && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function SubjectForm({ onAdd }) {
  const [name,       setName]       = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [examDate,   setExamDate]   = useState('');
  const [color,      setColor]      = useState(PALETTE[0].hex);
  const [error,      setError]      = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Subject name is required.');
    if (!examDate)    return setError('Exam date is required.');

    const today = new Date().toLocaleDateString('sv');
    if (examDate < today) return setError('Exam date must be in the future.');

    setError('');
    onAdd({ name: name.trim(), difficulty, examDate, color });
    setName('');
    setDifficulty(3);
    setExamDate('');
    setColor(PALETTE[0].hex);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-2xl shadow-card-lg p-4 sm:p-6 space-y-4 sm:space-y-5"
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-glow-sm"
          style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Add Subject</h2>
      </div>

      {/* Subject name */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Subject Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mathematics"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/60 text-sm
                     text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
                     bg-white/60 dark:bg-slate-700/50
                     focus:outline-none focus:ring-2 focus:ring-primary-400/40
                     focus:border-primary-400/60 focus:bg-white dark:focus:bg-slate-700 transition-all"
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Difficulty
        </label>
        <DifficultyPicker value={difficulty} onChange={setDifficulty} />
      </div>

      {/* Color picker */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Color
        </label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {/* Exam date */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Exam Date
        </label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          min={new Date().toLocaleDateString('sv')}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/60 text-sm
                     text-slate-900 dark:text-slate-100 bg-white/60 dark:bg-slate-700/50
                     focus:outline-none focus:ring-2 focus:ring-primary-400/40
                     focus:border-primary-400/60 focus:bg-white dark:focus:bg-slate-700 transition-all"
        />
      </div>

      {/* Validation error */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50/80 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-glow w-full py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}
      >
        Add Subject
      </button>
    </form>
  );
}
