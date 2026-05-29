import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AllTasksSection } from '../components/AllTasksSection';
import { CreateListModal } from '../components/CreateListModal';
import { ListDetailView } from '../components/ListDetailView';
import { ListsHub } from '../components/ListsHub';
import { SearchSection } from '../components/SearchSection';
import { SectionMenu, type SectionId } from '../components/SectionMenu';
import { TaskModal, type TaskModalSection } from '../components/TaskModal';
import { TaskSection } from '../components/TaskSection';
import { DEFAULT_LIST_ID, useTasks } from '../context/TaskContext';
import type { Task } from '../types/task';
import { colors, common, spacing, typography } from '../theme';
import {
  formatHeadingDate,
  parseDateKey,
  todayKey,
  tomorrowKey,
} from '../utils/dates';

export function HomeScreen() {
  const {
    loading,
    tasks,
    lists,
    defaultListTasks,
    todayTasks,
    tomorrowTasks,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    deleteAllTasksInList,
    toggleComplete,
    createList,
    getListById,
  } = useTasks();

  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [createListVisible, setCreateListVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSection, setModalSection] = useState<TaskModalSection>('today');
  const [pickSchedule, setPickSchedule] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeListIdForTasks = activeListId ?? DEFAULT_LIST_ID;

  const openAdd = (section: TaskModalSection) => {
    setEditingTask(null);
    setModalSection(section);
    setPickSchedule(false);
    setModalVisible(true);
  };

  const openAddFromAllTasks = () => {
    setEditingTask(null);
    setModalSection('today');
    setPickSchedule(true);
    setModalVisible(true);
  };

  const openEdit = (task: Task, section: TaskModalSection) => {
    setEditingTask(task);
    setModalSection(section);
    setPickSchedule(false);
    setModalVisible(true);
  };

  const handleSave = (title: string, dueDateKey: string, recurrence: Task['recurrence']) => {
    if (editingTask) {
      updateTask(editingTask.id, title, dueDateKey, recurrence);
    } else {
      addTask(activeListIdForTasks, title, dueDateKey, recurrence);
    }
  };

  const goBack = () => {
    if (activeListId) {
      setActiveListId(null);
      return;
    }
    setActiveSection(null);
  };

  const handleCreateList = (name: string) => {
    const list = createList(name);
    setActiveSection('lists');
    setActiveListId(list.id);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const today = todayKey();
  const tomorrow = tomorrowKey();
  const isSearching = searchQuery.trim().length > 0;
  const showMenu = activeSection === null && activeListId === null && !isSearching;
  const showBack = (activeSection !== null || activeListId !== null) && !isSearching;

  const activeList = activeListId ? getListById(activeListId) : undefined;

  const renderSectionContent = () => {
    if (activeListId && activeList) {
      return (
        <ListDetailView
          listName={activeList.name}
          listId={activeListId}
          tasks={tasks}
          onAddToday={() => openAdd('today')}
          onAddTomorrow={() => openAdd('tomorrow')}
          onAddAll={openAddFromAllTasks}
          onToggle={toggleComplete}
          onEdit={(task, section) => openEdit(task, section)}
          onDeleteTasks={deleteTasks}
          onDeleteAllInList={() => deleteAllTasksInList(activeListId)}
        />
      );
    }

    switch (activeSection) {
      case 'today':
        return (
          <TaskSection
            title="My Day"
            dateLabel={formatHeadingDate(new Date())}
            dateKey={today}
            tasks={todayTasks}
            onAdd={() => openAdd('today')}
            onToggle={(id) => toggleComplete(id, today)}
            onEdit={(task) => openEdit(task, 'today')}
          />
        );
      case 'tomorrow':
        return (
          <TaskSection
            title="Tomorrow"
            dateLabel={formatHeadingDate(parseDateKey(tomorrow))}
            dateKey={tomorrow}
            tasks={tomorrowTasks}
            onAdd={() => openAdd('tomorrow')}
            onToggle={(id) => toggleComplete(id, tomorrow)}
            onEdit={(task) => openEdit(task, 'tomorrow')}
          />
        );
      case 'all':
        return (
          <AllTasksSection
            tasks={defaultListTasks}
            onAdd={openAddFromAllTasks}
            onToggle={toggleComplete}
            onEdit={(task, section) => openEdit(task, section)}
            onDeleteTasks={deleteTasks}
            onDeleteAllTasks={() => deleteAllTasksInList(DEFAULT_LIST_ID)}
          />
        );
      case 'lists':
        return (
          <ListsHub
            lists={lists}
            tasks={tasks}
            onCreateList={() => setCreateListVisible(true)}
            onOpenList={(id) => setActiveListId(id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>ToDo</Text>
            <Text style={styles.appSub}>Stay on top of your day</Text>
          </View>
        </View>

        {showBack && (
          <Pressable onPress={goBack} style={styles.back} hitSlop={8}>
            <Text style={styles.backText}>← Back to menu</Text>
          </Pressable>
        )}

        <SearchSection
          tasks={tasks}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onToggle={toggleComplete}
          onEdit={(task, section) => openEdit(task, section)}
        />

        {showMenu && (
          <SectionMenu
            onSelect={(section) => {
              setActiveSection(section);
              setActiveListId(null);
            }}
            taskCount={tasks.length}
          />
        )}

        {(activeSection !== null || activeListId !== null) && !isSearching && (
          <View style={styles.sectionContent}>{renderSectionContent()}</View>
        )}
      </ScrollView>

      <CreateListModal
        visible={createListVisible}
        onClose={() => setCreateListVisible(false)}
        onCreate={handleCreateList}
      />

      <TaskModal
        visible={modalVisible}
        section={modalSection}
        pickSchedule={pickSchedule}
        editingTask={editingTask}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={deleteTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    ...common.screen,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  header: {
    marginBottom: spacing.lg,
  },
  appTitle: {
    ...typography.hero,
    color: colors.text,
  },
  appSub: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  back: {
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    ...common.link,
  },
  sectionContent: {
    marginTop: spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
