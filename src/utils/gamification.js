/**
 * gamification.js
 * ----------------
 * XP, levels, and badge logic derived from progress + plan data.
 */

// ── XP ───────────────────────────────────────────────────────────────────────

const BASE_XP = 10;
const DIFFICULTY_BONUS = 5; // per difficulty point

/**
 * Calculate total XP from completed sessions.
 * Each completed session gives BASE_XP + (subject difficulty * DIFFICULTY_BONUS).
 */
export function calculateXP(progress, plan, subjects) {
  if (!progress?.length || !plan?.length) return 0;

  const difficultyMap = new Map();
  subjects.forEach((s) => difficultyMap.set(s.id, s.difficulty ?? 1));

  let xp = 0;
  for (const key of progress) {
    const [, subjectId] = key.split('|');
    const diff = difficultyMap.get(subjectId) ?? 1;
    xp += BASE_XP + diff * DIFFICULTY_BONUS;
  }
  return xp;
}

// ── Levels ───────────────────────────────────────────────────────────────────

const XP_PER_LEVEL = 100;

export function getLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(xp) {
  return xp % XP_PER_LEVEL;
}

export const LEVEL_TITLES = [
  'Beginner',       // 1
  'Apprentice',     // 2
  'Dedicated',      // 3
  'Scholar',        // 4
  'Expert',         // 5
  'Master',         // 6
  'Grandmaster',    // 7
  'Legend',          // 8
];

export function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1];
}

// ── Streaks ──────────────────────────────────────────────────────────────────

/**
 * Calculate current streak and best streak from progress keys.
 * A streak day = any day with at least one completed session.
 */
