import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { formatHeadingDate, parseDateKey, tomorrowKey } from '../utils/dates';

export type SectionId = 'today' | 'tomorrow' | 'all' | 'lists';

interface SectionMenuProps {
  onSelect: (section: SectionId) => void;
  taskCount: number;
}

const SECTIONS: {
  id: SectionId;
  title: string;
  emoji: string;
  accent: string;
  accentBg: string;
  subtitle?: (() => string) | string;
}[] = [
  {
    id: 'today',
    title: 'Today',
    emoji: '☀️',
    accent: colors.today,
    accentBg: colors.todayBg,
    subtitle: () => formatHeadingDate(new Date()),
  },
  {
    id: 'tomorrow',
    title: 'Tomorrow',
    emoji: '📅',
    accent: colors.tomorrow,
    accentBg: colors.tomorrowBg,
    subtitle: () => formatHeadingDate(parseDateKey(tomorrowKey())),
  },
  {
    id: 'all',
    title: 'All tasks',
    emoji: '📋',
    accent: colors.all,
    accentBg: colors.allBg,
    subtitle: 'Today, upcoming, past & more',
  },
  {
    id: 'lists',
    title: 'Lists',
    emoji: '📁',
    accent: colors.lists,
    accentBg: colors.listsBg,
    subtitle: 'Create a new list',
  },
];

export function SectionMenu({ onSelect, taskCount }: SectionMenuProps) {
  return (
    <View style={styles.menu}>
      {SECTIONS.map(({ id, title, emoji, accent, accentBg, subtitle }) => {
        const sub = typeof subtitle === 'function' ? subtitle() : subtitle;
        return (
          <Pressable
            key={id}
            style={({ pressed }) => [
              styles.button,
              { borderLeftColor: accent, backgroundColor: pressed ? accentBg : colors.surface },
            ]}
            onPress={() => onSelect(id)}
          >
            <View style={[styles.iconWrap, { backgroundColor: accentBg }]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.buttonTitle}>{title}</Text>
              {sub ? <Text style={styles.buttonSub}>{sub}</Text> : null}
            </View>
            <Text style={[styles.chevron, { color: accent }]}>›</Text>
          </Pressable>
        );
      })}
      {taskCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {taskCount} task{taskCount === 1 ? '' : 's'} saved on this device
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  textBlock: {
    flex: 1,
  },
  buttonTitle: {
    ...typography.h2,
    color: colors.text,
  },
  buttonSub: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
  },
  badge: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
