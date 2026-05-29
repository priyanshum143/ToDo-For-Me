import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, common, radius, spacing, typography } from '../theme';
import type { TaskList } from '../types/list';
import type { Task } from '../types/task';
import { tasksInList } from '../utils/listTasks';
import { Card } from './Card';

interface ListsHubProps {
  lists: TaskList[];
  tasks: Task[];
  onCreateList: () => void;
  onOpenList: (listId: string) => void;
}

export function ListsHub({ lists, tasks, onCreateList, onOpenList }: ListsHubProps) {
  return (
    <View style={styles.wrap}>
      <Card>
        <Text style={styles.title}>My lists</Text>
        <Text style={styles.desc}>Each list has its own today, tomorrow, and history.</Text>

        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
          onPress={onCreateList}
        >
          <Text style={styles.createIcon}>+</Text>
          <Text style={styles.createBtnText}>Create new list</Text>
        </Pressable>

        {lists.length === 0 ? (
          <Text style={common.empty}>No custom lists yet.</Text>
        ) : (
          <View style={styles.listGap}>
            {lists.map((list) => {
              const count = tasksInList(tasks, list.id).length;
              return (
                <Pressable
                  key={list.id}
                  style={({ pressed }) => [styles.listBtn, pressed && styles.listBtnPressed]}
                  onPress={() => onOpenList(list.id)}
                >
                  <View style={styles.listIcon}>
                    <Text>📁</Text>
                  </View>
                  <View style={styles.listText}>
                    <Text style={styles.listBtnTitle}>{list.name}</Text>
                    <Text style={styles.listBtnSub}>
                      {count} task{count === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  desc: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  createBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  createIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listGap: {
    gap: spacing.sm,
  },
  listBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listBtnPressed: {
    backgroundColor: colors.primaryMuted,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.listsBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listText: {
    flex: 1,
  },
  listBtnTitle: {
    ...typography.h3,
    color: colors.text,
  },
  listBtnSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.lists,
    fontWeight: '300',
  },
});
