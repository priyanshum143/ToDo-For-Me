import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { Task } from '../types/task';
import { isTaskCompletedOnDate, recurrenceSummary } from '../utils/recurrence';

interface TaskItemProps {
  task: Task;
  dateKey: string;
  dateLabel?: string;
  showStatus?: boolean;
  onToggle?: () => void;
  onPress: () => void;
}

export function TaskItem({
  task,
  dateKey,
  dateLabel,
  showStatus,
  onToggle,
  onPress,
}: TaskItemProps) {
  const completed = isTaskCompletedOnDate(task, dateKey);
  const repeatLabel = task.recurrence.type !== 'none' ? recurrenceSummary(task) : null;
  const statusLabel = showStatus ? (completed ? 'Completed' : 'Not completed') : null;

  const Checkbox = onToggle ? Pressable : View;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <Checkbox
        style={[styles.checkbox, completed && styles.checkboxDone]}
        onPress={onToggle}
        hitSlop={10}
      >
        {completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </Checkbox>
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.titleDone]}>{task.title}</Text>
        {dateLabel ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{dateLabel}</Text>
          </View>
        ) : null}
        {statusLabel ? (
          <Text style={[styles.meta, completed ? styles.statusDone : styles.statusPending]}>
            {statusLabel}
          </Text>
        ) : null}
        {repeatLabel ? <Text style={styles.meta}>{repeatLabel}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: colors.checkbox,
    borderRadius: radius.sm,
    marginRight: spacing.md,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.checkboxDone,
    borderColor: colors.checkboxDone,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusDone: {
    color: colors.success,
    fontWeight: '600',
  },
  statusPending: {
    color: colors.warning,
    fontWeight: '600',
  },
});
