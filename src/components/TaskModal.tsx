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
import type { Recurrence, Task } from '../types/task';
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

  const activeSection = pickSchedule && !editingTask ? scheduleSection : section;
  const dueDateKey = defaultDueDateForSection(activeSection);

  useEffect(() => {
    if (visible) {
      setScheduleSection(section);
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

  const handleDelete = () => {
    if (!editingTask || !onDelete) return;
    Alert.alert('Delete task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(editingTask.id);
          onClose();
        },
      },
    ]);
  };

  const sectionLabel =
    activeSection === 'today' ? 'My Day (today)' : 'Tomorrow';

  const heading = editingTask
    ? 'Edit task'
    : pickSchedule
      ? 'New task — All tasks'
      : `New task — ${activeSection === 'today' ? 'My Day' : 'Tomorrow'}`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
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
              <Pressable onPress={handleDelete}>
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
});
