export const MONTH_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getMonthFromDate(dateStr, fallbackMonth = 'September') {
  if (!dateStr || typeof dateStr !== 'string') return fallbackMonth;
  const clean = dateStr.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 2) {
      const mIdx = parseInt(parts[1], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return MONTH_LIST[mIdx];
      }
    }
  }
  return fallbackMonth;
}
