// Returns a Date set to Monday 00:00:00 of the week containing `date`
export function getMondayOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

// "2026-06-01" — uses local date components to avoid UTC timezone shift
export function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// "Jun 1"
export function formatShort(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Returns Monday date string for weekIndex relative to current week
// weekIndex 3 = current week, 0 = 3 weeks ago
export function getMondayForWeekIndex(weekIndex, currentMonday) {
  const offset = weekIndex - 3; // 0 = current, -1 = last, etc.
  const d = new Date(currentMonday);
  d.setDate(d.getDate() + offset * 7);
  return d;
}

// 0=Sunday, 1=Mon ... 6=Sat  →  0=Mon ... 6=Sun
export function jsWeekdayToIndex(jsDay) {
  return jsDay === 0 ? 6 : jsDay - 1;
}
