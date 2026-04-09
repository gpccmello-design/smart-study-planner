/**
 * colors.js
 * ---------
 * Subject colour palette. Each entry provides both a hex value (for inline
 * styles on dynamic elements like progress bars) and Tailwind-safe class names
 * for static elements like badges.
 */

export const PALETTE = [
  { hex: '#7c3aed', light: '#ede9fe', name: 'Violet'  },
  { hex: '#0284c7', light: '#e0f2fe', name: 'Blue'    },
  { hex: '#059669', light: '#d1fae5', name: 'Emerald' },
  { hex: '#d97706', light: '#fef3c7', name: 'Amber'   },
  { hex: '#e11d48', light: '#ffe4e6', name: 'Rose'    },
  { hex: '#ea580c', light: '#ffedd5', name: 'Orange'  },
  { hex: '#0891b2', light: '#cffafe', name: 'Cyan'    },
  { hex: '#7e22ce', light: '#f3e8ff', name: 'Purple'  },
];

/**
 * Given an ordered list of subject IDs, return a Map<id, paletteEntry>
 * so every component can look up a subject's colour by ID.
 *
 * @param {string[]} subjectIds
 * @returns {Map<string, {hex: string, light: string, name: string}>}
 */
export function buildColorMap(subjectIds) {
  const map = new Map();
  subjectIds.forEach((id, i) => {
    map.set(id, PALETTE[i % PALETTE.length]);
  });
  return map;
}
