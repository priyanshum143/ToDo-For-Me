export type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'weekly'
  | 'daysOfWeek'
  | 'monthly';

export interface Recurrence {
  type: RecurrenceType;
  /** 0 = Sunday … 6 = Saturday (for `weekly`) */
  dayOfWeek?: number;
  /** Multiple weekdays (for `daysOfWeek`) */
  daysOfWeek?: number[];
  /** 1–31 (for `monthly`) */
  daysOfMonth?: number[];
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  /** YYYY-MM-DD — used when recurrence.type is `none` */
  dueDate?: string;
  recurrence: Recurrence;
  /** Dates (YYYY-MM-DD) this recurring task was completed */
  completedDates: string[];
  createdAt: string;
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'Does not repeat',
  daily: 'Every day',
  weekdays: 'Weekdays (Mon–Fri)',
  weekends: 'Weekends (Sat–Sun)',
  weekly: 'Once a week',
  daysOfWeek: 'On selected days of week',
  monthly: 'On selected days of month',
};
