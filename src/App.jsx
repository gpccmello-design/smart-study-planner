/**
 * App.jsx — root component
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { generatePlan, detectConflicts, daysUntil } from './utils/planGenerator';

import Header          from './components/Header';
import SubjectForm     from './components/SubjectForm';
import SubjectList     from './components/SubjectList';
import StudyPlanView   from './components/StudyPlanView';
import SettingsPanel   from './components/SettingsPanel';
import OnboardingModal from './components/OnboardingModal';

const DEFAULT_SETTINGS = {
  hoursPerDay: 4,
  weekendsOff: false,
  restDays: false,
};

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ size = 12, color = 'currentColor' }) {
  return (
    <motion.div
      style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }}
      className="rounded-full border-2 shrink-0"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ── Animated stat value ───────────────────────────────────────────────────────

function AnimatedStatValue({ numericValue, suffix = '', fallback = '—' }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(
    numericValue != null ? `${numericValue}${suffix}` : fallback
  );

  useEffect(() => {
    if (numericValue == null) {
      setDisplay(fallback);
      return;
    }
    const controls = animate(motionVal, numericValue, {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(`${Math.round(v)}${suffix}`),
    });
    return controls.stop;
  }, [numericValue, suffix, fallback]);

  return <span>{display}</span>;
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

const STAT_CONFIG = [
  { label: 'Subjects',    gradient: 'from-violet-500 to-purple-600', suffix: '',  fallback: '0'  },
  { label: 'Next Exam',   gradient: 'from-rose-500 to-pink-500',     suffix: 'd', fallback: '—'  },
  { label: 'Plan Length', gradient: 'from-blue-500 to-indigo-500',   suffix: 'd', fallback: '—'  },
  { label: 'Daily Hours', gradient: 'from-emerald-500 to-teal-500',  suffix: 'h', fallback: '—'  },
];

function StatCard({ label, numericValue, suffix, fallback, sub, gradient }) {
  return (
    <div className="glass-card rounded-2xl shadow-card overflow-hidden min-w-0">
      <div className={`h-[3px] bg-gradient-to-r ${gradient}`} />
      <div className="px-3 sm:px-5 py-3 sm:py-4">
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
          {label}
        </p>
        <p className="text-xl sm:text-[1.55rem] font-extrabold text-slate-900 dark:text-slate-100 leading-tight mt-0.5 sm:mt-1 truncate">
          <AnimatedStatValue numericValue={numericValue} suffix={suffix} fallback={fallback} />
        </p>
        {sub && <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function StatsBar({ subjects, plan, settings }) {
  const today    = new Date().toLocaleDateString('sv');
  const upcoming = subjects.filter((s) => s.examDate >= today);

  const nextExamDays = upcoming.length
    ? Math.min(...upcoming.map((s) => daysUntil(s.examDate)))
    : null;

  const totalPlanHours = plan.reduce(
    (sum, day) => sum + day.sessions.reduce((s2, sess) => s2 + sess.hours, 0),
    0
  );

  const stats = [
    { numericValue: subjects.length,      sub: `${subjects.length} subject${subjects.length !== 1 ? 's' : ''} added` },
    { numericValue: nextExamDays,         sub: nextExamDays !== null ? 'days remaining' : 'No upcoming exams' },
    { numericValue: plan.length || null,  sub: plan.length ? 'days scheduled' : 'Not generated yet' },
    { numericValue: settings.hoursPerDay, sub: totalPlanHours > 0 ? `${totalPlanHours.toFixed(0)}h total planned` : 'Set in Settings' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {STAT_CONFIG.map((cfg, i) => (
        <StatCard key={cfg.label} {...cfg} {...stats[i]} />
      ))}
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useDarkMode();

  const [subjects,  setSubjects]  = useLocalStorage('ssp_subjects',  []);
  const [settings,  setSettings]  = useLocalStorage('ssp_settings',  DEFAULT_SETTINGS);
  const [plan,      setPlan]      = useLocalStorage('ssp_plan',      []);
  const [progress,  setProgress]  = useLocalStorage('ssp_progress',  []);
  const [onboarded, setOnboarded] = useLocalStorage('ssp_onboarded', false);

  const [activeTab,  setActiveTab]  = useState('subjects');
  const [generating, setGenerating] = useState(false);

  // Progress per subject: { done, total }
  const subjectProgress = useMemo(() => {
    const map = new Map();
    subjects.forEach((s) => map.set(s.id, { done: 0, total: 0 }));
    plan.forEach((day) => {
      day.sessions.forEach((sess) => {
        const entry = map.get(sess.subjectId);
        if (!entry) return;
        entry.total++;
        if ((progress ?? []).includes(`${day.date}|${sess.subjectId}`)) entry.done++;
      });
    });
    return map;
  }, [subjects, plan, progress]);

  async function handleGeneratePlan() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 520));
    setPlan(generatePlan(subjects, settings.hoursPerDay, {
      weekendsOff: settings.weekendsOff ?? false,
      restDays:    settings.restDays    ?? false,
      progress,
    }));
    setGenerating(false);
    setActiveTab('plan');
  }

  function handleAddSubject(subject) {
    setSubjects((prev) => [...prev, { ...subject, id: crypto.randomUUID() }]);
    setPlan([]);
  }

  function handleDeleteSubject(id) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setPlan([]);
  }

  function handleReorderSubjects(draggedId, targetId) {
    setSubjects((prev) => {
      const arr = [...prev];
      const from = arr.findIndex((s) => s.id === draggedId);
      const to   = arr.findIndex((s) => s.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }

  function handleToggleProgress(date, subjectId) {
    const key = `${date}|${subjectId}`;
    setProgress((prev) => {
      const arr = prev ?? [];
      return arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];
    });
  }

  const conflicts = detectConflicts(subjects);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative">

      {/* Aurora */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      <div className="relative z-10">
        {!onboarded && <OnboardingModal onFinish={() => setOnboarded(true)} />}

        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isDark={isDark}
          onToggleDark={setIsDark}
        />

        <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-7 space-y-4 sm:space-y-6">

          <StatsBar subjects={subjects} plan={plan} settings={settings} />

          <AnimatePresence mode="wait">
            {activeTab === 'subjects' && (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5"
              >
                <SubjectForm onAdd={handleAddSubject} />

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {subjects.length} Subject{subjects.length !== 1 ? 's' : ''}
                    </h2>
                    {subjects.length > 0 && (
                      <button
                        onClick={handleGeneratePlan}
                        disabled={generating}
                        className="text-xs font-semibold text-primary-600 dark:text-primary-400
                                   hover:text-primary-500 flex items-center gap-1.5 transition-colors
                                   disabled:opacity-60"
                      >
                        {generating && <Spinner size={10} />}
                        {generating ? 'Generating…' : 'Generate plan →'}
                      </button>
                    )}
                  </div>
                  <SubjectList
                    subjects={subjects}
                    onDelete={handleDeleteSubject}
                    onReorder={handleReorderSubjects}
                    conflicts={conflicts}
                    subjectProgress={subjectProgress}
                  />
                </section>
              </motion.div>
            )}

            {activeTab === 'plan' && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <StudyPlanView
                  subjects={subjects}
                  plan={plan}
                  onGenerate={handleGeneratePlan}
                  generating={generating}
                  progress={progress}
                  onToggleProgress={handleToggleProgress}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <SettingsPanel settings={settings} onSave={setSettings} onReplayTutorial={() => setOnboarded(false)} />
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
