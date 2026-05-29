import type { Task } from '../types/task';
import { parseDateKey, toDateKey } from './dates';

export function taskOccursOnDate(task: Task, date: Date): boolean {
  const key = toDateKey(date);
  const { recurrence, dueDate } = task;

  switch (recurrence.type) {
    case 'none':
      return dueDate === key;
    case 'daily':
      return true;
    case 'weekdays': {
      const day = date.getDay();
      return day >= 1 && day <= 5;
    }
    case 'weekends': {
      const day = date.getDay();
      return day === 0 || day === 6;
    }
    case 'weekly':
      return date.getDay() === (recurrence.dayOfWeek ?? 1);
    case 'daysOfWeek':
      return (recurrence.daysOfWeek ?? []).includes(date.getDay());
    case 'monthly':
      return (recurrence.daysOfMonth ?? []).includes(date.getDate());
    default:
      return false;
  }
}

export function isTaskCompletedOnDate(task: Task, dateKey: string): boolean {
  if (task.recurrence.type === 'none') {
    return task.completedDates.length > 0;
  }
  return task.completedDates.includes(dateKey);
}

export function tasksForDate(allTasks: Task[], date: Date): Task[] {
  const key = toDateKey(date);
  return allTasks
    .filter((t) => taskOccursOnDate(t, date))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function formatDueLabel(task: Task): string {
  if (task.recurrence.type !== 'none') {
    return recurrenceSummary(task);
  }
  if (!task.dueDate) return '';
  return task.dueDate;
}

export function recurrenceSummary(task: Task): string {
  const { recurrence } = task;
  switch (recurrence.type) {
    case 'none':
      return task.dueDate ?? '';
    case 'daily':
      return 'Repeats daily';
    case 'weekdays':
      return 'Repeats weekdays';
    case 'weekends':
      return 'Repeats weekends';
    case 'weekly': {
      const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Repeats weekly on ${labels[recurrence.dayOfWeek ?? 1]}`;
    }
    case 'daysOfWeek': {
      const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = (recurrence.daysOfWeek ?? [])
        .sort()
        .map((d) => labels[d])
        .join(', ');
      return `Repeats on ${days || '—'}`;
    }
    case 'monthly': {
      const days = (recurrence.daysOfMonth ?? []).sort((a, b) => a - b).join(', ');
      return `Repeats monthly on day ${days || '—'}`;
    }
    default:
      return '';
  }
}

export function defaultDueDateForSection(section: 'today' | 'tomorrow'): string {
  const now = new Date();
  if (section === 'today') return toDateKey(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateKey(tomorrow);
}

export { parseDateKey };
