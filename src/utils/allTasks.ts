import type { Task } from '../types/task';
import { addDays, parseDateKey, startOfDay, todayKey, tomorrowKey, toDateKey } from './dates';
import { isTaskCompletedOnDate, taskOccursOnDate } from './recurrence';

export interface TaskOccurrence {
  task: Task;
  dateKey: string;
}

const MAX_LOOKAHEAD_DAYS = 366;

function taskStartDate(task: Task): Date {
  const created = new Date(task.createdAt);
  return startOfDay(isNaN(created.getTime()) ? new Date() : created);
}

/** All past date keys for one task: every scheduled day + any recorded completion day */
export function getPastDateKeysForTask(task: Task): string[] {
  const today = todayKey();
  const todayDate = parseDateKey(today);
  const dates = new Set<string>();

  for (const dateKey of task.completedDates) {
    if (dateKey < today) dates.add(dateKey);
  }

  if (task.recurrence.type === 'none') {
    if (task.dueDate && task.dueDate < today) dates.add(task.dueDate);
    return [...dates].sort((a, b) => b.localeCompare(a));
  }

  const start = taskStartDate(task);
  let cursor = addDays(todayDate, -1);
  while (cursor >= start) {
    if (taskOccursOnDate(task, cursor)) {
      dates.add(toDateKey(cursor));
    }
    cursor = addDays(cursor, -1);
  }

  return [...dates].sort((a, b) => b.localeCompare(a));
}

export function findNextOccurrenceAfter(task: Task, afterDate: Date): string | null {
  let cursor = addDays(afterDate, 1);
  for (let i = 0; i < MAX_LOOKAHEAD_DAYS; i++) {
    if (taskOccursOnDate(task, cursor)) {
      return toDateKey(cursor);
    }
    cursor = addDays(cursor, 1);
  }
  return null;
}

/** Flat list of every past occurrence (newest first) */
export function getAllPastOccurrences(tasks: Task[]): TaskOccurrence[] {
  const occurrences: TaskOccurrence[] = [];
  for (const task of tasks) {
    for (const dateKey of getPastDateKeysForTask(task)) {
      occurrences.push({ task, dateKey });
    }
  }
  return occurrences.sort(
    (a, b) => b.dateKey.localeCompare(a.dateKey) || a.task.title.localeCompare(b.task.title)
  );
}

export function getTodayOccurrences(tasks: Task[]): TaskOccurrence[] {
  const today = startOfDay(new Date());
  const key = toDateKey(today);

  return tasks
    .filter((t) => taskOccursOnDate(t, today))
    .map((task) => ({ task, dateKey: key }))
    .sort((a, b) => a.task.title.localeCompare(b.task.title));
}

/** One next occurrence per task, strictly after today */
export function getUpcomingOccurrences(tasks: Task[]): TaskOccurrence[] {
  const today = startOfDay(new Date());
  const occurrences: TaskOccurrence[] = [];

  for (const task of tasks) {
    const nextKey = findNextOccurrenceAfter(task, today);
    if (nextKey) {
      occurrences.push({ task, dateKey: nextKey });
    }
  }

  return occurrences.sort(
    (a, b) => a.dateKey.localeCompare(b.dateKey) || a.task.title.localeCompare(b.task.title)
  );
}

export function sectionForDateKey(dateKey: string): 'today' | 'tomorrow' {
  if (dateKey === todayKey()) return 'today';
  if (dateKey === tomorrowKey()) return 'tomorrow';
  return 'today';
}