export function calculateStreaks(progress) {
  if (!progress?.length) return { current: 0, best: 0 };

  const days = new Set();
  for (const key of progress) {
    const [date] = key.split('|');
    days.add(date);
  }

  const sorted = Array.from(days).sort();
  if (!sorted.length) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    const curr = new Date(sorted[i] + 'T00:00:00');
    const diff = (curr - prev) / 86_400_000;
    if (diff === 1) {
      run++;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  // Current streak: count backwards from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toLocaleDateString('sv');

  let current = 0;
  const check = new Date(today);

  // Allow today or yesterday as the starting point
  if (!days.has(todayStr)) {
    check.setDate(check.getDate() - 1);
    if (!days.has(check.toLocaleDateString('sv'))) return { current: 0, best };
  }

  while (days.has(check.toLocaleDateString('sv'))) {
    current++;
    check.setDate(check.getDate() - 1);
  }

  return { current, best: Math.max(best, current) };
}

// ── Badges ───────────────────────────────────────────────────────────────────

/**
 * All possible badges. Each has a test function that receives stats.
 * Stats shape: { totalSessions, currentStreak, bestStreak, totalHours, level, subjectCount }
 */
const BADGE_DEFS = [
  { id: 'first_session',   icon: '1',  name: 'First Step',      desc: 'Complete your first session',             test: (s) => s.totalSessions >= 1 },
  { id: 'ten_sessions',    icon: '10', name: 'Getting Started',  desc: 'Complete 10 sessions',                   test: (s) => s.totalSessions >= 10 },
  { id: 'fifty_sessions',  icon: '50', name: 'Half Century',     desc: 'Complete 50 sessions',                   test: (s) => s.totalSessions >= 50 },
  { id: 'hundred_sessions',icon: '100',name: 'Centurion',        desc: 'Complete 100 sessions',                  test: (s) => s.totalSessions >= 100 },
  { id: 'streak_3',        icon: '3d', name: 'On a Roll',        desc: '3-day study streak',                     test: (s) => s.bestStreak >= 3 },
  { id: 'streak_7',        icon: '7d', name: 'Week Warrior',     desc: '7-day study streak',                     test: (s) => s.bestStreak >= 7 },
  { id: 'streak_14',       icon: '14', name: 'Fortnight Focus',  desc: '14-day study streak',                    test: (s) => s.bestStreak >= 14 },
  { id: 'streak_30',       icon: '30', name: 'Monthly Master',   desc: '30-day study streak',                    test: (s) => s.bestStreak >= 30 },
  { id: 'hours_10',        icon: '10h',name: 'Ten Hours In',     desc: 'Study for 10 hours total',               test: (s) => s.totalHours >= 10 },
  { id: 'hours_50',        icon: '50h',name: 'Bookworm',         desc: 'Study for 50 hours total',               test: (s) => s.totalHours >= 50 },
  { id: 'hours_100',       icon: '💯', name: '100 Hours Club',   desc: 'Study for 100 hours total',              test: (s) => s.totalHours >= 100 },
  { id: 'level_3',         icon: '⭐', name: 'Dedicated',         desc: 'Reach level 3',                          test: (s) => s.level >= 3 },
  { id: 'level_5',         icon: '🌟', name: 'Expert',            desc: 'Reach level 5',                          test: (s) => s.level >= 5 },
  { id: 'level_8',         icon: '👑', name: 'Legend',             desc: 'Reach level 8',                          test: (s) => s.level >= 8 },
  { id: 'multi_subject',   icon: '📚', name: 'Multitasker',       desc: 'Study 3+ subjects in one day',           test: (s) => s.maxSubjectsInDay >= 3 },
];

/**
 * Calculate hours studied per completed session by matching progress to plan.
 */
export function calculateTotalHours(progress, plan) {
  if (!progress?.length || !plan?.length) return 0;

  const progressSet = new Set(progress);
  let hours = 0;

  for (const day of plan) {
    for (const sess of day.sessions) {
      if (progressSet.has(`${day.date}|${sess.subjectId}`)) {
        hours += sess.hours;
      }
    }
  }
  return hours;
}

/**
 * Max subjects studied in a single day.
 */
function maxSubjectsInOneDay(progress) {
  if (!progress?.length) return 0;
  const dayMap = new Map();
  for (const key of progress) {
    const [date, subjectId] = key.split('|');
    if (!dayMap.has(date)) dayMap.set(date, new Set());
    dayMap.get(date).add(subjectId);
  }
  let max = 0;
  for (const subjects of dayMap.values()) {
    if (subjects.size > max) max = subjects.size;
  }
  return max;
}

/**
 * Returns { earned: Badge[], locked: Badge[] }
 */
export function evaluateBadges(stats) {
  const fullStats = { ...stats, maxSubjectsInDay: stats.maxSubjectsInDay ?? 0 };
  const earned = [];
  const locked = [];
  for (const badge of BADGE_DEFS) {
    if (badge.test(fullStats)) earned.push(badge);
    else locked.push(badge);
  }
  return { earned, locked };
}

// ── Aggregate stats ──────────────────────────────────────────────────────────

/**
 * Compute all gamification stats in one call.
 */
export function computeGamificationStats(progress, plan, subjects) {
  const xp = calculateXP(progress, plan, subjects);
  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const levelTitle = getLevelTitle(level);
  const streaks = calculateStreaks(progress);
  const totalHours = calculateTotalHours(progress, plan);
  const totalSessions = progress?.length ?? 0;

  const badgeStats = {
    totalSessions,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    totalHours,
    level,
    subjectCount: subjects?.length ?? 0,
    maxSubjectsInDay: maxSubjectsInOneDay(progress),
  };

  const { earned, locked } = evaluateBadges(badgeStats);

  return {
    xp, level, levelProgress, levelTitle,
    xpForNextLevel: XP_PER_LEVEL,
    streaks,
    totalHours,
    totalSessions,
    badges: { earned, locked },
  };
}

// ── Per-day hours (for chart) ────────────────────────────────────────────────

/**
 * Returns an array of { date, hours } for each day that has completed sessions.
 */
export function hoursPerDay(progress, plan) {
  if (!progress?.length || !plan?.length) return [];

  const progressSet = new Set(progress);
  const dayMap = new Map();

  for (const day of plan) {
    for (const sess of day.sessions) {
      if (progressSet.has(`${day.date}|${sess.subjectId}`)) {
        dayMap.set(day.date, (dayMap.get(day.date) ?? 0) + sess.hours);
      }
    }
  }

  return Array.from(dayMap.entries())
    .map(([date, hours]) => ({ date, hours }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns hours per subject: [{ subjectId, subjectName, hours }]
 */
export function hoursPerSubject(progress, plan, subjects) {
  if (!progress?.length || !plan?.length) return [];

  const progressSet = new Set(progress);
  const map = new Map();

  for (const day of plan) {
    for (const sess of day.sessions) {
      if (progressSet.has(`${day.date}|${sess.subjectId}`)) {
        map.set(sess.subjectId, (map.get(sess.subjectId) ?? 0) + sess.hours);
      }
    }
  }

  return subjects
    .filter((s) => map.has(s.id))
    .map((s) => ({ subjectId: s.id, subjectName: s.name, hours: map.get(s.id) }))
    .sort((a, b) => b.hours - a.hours);
}
