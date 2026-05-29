export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return startOfDay(d);
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return startOfDay(new Date(y, m - 1, d));
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function tomorrowKey(): string {
  return toDateKey(addDays(new Date(), 1));
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

export function isTomorrow(key: string): boolean {
  return key === tomorrowKey();
}

/** e.g. "Thursday, May 28, 2026" for section headings */
export function formatHeadingDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatHeadingDateFromKey(key: string): string {
  return formatHeadingDate(parseDateKey(key));
}

/** Shorter label for task rows in All Tasks */
export function formatShortDateFromKey(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
