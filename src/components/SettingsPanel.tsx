import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, Settings2, ShieldCheck, X } from 'lucide-react';
import type { Task } from '@/types';

const STORAGE_KEY = 'smartremind_notifications_enabled';
const CHECK_INTERVAL = 30000; // 30 seconds

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

interface SettingsPanelProps {
  permission: Permission;
  isEnabled: boolean;
  onEnable: () => Promise<Permission>;
  onDisable: () => void;
}

export function SettingsPanel({ permission, isEnabled, onEnable, onDisable }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (isEnabled) {
      onDisable();
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      await onEnable();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const statusText =
    permission === 'granted' ? 'Enabled' :
    permission === 'denied' ? 'Blocked' :
    permission === 'unsupported' ? 'Unsupported' :
    'Not set';

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Notification settings"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up z-50">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{statusText}</p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${isEnabled ? 'text-success-600 dark:text-success-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {isEnabled ? <ShieldCheck className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {isEnabled ? 'On' : 'Off'}
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={loading || permission === 'unsupported'}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing...' : isEnabled ? 'Disable notifications' : permission === 'unsupported' ? 'Browser unsupported' : 'Enable notifications'}
            </button>

            {permission === 'denied' && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Browser permission is blocked. Please allow notifications in your browser settings.
              </p>
            )}

            {permission === 'unsupported' && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This browser does not support notifications.
              </p>
            )}

            {!isEnabled && permission === 'granted' && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Check className="w-3.5 h-3.5 text-success-500" />
                Notifications are available and ready to turn on.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
