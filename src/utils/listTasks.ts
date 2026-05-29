import type { Task } from '../types/task';
import { addDays, startOfDay } from './dates';
import { tasksForDate } from './recurrence';

export function tasksInList(tasks: Task[], listId: string): Task[] {
  return tasks.filter((t) => t.listId === listId);
}

export function todayTasksInList(tasks: Task[], listId: string): Task[] {
  return tasksForDate(tasksInList(tasks, listId), startOfDay(new Date()));
}

export function tomorrowTasksInList(tasks: Task[], listId: string): Task[] {
  return tasksForDate(tasksInList(tasks, listId), addDays(new Date(), 1));
}
