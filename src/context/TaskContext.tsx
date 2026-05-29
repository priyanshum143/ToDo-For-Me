import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createListId, loadLists, saveLists } from '../storage/lists';
import { createTaskId, loadTasks, saveTasks } from '../storage/tasks';
import { DEFAULT_LIST_ID } from '../types/list';
import type { TaskList } from '../types/list';
import type { Recurrence, Task } from '../types/task';
import { addDays, startOfDay, todayKey, tomorrowKey } from '../utils/dates';
import {
  tasksInList,
  todayTasksInList,
  tomorrowTasksInList,
} from '../utils/listTasks';
import { isTaskCompletedOnDate } from '../utils/recurrence';

interface TaskContextValue {
  tasks: Task[];
  lists: TaskList[];
  loading: boolean;
  defaultListTasks: Task[];
  todayTasks: Task[];
  tomorrowTasks: Task[];
  addTask: (
    listId: string,
    title: string,
    dueDateKey: string,
    recurrence: Recurrence
  ) => void;
  updateTask: (id: string, title: string, dueDateKey: string, recurrence: Recurrence) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  deleteAllTasksInList: (listId: string) => void;
  toggleComplete: (id: string, dateKey: string) => void;
  createList: (name: string) => TaskList;
  deleteList: (listId: string) => void;
  getListById: (listId: string) => TaskList | undefined;
}

const TaskContext = createContext<TaskContextValue | null>(null);

function buildTask(
  listId: string,
  title: string,
  dueDateKey: string,
  recurrence: Recurrence,
  existing?: Task
): Task {
  const dueDate = recurrence.type === 'none' ? dueDateKey : undefined;
  return {
    id: existing?.id ?? createTaskId(),
    listId: existing?.listId ?? listId,
    title: title.trim(),
    dueDate,
    recurrence,
    completedDates: existing?.completedDates ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadTasks(), loadLists()]).then(([loadedTasks, loadedLists]) => {
      setTasks(loadedTasks);
      setLists(loadedLists);
      setLoading(false);
    });
  }, []);

  const persistTasks = useCallback((next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  }, []);

  const persistLists = useCallback((next: TaskList[]) => {
    setLists(next);
    saveLists(next);
  }, []);

  const defaultListTasks = useMemo(
    () => tasksInList(tasks, DEFAULT_LIST_ID),
    [tasks]
  );

  const todayTasks = useMemo(
    () => todayTasksInList(tasks, DEFAULT_LIST_ID),
    [tasks]
  );

  const tomorrowTasks = useMemo(
    () => tomorrowTasksInList(tasks, DEFAULT_LIST_ID),
    [tasks]
  );

  const addTask = useCallback(
    (
      listId: string,
      title: string,
      dueDateKey: string,
      recurrence: Recurrence
    ) => {
      if (!title.trim()) return;
      const task = buildTask(listId, title, dueDateKey, recurrence);
      persistTasks([...tasks, task]);
    },
    [tasks, persistTasks]
  );

  const updateTask = useCallback(
    (id: string, title: string, dueDateKey: string, recurrence: Recurrence) => {
      if (!title.trim()) return;
      persistTasks(
        tasks.map((t) =>
          t.id === id ? buildTask(t.listId, title, dueDateKey, recurrence, t) : t
        )
      );
    },
    [tasks, persistTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      persistTasks(tasks.filter((t) => t.id !== id));
    },
    [tasks, persistTasks]
  );

  const deleteTasks = useCallback((ids: string[]) => {
    const remove = new Set(ids);
    if (remove.size === 0) return;
    setTasks((current) => {
      const next = current.filter((t) => !remove.has(t.id));
      saveTasks(next);
      return next;
    });
  }, []);

  const deleteAllTasksInList = useCallback((listId: string) => {
    setTasks((current) => {
      const next = current.filter((t) => t.listId !== listId);
      saveTasks(next);
      return next;
    });
  }, []);

  const toggleComplete = useCallback(
    (id: string, dateKey: string) => {
      setTasks((current) => {
        const next = current.map((t) => {
          if (t.id !== id) return t;
          const done = isTaskCompletedOnDate(t, dateKey);
          if (done) {
            return {
              ...t,
              completedDates: t.completedDates.filter((d) => d !== dateKey),
            };
          }
          if (t.recurrence.type === 'none') {
            return { ...t, completedDates: [dateKey] };
          }
          return { ...t, completedDates: [...t.completedDates, dateKey] };
        });
        saveTasks(next);
        return next;
      });
    },
    []
  );

  const createList = useCallback((name: string) => {
    const list: TaskList = {
      id: createListId(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setLists((current) => {
      const next = [...current, list];
      saveLists(next);
      return next;
    });
    return list;
  }, []);

  const deleteList = useCallback(
    (listId: string) => {
      persistLists(lists.filter((l) => l.id !== listId));
      setTasks((current) => {
        const next = current.filter((t) => t.listId !== listId);
        saveTasks(next);
        return next;
      });
    },
    [lists, persistLists]
  );

  const getListById = useCallback(
    (listId: string) => lists.find((l) => l.id === listId),
    [lists]
  );

  const value = useMemo(
    () => ({
      tasks,
      lists,
      loading,
      defaultListTasks,
      todayTasks,
      tomorrowTasks,
      addTask,
      updateTask,
      deleteTask,
      deleteTasks,
      deleteAllTasksInList,
      toggleComplete,
      createList,
      deleteList,
      getListById,
    }),
    [
      tasks,
      lists,
      loading,
      defaultListTasks,
      todayTasks,
      tomorrowTasks,
      addTask,
      updateTask,
      deleteTask,
      deleteTasks,
      deleteAllTasksInList,
      toggleComplete,
      createList,
      deleteList,
      getListById,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}

export { todayKey, tomorrowKey, DEFAULT_LIST_ID };
