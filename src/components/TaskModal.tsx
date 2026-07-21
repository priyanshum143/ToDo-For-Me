import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, common, radius, spacing, typography } from '../theme';
import { DAY_LABELS, type Recurrence, type Task } from '../types/task';
import { confirmDestructive } from '../utils/confirm';
import { defaultDueDateForSection } from '../utils/recurrence';
import { RecurrencePicker } from './RecurrencePicker';

export type TaskModalSection = 'today' | 'tomorrow';

interface TaskModalProps {
  visible: boolean;
  section: TaskModalSection;
  /** When adding from All tasks, let user pick today or tomorrow */
  pickSchedule?: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSave: (title: string, dueDateKey: string, recurrence: Recurrence) => void;
  onDelete?: (id: string) => void;
}

export function TaskModal({
  visible,
  section,
  pickSchedule = false,
  editingTask,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>({ type: 'none' });
  const [scheduleSection, setScheduleSection] = useState<TaskModalSection>(section);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const activeSection = pickSchedule && !editingTask ? scheduleSection : section;
  const dueDateKey = defaultDueDateForSection(activeSection);

  useEffect(() => {
    if (visible) {
      setScheduleSection(section);
      setDeleteMode(false);
      setSelectedDays([]);
      if (editingTask) {
        setTitle(editingTask.title);
        setRecurrence(editingTask.recurrence);
      } else {
        setTitle('');
        setRecurrence({ type: 'none' });
      }
    }
  }, [visible, editingTask, section]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    if (recurrence.type === 'daysOfWeek' && !(recurrence.daysOfWeek?.length)) {
      Alert.alert('Select days', 'Pick at least one day of the week.');
      return;
    }
    if (recurrence.type === 'monthly' && !(recurrence.daysOfMonth?.length)) {
      Alert.alert('Select days', 'Pick at least one day of the month.');
      return;
    }
    const due =
      editingTask?.recurrence.type === 'none' && editingTask.dueDate
        ? editingTask.dueDate
        : dueDateKey;
    onSave(trimmed, due, recurrence);
    onClose();
  };

  const handleDeletePress = () => {
    if (!editingTask || !onDelete) return;
    const { recurrence: r } = editingTask;
    if (r.type === 'daysOfWeek' || r.type === 'monthly') {
      setDeleteMode(true);
      setSelectedDays([]);
    } else {
      confirmDestructive('Delete task', 'Remove this task?', 'Delete', () => {
        onDelete(editingTask.id);
        onClose();
      });
    }
  };

  const handleDeleteEntire = () => {
    if (!editingTask || !onDelete) return;
    confirmDestructive(
      'Delete entire task',
      'Remove this task and all its occurrences?',
      'Delete',
      () => {
        onDelete(editingTask.id);
        onClose();
      }
    );
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDeleteSelectedDays = () => {
    if (!editingTask || !onDelete || selectedDays.length === 0) return;
    const { recurrence: r } = editingTask;

    if (r.type === 'daysOfWeek') {
      const remaining = (r.daysOfWeek ?? []).filter((d) => !selectedDays.includes(d));
      if (remaining.length === 0) {
        confirmDestructive(
          'Delete entire task',
          'Removing all days deletes the task entirely. Continue?',
          'Delete',
          () => {
            onDelete(editingTask.id);
            onClose();
          }
        );
      } else {
        onSave(editingTask.title, editingTask.dueDate ?? dueDateKey, {
          type: 'daysOfWeek',
          daysOfWeek: remaining,
        });
        onClose();
      }
    } else if (r.type === 'monthly') {
      const remaining = (r.daysOfMonth ?? []).filter((d) => !selectedDays.includes(d));
      if (remaining.length === 0) {
        confirmDestructive(
          'Delete entire task',
          'Removing all days deletes the task entirely. Continue?',
          'Delete',
          () => {
            onDelete(editingTask.id);
            onClose();
          }
        );
      } else {
        onSave(editingTask.title, editingTask.dueDate ?? dueDateKey, {
          type: 'monthly',
          daysOfMonth: remaining,
        });
        onClose();
      }
    }
  };

  const sectionLabel =
    activeSection === 'today' ? 'My Day (today)' : 'Tomorrow';

  const heading = editingTask
    ? 'Edit task'
    : pickSchedule
      ? 'New task — All tasks'
      : `New task — ${activeSection === 'today' ? 'My Day' : 'Tomorrow'}`;

  const renderDeleteMode = () => {
    if (!editingTask) return null;
    const { recurrence: r } = editingTask;

    if (r.type === 'daysOfWeek') {
      const days = r.daysOfWeek ?? [];
      return (
        <>
          <Text style={styles.heading}>Delete occurrences</Text>
          <Text style={styles.hint}>Select the days to remove from "{editingTask.title}"</Text>
          <View style={styles.dayGrid}>
            {days.sort().map((day) => {
              const active = selectedDays.includes(day);
              return (
                <Pressable
                  key={day}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                    {DAY_LABELS[day]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actions}>
            <Pressable onPress={handleDeleteEntire}>
              <Text style={styles.deleteBtn}>Delete entire task</Text>
            </Pressable>
            <View style={styles.actionsRight}>
              <Pressable onPress={() => setDeleteMode(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteSelectedDays}
                style={[styles.btnPrimary, selectedDays.length === 0 && styles.btnDisabled]}
                disabled={selectedDays.length === 0}
              >
                <Text style={styles.btnPrimaryText}>
                  Remove{selectedDays.length > 0 ? ` (${selectedDays.length})` : ''}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      );
    }

    if (r.type === 'monthly') {
      const days = r.daysOfMonth ?? [];
      return (
        <>
          <Text style={styles.heading}>Delete occurrences</Text>
          <Text style={styles.hint}>Select the days of the month to remove from "{editingTask.title}"</Text>
          <View style={styles.monthGrid}>
            {days.sort((a, b) => a - b).map((day) => {
              const active = selectedDays.includes(day);
              return (
                <Pressable
                  key={day}
                  style={[styles.monthChip, active && styles.dayChipActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.monthChipText, active && styles.dayChipTextActive]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actions}>
            <Pressable onPress={handleDeleteEntire}>
              <Text style={styles.deleteBtn}>Delete entire task</Text>
            </Pressable>
            <View style={styles.actionsRight}>
              <Pressable onPress={() => setDeleteMode(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteSelectedDays}
                style={[styles.btnPrimary, selectedDays.length === 0 && styles.btnDisabled]}
                disabled={selectedDays.length === 0}
              >
                <Text style={styles.btnPrimaryText}>
                  Remove{selectedDays.length > 0 ? ` (${selectedDays.length})` : ''}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      );
    }

    return null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {deleteMode ? (
            renderDeleteMode()
          ) : (
            <>
              <Text style={styles.heading}>{heading}</Text>
              <TextInput
                style={styles.input}
                placeholder="What do you need to do?"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                autoFocus={!editingTask}
              />
              {pickSchedule && !editingTask && (
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>Schedule for</Text>
                  <View style={styles.scheduleChips}>
                    {(['today', 'tomorrow'] as TaskModalSection[]).map((s) => (
                      <Pressable
                        key={s}
                        style={[
                          styles.scheduleChip,
                          scheduleSection === s && styles.scheduleChipActive,
                        ]}
                        onPress={() => setScheduleSection(s)}
                      >
                        <Text
                          style={[
                            styles.scheduleChipText,
                            scheduleSection === s && styles.scheduleChipTextActive,
                          ]}
                        >
                          {s === 'today' ? 'Today' : 'Tomorrow'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
              {!editingTask && recurrence.type === 'none' && !pickSchedule && (
                <Text style={styles.hint}>
                  Due: {activeSection === 'today' ? 'Today' : 'Tomorrow'}
                </Text>
              )}
              {!editingTask && recurrence.type === 'none' && pickSchedule && (
                <Text style={styles.hint}>Due: {sectionLabel}</Text>
              )}
              <RecurrencePicker value={recurrence} onChange={setRecurrence} />
              <View style={styles.actions}>
                {editingTask && onDelete ? (
                  <Pressable onPress={handleDeletePress}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                <View style={styles.actionsRight}>
                  <Pressable onPress={onClose} style={styles.btnSecondary}>
                    <Text style={styles.btnSecondaryText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSave} style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h1,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.borderLight,
  },
  hint: {
    marginTop: spacing.sm,
    ...typography.small,
    color: colors.textSecondary,
  },
  scheduleRow: {
    marginTop: spacing.md,
  },
  scheduleLabel: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scheduleChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scheduleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scheduleChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scheduleChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  actionsRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnSecondary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
  },
  btnSecondaryText: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  btnPrimary: {
    ...common.primaryBtn,
    paddingHorizontal: spacing.xl,
  },
  btnPrimaryText: common.primaryBtnText,
  deleteBtn: {
    ...common.dangerLink,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 52,
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  dayChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dayChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  monthChip: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
