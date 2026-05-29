import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TaskList } from '../types/list';

const STORAGE_KEY = '@todo_lists';

export async function loadLists(): Promise<TaskList[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TaskList[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveLists(lists: TaskList[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function createListId(): string {
  return `list-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
