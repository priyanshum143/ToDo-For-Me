import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { colors, common, radius, spacing, typography } from '../theme';
import type { Task } from '../types/task';
import { buildDayText, shareDayText } from '../utils/exportDay';
import { Card } from './Card';
import { TaskItem } from './TaskItem';

interface TaskSectionProps {
  title: string;
  dateLabel: string;
  dateKey: string;
  tasks: Task[];
  onAdd: () => void;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskSection({
  title,
  dateLabel,
  dateKey,
  tasks,
  onAdd,
  onToggle,
  onEdit,
}: TaskSectionProps) {
  const [exportLabel, setExportLabel] = useState('Export');

  const handleExport = () => {
    const text = buildDayText(title, dateLabel, tasks, dateKey);
    shareDayText(text, title).then(() => {
      if (Platform.OS === 'web') {
        setExportLabel('Copied!');
        setTimeout(() => setExportLabel('Export'), 1500);
      }
    }).catch(() => {
      setExportLabel('Error');
      setTimeout(() => setExportLabel('Export'), 1500);
    });
  };

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>
        <View style={styles.headerActions}>
          {tasks.length > 0 && (
            <Pressable onPress={handleExport} hitSlop={8} style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>{exportLabel}</Text>
            </Pressable>
          )}
          <Pressable onPress={onAdd} style={styles.addBtn} hitSlop={8}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.divider} />
      {tasks.length === 0 ? (
        <Text style={common.empty}>No tasks yet</Text>
      ) : (
        tasks.map((task, index) => (
          <View key={task.id}>
            {index > 0 && <View style={styles.itemDivider} />}
            <TaskItem
              task={task}
              dateKey={dateKey}
              onToggle={() => onToggle(task.id)}
              onPress={() => onEdit(task)}
            />
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  dateLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exportBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportBtnText: {
    ...typography.link,
    color: colors.textSecondary,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addBtnText: {
    ...typography.link,
    color: colors.primary,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 38,
  },
});
