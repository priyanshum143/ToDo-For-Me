import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import {
  DAY_LABELS,
  RECURRENCE_LABELS,
  type Recurrence,
  type RecurrenceType,
} from '../types/task';

const RECURRENCE_TYPES: RecurrenceType[] = [
  'none',
  'daily',
  'weekdays',
  'weekends',
  'weekly',
  'daysOfWeek',
  'monthly',
];

interface RecurrencePickerProps {
  value: Recurrence;
  onChange: (recurrence: Recurrence) => void;
}

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
  const setType = (type: RecurrenceType) => {
    switch (type) {
      case 'none':
        onChange({ type: 'none' });
        break;
      case 'daily':
      case 'weekdays':
      case 'weekends':
        onChange({ type });
        break;
      case 'weekly':
        onChange({ type: 'weekly', dayOfWeek: value.dayOfWeek ?? 1 });
        break;
      case 'daysOfWeek':
        onChange({ type: 'daysOfWeek', daysOfWeek: value.daysOfWeek ?? [] });
        break;
      case 'monthly':
        onChange({ type: 'monthly', daysOfMonth: value.daysOfMonth ?? [] });
        break;
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const current = value.daysOfWeek ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onChange({ type: 'daysOfWeek', daysOfWeek: next });
  };

  const toggleDayOfMonth = (day: number) => {
    const current = value.daysOfMonth ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onChange({ type: 'monthly', daysOfMonth: next });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Repeat</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
        {RECURRENCE_TYPES.map((type) => (
          <Pressable
            key={type}
            style={[styles.chip, value.type === type && styles.chipActive]}
            onPress={() => setType(type)}
          >
            <Text style={[styles.chipText, value.type === type && styles.chipTextActive]}>
              {RECURRENCE_LABELS[type]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {value.type === 'weekly' && (
        <View style={styles.sub}>
          <Text style={styles.subLabel}>Day of week</Text>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((label, index) => (
              <Pressable
                key={label}
                style={[styles.dayChip, value.dayOfWeek === index && styles.chipActive]}
                onPress={() => onChange({ type: 'weekly', dayOfWeek: index })}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    value.dayOfWeek === index && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {value.type === 'daysOfWeek' && (
        <View style={styles.sub}>
          <Text style={styles.subLabel}>Select days</Text>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((label, index) => {
              const selected = (value.daysOfWeek ?? []).includes(index);
              return (
                <Pressable
                  key={label}
                  style={[styles.dayChip, selected && styles.chipActive]}
                  onPress={() => toggleDayOfWeek(index)}
                >
                  <Text style={[styles.dayChipText, selected && styles.chipTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {value.type === 'monthly' && (
        <View style={styles.sub}>
          <Text style={styles.subLabel}>Days of month (tap to toggle)</Text>
          <View style={styles.monthGrid}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const selected = (value.daysOfMonth ?? []).includes(day);
              return (
                <Pressable
                  key={day}
                  style={[styles.monthChip, selected && styles.chipActive]}
                  onPress={() => toggleDayOfMonth(day)}
                >
                  <Text style={[styles.monthChipText, selected && styles.chipTextActive]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
  },
  label: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeRow: {
    maxHeight: 48,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sub: {
    marginTop: spacing.md,
  },
  subLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 44,
    alignItems: 'center',
  },
  dayChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  monthChip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
