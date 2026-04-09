import { useState, useEffect } from 'react';

const KEY = 'ssp_dark';

function applyDark(dark) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';   // tells the browser: we own dark mode
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';  // prevents browser from auto-darkening
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY);
      // If nothing stored yet, follow the OS preference as a sensible default
      const v = stored !== null
        ? JSON.parse(stored) === true
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyDark(v); // apply before first paint — no flash
      return v;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    applyDark(isDark);
    try { localStorage.setItem(KEY, JSON.stringify(isDark)); } catch {}
  }, [isDark]);

  return [isDark, setIsDark];
}
