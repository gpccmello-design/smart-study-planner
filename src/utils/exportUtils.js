/**
 * exportUtils.js
 * --------------
 * Utilities for exporting the study plan as CSV or triggering a print/PDF.
 */

/**
 * Builds a CSV string from the plan and triggers a blob download.
 * Columns: Date, Weekday, Subject, Hours
 */
export function exportCSV(plan, subjects) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const rows = [['Date', 'Weekday', 'Subject', 'Hours']];

  plan.forEach(({ date, sessions }) => {
    const dateObj = new Date(date + 'T00:00:00');
    const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
    sessions.forEach(({ subjectId, subjectName, hours }) => {
      const name = subjectMap.get(subjectId) ?? subjectName;
      rows.push([date, weekday, name, hours]);
    });
  });

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'study-plan.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers the browser's print dialog (for PDF export).
 */
export function exportPrint() {
  window.print();
}
