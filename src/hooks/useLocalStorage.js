import { useState, useEffect } from 'react';

/**
 * A drop-in replacement for useState that persists its value in localStorage.
 *
 * @param {string} key     - The localStorage key to read/write.
 * @param {*}      initial - Default value when the key doesn't exist yet.
 * @returns [value, setValue] — identical API to useState.
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      // localStorage may be unavailable (e.g. private-browsing restrictions)
      return initial;
    }
  });

  // Keep localStorage in sync whenever the value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Fail silently — the app still works, just without persistence
    }
  }, [key, value]);

  return [value, setValue];
}
