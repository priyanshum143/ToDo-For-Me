import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, common, radius, spacing, typography } from '../theme';
import type { Task } from '../types/task';
import { sectionForDateKey } from '../utils/allTasks';
import { formatShortDateFromKey } from '../utils/dates';
import { searchTasks } from '../utils/search';
import { Card } from './Card';
import { TaskItem } from './TaskItem';

interface SearchSectionProps {
  tasks: Task[];
  query: string;
  onQueryChange: (q: string) => void;
  onToggle: (taskId: string, dateKey: string) => void;
  onEdit: (task: Task, section: 'today' | 'tomorrow') => void;
}

export function SearchSection({
  tasks,
  query,
  onQueryChange,
  onToggle,
  onEdit,
}: SearchSectionProps) {
  const { dateKey, dateLabel, results } = useMemo(
    () => searchTasks(tasks, query),
    [tasks, query]
  );

  const isSearching = query.trim().length > 0;
  const dateResults = results.filter((r) => r.matchReason === 'date');
  const titleResults = results.filter((r) => r.matchReason === 'title');

  return (
    <View style={styles.wrap}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search tasks or dates..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={onQueryChange}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {isSearching && (
        <Pressable onPress={() => onQueryChange('')} style={styles.clear}>
          <Text style={common.link}>Clear search</Text>
        </Pressable>
      )}

      {isSearching && results.length === 0 && (
        <Text style={common.empty}>No tasks found</Text>
      )}

      {isSearching && results.length > 0 && (
        <Card style={styles.resultsCard}>
          {dateKey && dateResults.length > 0 && (
            <>
              <Text style={styles.groupTitle}>On {dateLabel}</Text>
              {dateResults.map(({ task, dateKey: dk }) => (
                <TaskItem
                  key={`date-${task.id}-${dk}`}
                  task={task}
                  dateKey={dk}
                  dateLabel={formatShortDateFromKey(dk)}
                  onToggle={() => onToggle(task.id, dk)}
                  onPress={() => onEdit(task, sectionForDateKey(dk))}
                />
              ))}
            </>
          )}
          {titleResults.length > 0 && (
            <>
              <Text style={styles.groupTitle}>
                {dateKey ? 'Matching titles' : 'Matching tasks'}
              </Text>
              {titleResults.map(({ task, dateKey: dk }) => (
                <TaskItem
                  key={`title-${task.id}-${dk}`}
                  task={task}
                  dateKey={dk}
                  dateLabel={formatShortDateFromKey(dk)}
                  onToggle={() => onToggle(task.id, dk)}
                  onPress={() => onEdit(task, sectionForDateKey(dk))}
                />
              ))}
            </>
          )}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  clear: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  resultsCard: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  groupTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
