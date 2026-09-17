import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task } from '@/types';

const STORAGE_KEY = 'smartremind_notifications_enabled';
const CHECK_INTERVAL = 30000; // 30 seconds

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

export function useNotifications(tasks: Task[]) {
  const [permission, setPermission] = useState<Permission>('default');
  const notifiedRef = useRef<Set<string>>(new Set());

  // Initialize permission state from browser
  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as Permission);
  }, []);

  // Check if notifications are enabled in localStorage
  const isEnabled = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }, []);

  const requestPermission = useCallback(async (): Promise<Permission> => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported';
    }
    const result = await Notification.requestPermission();
    setPermission(result as Permission);
    if (result === 'granted') {
      localStorage.setItem(STORAGE_KEY, 'true');
      // Send a test notification
      new Notification('SmartRemind AI', {
        body: 'Notifications are now enabled. You will be reminded of upcoming tasks!',
        icon: '/vite.svg',
      });
    }
    return result as Permission;
  }, []);

  const disableNotifications = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'false');
  }, []);

  const sendNotification = useCallback((task: Task) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!isEnabled()) return;
    if (notifiedRef.current.has(task.id)) return;

    notifiedRef.current.add(task.id);

    const body = task.due_time
      ? `Reminder: ${task.title} — ${task.category} at ${task.due_time}`
      : `Reminder: ${task.title} — ${task.category}`;

    const notification = new Notification('SmartRemind AI — Task Due', {
      body,
      icon: '/vite.svg',
      tag: task.id,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, [isEnabled]);

  // Background checker — runs every 30 seconds
  useEffect(() => {
    if (permission !== 'granted' || !isEnabled()) return;

    const checkDueTasks = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const task of tasks) {
        if (task.completed || !task.due_date) continue;
        if (notifiedRef.current.has(task.id)) continue;

        // Case 1: Task has a specific time and it matches now (within the same minute)
        if (task.due_time && task.due_date === todayStr) {
          if (task.due_time === currentTime) {
            sendNotification(task);
          }
        }

        // Case 2: Task has no time but the date is today — notify at 9:00 AM
        if (!task.due_time && task.due_date === todayStr) {
          if (currentTime === '09:00') {
            sendNotification(task);
          }
        }

        // Case 3: Task date is in the past and still not completed — notify once when detected
        if (task.due_date < todayStr) {
          sendNotification(task);
        }
      }
    };

    // Check immediately on mount / when tasks change
    checkDueTasks();

    const interval = setInterval(checkDueTasks, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [tasks, permission, isEnabled, sendNotification]);

  // Clean up notified set when tasks are completed or deleted
  useEffect(() => {
    const activeIds = new Set(tasks.map((t) => t.id));
    const newNotified = new Set<string>();
    notifiedRef.current.forEach((id) => {
      if (activeIds.has(id)) newNotified.add(id);
    });
    notifiedRef.current = newNotified;
  }, [tasks]);

  return {
    permission,
    requestPermission,
    disableNotifications,
    isEnabled: isEnabled(),
    sendNotification,
  };
}
