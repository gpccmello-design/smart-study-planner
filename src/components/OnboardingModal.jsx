/**
 * OnboardingModal.jsx
 * -------------------
 * 3-step walkthrough with Framer Motion entrance and glassmorphism card.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'Add Your Subjects',
    description:
      'Start by adding the subjects you need to study. For each subject, set a difficulty level and your exam date so the planner knows how to prioritize.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="8" width="28" height="26" rx="3" stroke="#a78bfa" strokeWidth="2"/>
        <path d="M13 16h14M13 21h10M13 26h12" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="30" cy="10" r="5" fill="#7c3aed"/>
        <path d="M28 10h4M30 8v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Set Your Daily Hours',
    description:
      'Go to Settings and choose how many hours per day you can dedicate to studying. Enable "Skip weekends" or "Rest day before exam" for a smarter schedule.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="13" stroke="#a78bfa" strokeWidth="2"/>
        <path d="M20 11v9l5 4" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="2" fill="#7c3aed"/>
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Generate Your Plan',
    description:
      'Hit "Generate Study Plan" and the app creates a day-by-day schedule, balancing subjects by difficulty and urgency. Switch between list and calendar views.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="3" stroke="#a78bfa" strokeWidth="2"/>
        <path d="M6 14h28" stroke="#a78bfa" strokeWidth="2"/>
        <path d="M14 6v8M26 6v8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 22h7M12 27h10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="28" cy="28" r="6" fill="#7c3aed"/>
        <path d="M25.5 28l1.8 1.8 3-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Track Progress & Earn Rewards',
    description:
      'Mark sessions as done to earn XP and climb levels. Check the Stats tab to see your study streaks, hours per subject, and unlock badges as you go.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <path d="M20 6l3.5 7 7.5 1.1-5.4 5.3 1.3 7.6L20 23.5l-6.9 3.5 1.3-7.6L9 14.1l7.5-1.1L20 6z" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="20" cy="16" r="3" fill="#7c3aed"/>
        <path d="M12 32h16" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 35h10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
  },
];

export default function OnboardingModal({ onFinish }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="glass-card rounded-3xl shadow-card-lg w-full max-w-md p-8 space-y-6"
      >
        {/* Step indicators */}
        <div className="flex justify-center gap-2">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? '2rem' : '0.5rem',
                backgroundColor: i <= step ? '#7c3aed' : '#e2e8f0',
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${current.gradient} bg-opacity-10 flex items-center justify-center shadow-glow-sm`}
              style={{ background: `linear-gradient(135deg, ${current.gradient.includes('violet') ? '#a78bfa22' : current.gradient.includes('blue') ? '#3b82f622' : current.gradient.includes('amber') ? '#f59e0b22' : '#10b98122'} 0%, transparent 100%)` }}
            >
              {current.icon}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center space-y-2"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {current.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Step {step + 1} of {STEPS.length}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                         border border-slate-200/80 dark:border-slate-600/60
                         text-slate-600 dark:text-slate-300
                         hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400
                         dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Skip
            </button>
          )}

          <button
            onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
            className="btn-glow flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
