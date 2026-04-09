/**
 * StatsView.jsx
 * -------------
 * Performance dashboard + gamification: XP, level, streaks, badges,
 * hours-per-day bar chart, and subject distribution.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { buildColorMap } from '../utils/colors';
import {
  computeGamificationStats,
  hoursPerDay,
  hoursPerSubject,
} from '../utils/gamification';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Level card ───────────────────────────────────────────────────────────────

function LevelCard({ stats }) {
  const pct = Math.round((stats.levelProgress / stats.xpForNextLevel) * 100);

  return (
    <div className="glass-card rounded-2xl shadow-card-lg overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Level</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
              {stats.level}
            </p>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">{stats.levelTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total XP</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
              {stats.xp}
            </p>
          </div>
        </div>

        {/* XP progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-1.5">
            <span>{stats.levelProgress} / {stats.xpForNextLevel} XP</span>
            <span>Level {stats.level + 1}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Streak + quick stats ─────────────────────────────────────────────────────

function QuickStats({ stats }) {
  const items = [
    { label: 'Current Streak', value: `${stats.streaks.current}d`, gradient: 'from-orange-500 to-amber-500' },
    { label: 'Best Streak',    value: `${stats.streaks.best}d`,    gradient: 'from-rose-500 to-pink-500' },
    { label: 'Sessions Done',  value: stats.totalSessions,         gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Hours Studied',  value: `${stats.totalHours.toFixed(1)}h`, gradient: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {items.map(({ label, value, gradient }) => (
        <div key={label} className="glass-card rounded-2xl shadow-card overflow-hidden">
          <div className={`h-[3px] bg-gradient-to-r ${gradient}`} />
          <div className="px-3 sm:px-5 py-3 sm:py-4">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
              {label}
            </p>
            <p className="text-xl sm:text-[1.55rem] font-extrabold text-slate-900 dark:text-slate-100 leading-tight mt-0.5 sm:mt-1">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Hours per day bar chart ──────────────────────────────────────────────────

function DailyChart({ data }) {
  if (!data.length) {
    return (
      <div className="glass-card rounded-2xl shadow-card-lg p-5">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Hours per Day</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">Complete some sessions to see your daily chart.</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.hours), 1);
  // Show last 14 days max
  const recent = data.slice(-14);

  return (
    <div className="glass-card rounded-2xl shadow-card-lg p-5">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Hours per Day</p>
      <div className="flex items-end gap-1.5 h-32">
        {recent.map(({ date, hours }) => (
          <div key={date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
              {hours.toFixed(1)}
            </span>
            <motion.div
              className="w-full rounded-t-md bg-gradient-to-t from-violet-500 to-indigo-400 min-h-[4px]"
              initial={{ height: 0 }}
              animate={{ height: `${(hours / max) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="text-[8px] text-slate-400 dark:text-slate-500 truncate w-full text-center">
              {formatDate(date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Subject distribution ─────────────────────────────────────────────────────

function SubjectDistribution({ data, subjects }) {
  if (!data.length) {
    return (
      <div className="glass-card rounded-2xl shadow-card-lg p-5">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Time per Subject</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">Complete some sessions to see your distribution.</p>
      </div>
    );
  }

  const colorMap = buildColorMap(subjects.map((s) => s.id));
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="glass-card rounded-2xl shadow-card-lg p-5">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Time per Subject</p>

      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex mb-4">
        {data.map(({ subjectId, hours }) => {
          const color = colorMap.get(subjectId);
          const pct = (hours / totalHours) * 100;
          return (
            <motion.div
              key={subjectId}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ backgroundColor: color?.hex ?? '#7c3aed' }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map(({ subjectId, subjectName, hours }) => {
          const color = colorMap.get(subjectId);
          const pct = ((hours / totalHours) * 100).toFixed(0);
          return (
            <div key={subjectId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color?.hex ?? '#7c3aed' }} />
                <span className="text-slate-700 dark:text-slate-300 truncate">{subjectName}</span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-2">
                {hours.toFixed(1)}h ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Badges ───────────────────────────────────────────────────────────────────

function BadgeItem({ badge, earned }) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
        earned
          ? 'glass-card border-primary-200 dark:border-primary-800/50 shadow-card'
          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/40 opacity-40',
      ].join(' ')}
    >
      <span className="text-lg font-bold leading-none">{badge.icon}</span>
      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{badge.name}</span>
      <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">{badge.desc}</span>
    </div>
  );
}

function BadgesGrid({ badges }) {
  const all = [
    ...badges.earned.map((b) => ({ ...b, _earned: true })),
    ...badges.locked.map((b) => ({ ...b, _earned: false })),
  ];

  return (
    <div className="glass-card rounded-2xl shadow-card-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Badges</p>
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
          {badges.earned.length} / {all.length}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {all.map((b) => (
          <BadgeItem key={b.id} badge={b} earned={b._earned} />
        ))}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="glass-card rounded-2xl shadow-card-lg p-8 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-violet-500">
          <path d="M12 20V10M18 20V4M6 20v-4" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No stats yet</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
        Generate a study plan and start completing sessions to see your performance stats and earn badges.
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function StatsView({ subjects, plan, progress }) {
  const stats = useMemo(
    () => computeGamificationStats(progress, plan, subjects),
    [progress, plan, subjects],
  );

  const dailyData = useMemo(
    () => hoursPerDay(progress, plan),
    [progress, plan],
  );

  const subjectData = useMemo(
    () => hoursPerSubject(progress, plan, subjects),
    [progress, plan, subjects],
  );

  if (!stats.totalSessions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <EmptyState />
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level + XP */}
      <LevelCard stats={stats} />

      {/* Quick stats row */}
      <QuickStats stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyChart data={dailyData} />
        <SubjectDistribution data={subjectData} subjects={subjects} />
      </div>

      {/* Badges */}
      <BadgesGrid badges={stats.badges} />
    </div>
  );
}
