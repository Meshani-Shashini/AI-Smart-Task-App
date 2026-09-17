import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';

const STORAGE_KEY = 'smartremind_user';

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

  const login = useCallback((email: string, _password: string): boolean => {
    const name = email.split('@')[0] || 'User';
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      isGuest: false,
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
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, guestLogin, logout };
}
