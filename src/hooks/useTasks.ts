import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, TaskInsert } from '@/types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (task: TaskInsert): Promise<Task | null> => {
    const { data, error: err } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    if (data) {
      setTasks((prev) => [data, ...prev]);
    }
    return data;
  }, []);

  const addMultipleTasks = useCallback(async (taskList: TaskInsert[]): Promise<Task[]> => {
    const { data, error: err } = await supabase
      .from('tasks')
      .insert(taskList)
      .select();
    if (err) {
      setError(err.message);
      return [];
    }
    if (data) {
      setTasks((prev) => [...data, ...prev]);
    }
    return data || [];
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<boolean> => {
    const { data, error: err } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return false;
    }
    if (data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    }
    return true;
  }, []);

  const toggleComplete = useCallback(async (task: Task): Promise<void> => {
    const { data, error: err } = await supabase
      .from('tasks')
      .update({ completed: !task.completed, updated_at: new Date().toISOString() })
      .eq('id', task.id)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return;
    }
    if (data) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

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
