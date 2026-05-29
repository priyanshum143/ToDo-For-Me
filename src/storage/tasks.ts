import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LIST_ID } from '../types/list';
import type { Task } from '../types/task';

const STORAGE_KEY = '@todo_tasks';

function migrateTask(task: Task): Task {
  return {
    ...task,
    listId: task.listId ?? DEFAULT_LIST_ID,
  };
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateTask);
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTaskId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
