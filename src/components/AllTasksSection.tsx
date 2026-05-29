import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../types/task';
import { confirmDestructive } from '../utils/confirm';
import type { TaskOccurrence } from '../utils/allTasks';
import {
  getTodayOccurrences,
  getUpcomingOccurrences,
  sectionForDateKey,
} from '../utils/allTasks';
import { formatShortDateFromKey } from '../utils/dates';
import { recurrenceSummary } from '../utils/recurrence';
import { colors, common, radius, spacing, typography } from '../theme';
import { Card } from './Card';
import { PastSection } from './PastSection';
import { TaskItem } from './TaskItem';

interface AllTasksSectionProps {
  tasks: Task[];
  onAdd: () => void;
  onToggle: (taskId: string, dateKey: string) => void;
  onEdit: (task: Task, section: 'today' | 'tomorrow') => void;
  onDeleteTasks: (taskIds: string[]) => void;
  onDeleteAllTasks: () => void;
}

function OccurrenceList({
  items,
  onToggle,
  onEdit,
  showDate,
}: {
  items: TaskOccurrence[];
  onToggle: (taskId: string, dateKey: string) => void;
  onEdit: (task: Task, section: 'today' | 'tomorrow') => void;
  showDate: boolean;
}) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No tasks</Text>;
  }

  return (
    <>
      {items.map(({ task, dateKey }) => (
        <TaskItem
          key={`${task.id}-${dateKey}`}
          task={task}
          dateKey={dateKey}
          dateLabel={showDate ? formatShortDateFromKey(dateKey) : undefined}
          onToggle={() => onToggle(task.id, dateKey)}
          onPress={() => onEdit(task, sectionForDateKey(dateKey))}
        />
      ))}
    </>
  );
}

export function AllTasksSection({
  tasks,
  onAdd,
  onToggle,
  onEdit,
  onDeleteTasks,
  onDeleteAllTasks,
}: AllTasksSectionProps) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.title.localeCompare(b.title)),
    [tasks]
  );

  const todayItems = getTodayOccurrences(tasks);
  const upcoming = getUpcomingOccurrences(tasks);

  const allSelected = tasks.length > 0 && selected.size === tasks.length;

  const exitSelectMode = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const toggleTask = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tasks.map((t) => t.id)));
    }
  };

  const handleDeleteSelected = () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    confirmDestructive(
      'Delete tasks',
      `Delete ${ids.length} task${ids.length === 1 ? '' : 's'}? This removes each task, all past history, and future occurrences.`,
      'Delete',
      () => {
        onDeleteTasks(ids);
        exitSelectMode();
      }
    );
  };

  const handleDeleteAll = () => {
    if (tasks.length === 0) return;
    confirmDestructive(
      'Delete all tasks',
      `Delete all ${tasks.length} tasks and start fresh? This cannot be undone.`,
      'Delete all',
      () => {
        onDeleteAllTasks();
        exitSelectMode();
      }
    );
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>All tasks</Text>
        <View style={styles.headerActions}>
          {tasks.length > 0 && (
            <Pressable
              onPress={() => (selecting ? exitSelectMode() : setSelecting(true))}
              hitSlop={8}
              style={styles.headerBtn}
            >
              <Text style={styles.link}>{selecting ? 'Cancel' : 'Select'}</Text>
            </Pressable>
          )}
          {!selecting && (
            <Pressable onPress={onAdd} hitSlop={8} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </Pressable>
          )}
        </View>
      </View>

      {selecting && tasks.length > 0 && (
        <View style={styles.toolbar}>
          <Pressable onPress={toggleSelectAll} hitSlop={8}>
            <Text style={styles.link}>{allSelected ? 'Deselect all' : 'Select all'}</Text>
          </Pressable>
          <View style={styles.toolbarRight}>
            <Pressable onPress={handleDeleteAll} hitSlop={8}>
              <Text style={styles.deleteBtn}>Delete all</Text>
            </Pressable>
            <Pressable
              onPress={handleDeleteSelected}
              hitSlop={8}
              disabled={selected.size === 0}
            >
              <Text style={[styles.deleteBtn, selected.size === 0 && styles.deleteDisabled]}>
                Delete{selected.size > 0 ? ` (${selected.size})` : ''}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {selecting ? (
        tasks.length === 0 ? (
          <Text style={styles.empty}>No tasks</Text>
        ) : (
          sortedTasks.map((task) => {
            const checked = selected.has(task.id);
            return (
              <Pressable
                key={task.id}
                style={styles.selectRow}
                onPress={() => toggleTask(task.id)}
              >
                <View style={[styles.selectBox, checked && styles.selectBoxOn]}>
                  {checked ? <Text style={styles.selectMark}>✓</Text> : null}
                </View>
                <View style={styles.selectContent}>
                  <Text style={styles.rowTitle}>{task.title}</Text>
                  <Text style={styles.rowSub}>{recurrenceSummary(task)}</Text>
                </View>
              </Pressable>
            );
          })
        )
      ) : (
        <>
          <Text style={styles.subTitle}>Today</Text>
          <OccurrenceList
            items={todayItems}
            onToggle={onToggle}
            onEdit={onEdit}
            showDate={false}
          />

          <Text style={styles.subTitle}>Upcoming (next occurrence)</Text>
          <OccurrenceList
            items={upcoming}
            onToggle={onToggle}
            onEdit={onEdit}
            showDate
          />

          {tasks.length > 0 && (
            <>
              <Text style={styles.subTitle}>Every task ({tasks.length})</Text>
              {sortedTasks.map((task) => (
                <Pressable
                  key={task.id}
                  style={styles.taskRow}
                  onPress={() => onEdit(task, 'today')}
                >
                  <Text style={styles.rowTitle}>{task.title}</Text>
                  <Text style={styles.rowSub}>{recurrenceSummary(task)}</Text>
                </Pressable>
              ))}
            </>
          )}

          <PastSection
            tasks={tasks}
            onToggle={onToggle}
            onEdit={onEdit}
            embedded
          />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBtn: {
    paddingHorizontal: spacing.sm,
  },
  mainTitle: {
    ...typography.h1,
    color: colors.text,
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
  link: {
    ...common.link,
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.borderLight,
    borderRadius: radius.md,
  },
  toolbarRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  deleteBtn: {
    ...common.dangerLink,
    fontSize: 14,
  },
  deleteDisabled: {
    color: colors.textMuted,
  },
  subTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: common.empty,
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  selectBox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBoxOn: {
    backgroundColor: colors.primary,
  },
  selectMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  selectContent: {
    flex: 1,
  },
  taskRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.borderLight,
  },
  rowTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  rowSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
