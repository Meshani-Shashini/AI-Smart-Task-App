export type Category = 'Health' | 'Grocery' | 'Utility Bills' | 'General';
export type Priority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'pending' | 'completed' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  joinedAt?: string;
  role?: 'Guest' | 'Personal User';
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  due_date: string | null;
  due_time: string | null;
  priority: Priority;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string | null;
}

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  previewTask?: ParsedTask | ParsedTask[];
}

export interface ParsedTask {
  title: string;
  description: string | null;
  category: Category;
  due_date: string | null;
  due_time: string | null;
  priority: Priority;
}

export const CATEGORIES: Category[] = ['Health', 'Grocery', 'Utility Bills', 'General'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
