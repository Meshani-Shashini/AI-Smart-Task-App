import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskInsert } from '@/types';

const TASK_PREFIX = 'smartremind_tasks';

function getCurrentUserEmail(): string {
  try {
    const stored = localStorage.getItem('smartremind_user');
    if (!stored) return 'guest@smartremind.ai';
    const user = JSON.parse(stored) as { email?: string };
    return (user.email || 'guest@smartremind.ai').trim().toLowerCase();
  } catch {
    return 'guest@smartremind.ai';
  }
}

function getTaskStorageKey(email: string): string {
  return `${TASK_PREFIX}_${email.trim().toLowerCase()}`;
}

function readStoredTasks(email: string): Task[] {
  const key = getTaskStorageKey(email);
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredTasks(email: string, tasks: Task[]): void {
  localStorage.setItem(getTaskStorageKey(email), JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const email = getCurrentUserEmail();
      const storedTasks = readStoredTasks(email);
      setTasks(storedTasks);
    } catch {
      setError('Unable to load tasks for this account.');
      setTasks([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const syncTasks = useCallback((nextTasks: Task[]) => {
    const email = getCurrentUserEmail();
    const normalized = [...nextTasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setTasks(normalized);
    saveStoredTasks(email, normalized);
  }, []);

  const addTask = useCallback(async (task: TaskInsert): Promise<Task | null> => {
    const email = getCurrentUserEmail();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      created_at: now,
      updated_at: now,
      user_email: email,
    };

    const nextTasks = [newTask, ...tasks];
    syncTasks(nextTasks);
    return newTask;
  }, [syncTasks, tasks]);

  const addMultipleTasks = useCallback(async (taskList: TaskInsert[]): Promise<Task[]> => {
    const email = getCurrentUserEmail();
    const now = new Date().toISOString();
    const normalized = taskList.map((task, index) => ({
      ...task,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${index}`,
      created_at: now,
      updated_at: now,
      user_email: email,
    }));

    const nextTasks = [...normalized, ...tasks];
    syncTasks(nextTasks);
    return normalized;
  }, [syncTasks, tasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<boolean> => {
    const nextTasks = tasks.map((task) => (task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task));
    syncTasks(nextTasks);
    return true;
  }, [syncTasks, tasks]);

  const toggleComplete = useCallback(async (task: Task): Promise<void> => {
    const nextTasks = tasks.map((item) => (item.id === task.id ? { ...item, completed: !item.completed, updated_at: new Date().toISOString() } : item));
    syncTasks(nextTasks);
  }, [syncTasks, tasks]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    const nextTasks = tasks.filter((task) => task.id !== id);
    syncTasks(nextTasks);
    return true;
  }, [syncTasks, tasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    addMultipleTasks,
    updateTask,
    toggleComplete,
    deleteTask,
    refetch: fetchTasks,
  };
}
