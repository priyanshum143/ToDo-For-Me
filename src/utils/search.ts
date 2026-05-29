import type { Task } from '../types/task';
import { findNextOccurrenceAfter } from './allTasks';
import {
  addDays,
  formatHeadingDateFromKey,
  parseDateKey,
  startOfDay,
  todayKey,
  tomorrowKey,
  toDateKey,
} from './dates';
import { taskOccursOnDate } from './recurrence';

export type SearchMatchReason = 'date' | 'title';

export interface SearchResult {
  task: Task;
  dateKey: string;
  matchReason: SearchMatchReason;
}

/** Try to turn user input into YYYY-MM-DD */
export function parseSearchDate(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower === 'today') return todayKey();
  if (lower === 'tomorrow') return tomorrowKey();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = parseDateKey(trimmed);
    if (!isNaN(d.getTime())) return toDateKey(d);
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (slashMatch) {
    const a = Number(slashMatch[1]);
    const b = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    // Prefer DD/MM when day > 12, else try both
    let day = a;
    let month = b;
    if (a <= 12 && b > 12) {
      month = a;
      day = b;
    }
    const d = startOfDay(new Date(year, month - 1, day));
    if (!isNaN(d.getTime()) && d.getFullYear() === year) return toDateKey(d);
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime()) && trimmed.length >= 4) {
    return toDateKey(startOfDay(parsed));
  }

  return null;
}

function displayDateForTitleMatch(task: Task): string {
  const today = startOfDay(new Date());
  if (taskOccursOnDate(task, today)) return toDateKey(today);
  if (task.recurrence.type === 'none' && task.dueDate) return task.dueDate;
  const next = findNextOccurrenceAfter(task, addDays(today, -1));
  return next ?? todayKey();
}

export function searchTasks(tasks: Task[], query: string): {
  dateKey: string | null;
  dateLabel: string | null;
  results: SearchResult[];
} {
  const trimmed = query.trim();
  if (!trimmed) {
    return { dateKey: null, dateLabel: null, results: [] };
  }

  const parsedDate = parseSearchDate(trimmed);
  const titleQuery = trimmed.toLowerCase();
  const seen = new Set<string>();
  const results: SearchResult[] = [];

  const add = (task: Task, dateKey: string, reason: SearchMatchReason) => {
    const key = `${task.id}-${dateKey}-${reason}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ task, dateKey, matchReason: reason });
  };

  if (parsedDate) {
    const date = parseDateKey(parsedDate);
    for (const task of tasks) {
      if (taskOccursOnDate(task, date)) {
        add(task, parsedDate, 'date');
      }
    }
  }

  for (const task of tasks) {
    if (!task.title.toLowerCase().includes(titleQuery)) continue;
    const dateKey = parsedDate && taskOccursOnDate(task, parseDateKey(parsedDate))
      ? parsedDate
      : displayDateForTitleMatch(task);
    add(task, dateKey, 'title');
  }

  results.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    if (a.matchReason !== b.matchReason) return a.matchReason === 'date' ? -1 : 1;
    return a.task.title.localeCompare(b.task.title);
  });

  return {
    dateKey: parsedDate,
    dateLabel: parsedDate ? formatHeadingDateFromKey(parsedDate) : null,
    results,
  };
}
