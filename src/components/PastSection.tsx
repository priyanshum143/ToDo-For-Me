import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, common, spacing, typography } from '../theme';
import type { Task } from '../types/task';
import { getAllPastOccurrences, sectionForDateKey } from '../utils/allTasks';
import { formatShortDateFromKey } from '../utils/dates';
import { TaskItem } from './TaskItem';

interface PastSectionProps {
  tasks: Task[];
  onToggle: (taskId: string, dateKey: string) => void;
  onEdit: (task: Task, section: 'today' | 'tomorrow') => void;
  embedded?: boolean;
}

export function PastSection({ tasks, onToggle, onEdit, embedded }: PastSectionProps) {
  const items = useMemo(() => getAllPastOccurrences(tasks), [tasks]);

  return (
    <View style={embedded ? styles.embedded : styles.section}>
      <Text style={embedded ? styles.subTitle : styles.title}>Past</Text>
      {items.length === 0 ? (
        <Text style={common.empty}>No past tasks</Text>
      ) : (
        <View style={embedded ? styles.list : undefined}>
          {items.map(({ task, dateKey }, index) => (
            <View key={`${task.id}-${dateKey}`}>
              {embedded && index > 0 && <View style={styles.divider} />}
              <TaskItem
                task={task}
                dateKey={dateKey}
                dateLabel={formatShortDateFromKey(dateKey)}
                onToggle={() => onToggle(task.id, dateKey)}
                onPress={() => onEdit(task, sectionForDateKey(dateKey))}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  embedded: {
    marginTop: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    backgroundColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 38,
  },
});
