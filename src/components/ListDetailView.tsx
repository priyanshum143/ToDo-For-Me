import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { Task } from '../types/task';
import {
  formatHeadingDate,
  parseDateKey,
  todayKey,
  tomorrowKey,
} from '../utils/dates';
import { tasksInList, todayTasksInList, tomorrowTasksInList } from '../utils/listTasks';
import { AllTasksSection } from './AllTasksSection';
import { TaskSection } from './TaskSection';

interface ListDetailViewProps {
  listName: string;
  listId: string;
  tasks: Task[];
  onAddToday: () => void;
  onAddTomorrow: () => void;
  onAddAll: () => void;
  onToggle: (taskId: string, dateKey: string) => void;
  onEdit: (task: Task, section: 'today' | 'tomorrow') => void;
  onDeleteTasks: (taskIds: string[]) => void;
  onDeleteAllInList: () => void;
}

export function ListDetailView({
  listName,
  listId,
  tasks,
  onAddToday,
  onAddTomorrow,
  onAddAll,
  onToggle,
  onEdit,
  onDeleteTasks,
  onDeleteAllInList,
}: ListDetailViewProps) {
  const listTasks = useMemo(() => tasksInList(tasks, listId), [tasks, listId]);
  const today = todayKey();
  const tomorrow = tomorrowKey();
  const todayTasks = useMemo(() => todayTasksInList(tasks, listId), [tasks, listId]);
  const tomorrowTasks = useMemo(() => tomorrowTasksInList(tasks, listId), [tasks, listId]);

  return (
    <View style={styles.wrap}>
      <View style={styles.listHeader}>
        <Text style={styles.listEmoji}>📁</Text>
        <Text style={styles.listTitle}>{listName}</Text>
      </View>

      <TaskSection
        title="My Day"
        dateLabel={formatHeadingDate(new Date())}
        dateKey={today}
        tasks={todayTasks}
        onAdd={onAddToday}
        onToggle={(id) => onToggle(id, today)}
        onEdit={(task) => onEdit(task, 'today')}
      />

      <TaskSection
        title="Tomorrow"
        dateLabel={formatHeadingDate(parseDateKey(tomorrow))}
        dateKey={tomorrow}
        tasks={tomorrowTasks}
        onAdd={onAddTomorrow}
        onToggle={(id) => onToggle(id, tomorrow)}
        onEdit={(task) => onEdit(task, 'tomorrow')}
      />

      <AllTasksSection
        tasks={listTasks}
        onAdd={onAddAll}
        onToggle={onToggle}
        onEdit={onEdit}
        onDeleteTasks={onDeleteTasks}
        onDeleteAllTasks={onDeleteAllInList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.listsBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lists + '33',
  },
  listEmoji: {
    fontSize: 28,
  },
  listTitle: {
    ...typography.h1,
    color: colors.text,
    flex: 1,
  },
});
