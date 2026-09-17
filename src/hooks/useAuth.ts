import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';

const STORAGE_KEY = 'smartremind_user';
const TASK_PREFIX = 'smartremind_tasks';

function getTaskKey(email: string): string {
  return `${TASK_PREFIX}_${email.trim().toLowerCase()}`;
}

function migrateGuestTasksToUser(email: string): void {
  const guestKey = getTaskKey('guest@smartremind.ai');
  const userKey = getTaskKey(email);

  try {
    const guestTasks = localStorage.getItem(guestKey);
    if (!guestTasks) return;

    const personalTasks = localStorage.getItem(userKey);
    const merged = personalTasks ? [...JSON.parse(personalTasks), ...JSON.parse(guestTasks)] : JSON.parse(guestTasks);
    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(guestKey);
  } catch {
    // ignore invalid localStorage data
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoading(false);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const login = useCallback((email: string, _password: string, fullName?: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return false;

    migrateGuestTasksToUser(normalizedEmail);

    const name = (fullName || normalizedEmail.split('@')[0] || 'User').trim();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name ? name.charAt(0).toUpperCase() + name.slice(1) : 'User',
      email: normalizedEmail,
      isGuest: false,
      joinedAt: new Date().toISOString(),
      role: 'Personal User',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  }, []);

  const guestLogin = useCallback((): void => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest',
      email: 'guest@smartremind.ai',
      isGuest: true,
      joinedAt: new Date().toISOString(),
      role: 'Guest',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, guestLogin, logout, updateUser };
}
