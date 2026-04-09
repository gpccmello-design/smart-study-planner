/**
 * SettingsPanel.jsx
 * -----------------
 * Glassmorphism settings cards with toggle rows.
 */

function StepButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-600/60 flex items-center justify-center
                 text-slate-500 dark:text-slate-400 font-semibold
                 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500
                 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95
                 bg-white/60 dark:bg-slate-800/60"
    >
      {label}
    </button>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out focus:outline-none',
          checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-600',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow',
            'transform ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export default function SettingsPanel({ settings, onSave, onReplayTutorial }) {
  function setHours(hours) {
    onSave({ ...settings, hoursPerDay: Math.min(12, Math.max(1, hours)) });
  }

  const h = settings.hoursPerDay ?? 4;

  return (
    <div className="max-w-lg space-y-4">

      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Preferences used when generating your study plan.
        </p>
      </div>

      {/* ── Hours per day ─────────────────────────────────────── */}
      <div className="glass-card rounded-2xl shadow-card-lg p-5 space-y-4">
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Available study hours per day</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            How many hours you can realistically study each day.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <StepButton label="−" onClick={() => setHours(h - 1)} disabled={h <= 1} />

          <div className="text-center w-20">
            <span className="text-4xl font-extrabold tracking-tight" style={{ color: '#7c3aed' }}>
              {h}
            </span>
            <span className="text-base font-semibold text-slate-400 dark:text-slate-500 ml-1">hr</span>
          </div>

          <StepButton label="+" onClick={() => setHours(h + 1)} disabled={h >= 12} />
        </div>

        <input
          type="range"
          min={1}
          max={12}
          value={h}
          onChange={(e) => setHours(Number(e.target.value))}
          className="w-full accent-primary-600"
        />

        <div className="flex justify-between text-[10px] text-slate-300 dark:text-slate-600 font-medium px-0.5 -mt-2">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-700/50 rounded-xl px-3 py-2 border border-white/60 dark:border-slate-600/40">
          {h <= 2 && '💡 Light schedule — perfect for busy weeks.'}
          {h >= 3 && h <= 5 && '✅ Balanced schedule — a solid daily commitment.'}
          {h >= 6 && h <= 8 && '🔥 Intensive — make sure to take breaks!'}
          {h >= 9 && '⚠️ Very intensive — this is exam-crunch territory.'}
        </p>
      </div>

      {/* ── Plan options ──────────────────────────────────────── */}
      <div className="glass-card rounded-2xl shadow-card-lg p-5 space-y-5">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Plan options</p>

        <ToggleRow
          label="Skip weekends"
          description="Saturday and Sunday will not be included in the schedule."
          checked={settings.weekendsOff ?? false}
          onChange={(val) => onSave({ ...settings, weekendsOff: val })}
        />

        <div className="border-t border-slate-100/80 dark:border-slate-700/60" />

        <ToggleRow
          label="Rest day before exam"
          description="The day before each exam becomes a lighter review-only session at 60% hours."
          checked={settings.restDays ?? false}
          onChange={(val) => onSave({ ...settings, restDays: val })}
        />
      </div>

      {/* Replay tutorial */}
      <div className="glass-card rounded-2xl shadow-card-lg p-5">
        <button
          type="button"
          onClick={onReplayTutorial}
          className="flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7a5 5 0 0 1 9.33-2.5M12 7a5 5 0 0 1-9.33 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M11.5 2v2.5H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.5 12V9.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Replay tutorial
        </button>
      </div>

      {/* Auto-save notice */}
      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pl-1">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="#10b981" strokeWidth="1.2"/>
          <path d="M3.5 6l1.8 1.8 3-3.5" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ color: '#059669' }} className="font-medium">Changes saved automatically</span>
      </p>
    </div>
  );
}
