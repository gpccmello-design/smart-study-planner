/**
 * planGenerator.js
 * ----------------
 * Turns the user's subjects + settings into a day-by-day study schedule.
 */

function roundHalf(n) { return Math.round(n * 2) / 2; }

function daysBetween(fromStr, toStr) {
  const from = new Date(fromStr + 'T00:00:00');
  const to   = new Date(toStr   + 'T00:00:00');
  return Math.max(0, Math.ceil((to - from) / 86_400_000));
}

/**
 * Generate a study plan.
 *
 * @param {Array}  subjects     - [{ id, name, difficulty, examDate }]
 * @param {number} hoursPerDay  - Available study hours per day
 * @param {Object} options
 * @param {boolean} options.weekendsOff  - Skip Sat/Sun
 * @param {boolean} options.restDays     - Day before each exam = 60%-hours review for that subject
 * @param {Array}  options.progress      - Array of "date|subjectId" completed session keys
 */
export function generatePlan(subjects, hoursPerDay, options = {}) {
  const { weekendsOff = false, restDays = false, progress = [] } = options;

  if (!subjects.length) return [];

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toLocaleDateString('sv');

  const upcoming = subjects.filter((s) => s.examDate >= todayStr);
  if (!upcoming.length) return [];

  const lastExam = upcoming.reduce((max, s) => s.examDate > max ? s.examDate : max, todayStr);

  // Count completed sessions per subject for weight reduction
  const completionCount = new Map();
  (progress ?? []).forEach((key) => {
    const parts = key.split('|');
    if (parts.length === 2) {
      const subjectId = parts[1];
      completionCount.set(subjectId, (completionCount.get(subjectId) ?? 0) + 1);
    }
  });

  // Build rest-day map: dateStr -> subject (day before that subject's exam)
  const restDayMap = new Map();
  if (restDays) {
    upcoming.forEach((s) => {
      const examDate = new Date(s.examDate + 'T00:00:00');
      const dayBefore = new Date(examDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const dayBeforeStr = dayBefore.toLocaleDateString('sv');
      if (dayBeforeStr >= todayStr) {
        restDayMap.set(dayBeforeStr, s);
      }
    });
  }

  const plan = [];
  const current = new Date(today);

  while (true) {
    const dateStr = current.toLocaleDateString('sv');
    if (dateStr > lastExam) break;

    const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat

    // Skip weekends
    if (weekendsOff && (dayOfWeek === 0 || dayOfWeek === 6)) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    // Rest day: review-only at 60% hours for the upcoming exam subject
    if (restDayMap.has(dateStr)) {
      const restSubject = restDayMap.get(dateStr);
      if (restSubject.examDate > dateStr) {
        const reviewHours = Math.max(0.5, roundHalf(hoursPerDay * 0.6));
        plan.push({
          date: dateStr,
          sessions: [{
            subjectId: restSubject.id,
            subjectName: restSubject.name,
            hours: reviewHours,
            isReview: true,
          }],
        });
        current.setDate(current.getDate() + 1);
        continue;
      }
    }

    const active = upcoming.filter((s) => s.examDate >= dateStr);

    if (active.length > 0) {
      const weights = active.map((s) => {
        const d = Math.max(1, daysBetween(dateStr, s.examDate));
        let w = s.difficulty / d;
        // Reduce weight per completed session: 5% each, capped at 50%
        const completions = completionCount.get(s.id) ?? 0;
        const reduction = Math.min(0.5, completions * 0.05);
        w = w * (1 - reduction);
        return Math.max(0.001, w);
      });

      const total = weights.reduce((a, b) => a + b, 0);

      const sessions = active.map((s, i) => ({
        subjectId:   s.id,
        subjectName: s.name,
        hours:       Math.max(0.5, roundHalf((weights[i] / total) * hoursPerDay)),
      }));

      plan.push({ date: dateStr, sessions });
    }

    current.setDate(current.getDate() + 1);
  }

  return plan;
}

/**
 * Detect subjects that share the same exam date.
 * Returns array of arrays where each inner array has 2+ subjects.
 */
export function detectConflicts(subjects) {
  const groups = new Map();
  subjects.forEach((s) => {
    if (!s.examDate) return;
    if (!groups.has(s.examDate)) groups.set(s.examDate, []);
    groups.get(s.examDate).push(s);
  });
  return Array.from(groups.values()).filter((group) => group.length > 1);
}

export function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
}

export function urgencyColor(daysLeft) {
  if (daysLeft <= 3) return 'red';
  if (daysLeft <= 7) return 'yellow';
  return 'green';
}
