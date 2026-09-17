import { useState, useMemo, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { TaskList } from '@/components/TaskList';
import { TaskSkeleton } from '@/components/TaskSkeleton';
import { QuickAddBar } from '@/components/QuickAddBar';
import { AIAgentModal } from '@/components/AIAgentModal';
import { ToastContainer } from '@/components/ToastContainer';
import { StatsOverview } from '@/components/StatsOverview';
import { LandingPage } from '@/components/LandingPage';
import { UserProfilePage } from '@/components/UserProfilePage';
import { useTasks } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import type { Category, ParsedTask, Priority, Task } from '@/types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, login, guestLogin, logout, updateUser } = useAuth();
  const { tasks, loading: tasksLoading, addTask, addMultipleTasks, toggleComplete, deleteTask } = useTasks();
  const { toasts, showToast, dismiss } = useToast();
  const { permission: notifPermission, requestPermission, disableNotifications, isEnabled: notifEnabled } = useNotifications(user ? tasks : []);

  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [aiOpen, setAiOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    return localStorage.getItem('smartremind_view') === 'profile' ? 'profile' : 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('smartremind_view', currentView);
  }, [currentView]);

  const categoryCounts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const t of tasks) {
      result[t.category] = (result[t.category] || 0) + 1;
    }
    return result;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (activeCategory === 'All') return tasks;
    return tasks.filter((t) => t.category === activeCategory);
  }, [tasks, activeCategory]);

  const handleAdd = useCallback(async (title: string, category: Category, priority: Priority) => {
    const result = await addTask({
      title,
      category,
      priority,
      completed: false,
      description: null,
      due_date: null,
      due_time: null,
    });
    if (result) {
      showToast('Task added successfully', 'success');
    } else {
      showToast('Failed to add task', 'error');
    }
  }, [addTask, showToast]);

  const handleToggleComplete = useCallback(async (task: Task) => {
    await toggleComplete(task);
    showToast(task.completed ? 'Task marked as pending' : 'Task completed!', 'success');
  }, [toggleComplete, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    const success = await deleteTask(id);
    showToast(success ? 'Task deleted' : 'Failed to delete task', success ? 'info' : 'error');
  }, [deleteTask, showToast]);

  const handleConfirmTask = useCallback(async (task: ParsedTask) => {
    const result = await addTask({
      ...task,
      completed: false,
    });
    showToast(result ? 'Task saved from AI!' : 'Failed to save task', result ? 'success' : 'error');
  }, [addTask, showToast]);

  const handleConfirmMultiple = useCallback(async (parsedTasks: ParsedTask[]) => {
    const results = await addMultipleTasks(parsedTasks.map((t) => ({ ...t, completed: false })));
    showToast(
      results.length > 0 ? `${results.length} tasks saved from AI!` : 'Failed to save tasks',
      results.length > 0 ? 'success' : 'error'
    );
  }, [addMultipleTasks, showToast]);

  const handleLogin = useCallback((email: string, password: string, fullName?: string): boolean => {
    const success = login(email, password, fullName);
    if (success) {
      setCurrentView('dashboard');
      showToast(`Welcome to SmartRemind AI!`, 'success');
    }
    return success;
  }, [login, showToast]);

  const handleGuestLogin = useCallback(() => {
    guestLogin();
    showToast('Welcome, Guest!', 'info');
  }, [guestLogin, showToast]);

  const handleLogout = useCallback(() => {
    setCurrentView('dashboard');
    logout();
    showToast('Signed out successfully', 'info');
  }, [logout, showToast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse-soft" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          taskCount={tasks.length}
          completedCount={tasks.filter((t) => t.completed).length}
          user={user}
          onLogout={handleLogout}
          onOpenProfile={() => setCurrentView('profile')}
          tasks={tasks}
          notifPermission={notifPermission}
          notifEnabled={notifEnabled}
          onEnableNotif={requestPermission}
          onDisableNotif={disableNotifications}
        />
        <UserProfilePage
          user={user}
          tasks={tasks}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          onBack={() => setCurrentView('dashboard')}
          onUpdateProfile={updateUser}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        taskCount={tasks.length}
        completedCount={tasks.filter((t) => t.completed).length}
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => setCurrentView('profile')}
        tasks={tasks}
        notifPermission={notifPermission}
        notifEnabled={notifEnabled}
        onEnableNotif={requestPermission}
        onDisableNotif={disableNotifications}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Top: 3 stat cards */}
        <StatsOverview tasks={tasks} />

        {/* Middle: Category tabs + task list */}
        <div className="mt-8 space-y-4">
          <FilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categoryCounts={categoryCounts}
          />

          {tasksLoading ? (
            <TaskSkeleton />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {/* Floating AI button */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed right-5 bottom-20 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Bottom: minimal input bar */}
      <QuickAddBar onAdd={handleAdd} />

      {/* AI drawer */}
      <AIAgentModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        tasks={tasks}
        onConfirmTask={handleConfirmTask}
        onConfirmMultiple={handleConfirmMultiple}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default App;
