import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, CheckCircle2, ListTodo, Bell, LogOut, ChevronDown } from 'lucide-react';
import type { User, Task } from '@/types';
import { SettingsPanel } from './SettingsPanel';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  taskCount: number;
  completedCount: number;
  user: User;
  onLogout: () => void;
  tasks: Task[];
  notifPermission: 'default' | 'granted' | 'denied' | 'unsupported';
  notifEnabled: boolean;
  onEnableNotif: () => Promise<'default' | 'granted' | 'denied' | 'unsupported'>;
  onDisableNotif: () => void;
}

export function Header({
  theme, onToggleTheme, taskCount, completedCount, user, onLogout, tasks,
  notifPermission, notifEnabled, onEnableNotif, onDisableNotif,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter((t) => !t.completed && t.due_date && new Date(t.due_date + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0)));
  const todayTasks = tasks.filter((t) => !t.completed && t.due_date === today);
  const upcomingTasks = tasks.filter((t) => {
    if (!t.due_date || t.completed) return false;
    const d = new Date(t.due_date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    return d > now && d <= weekEnd;
  });

  const notifications = [
    ...overdueTasks.slice(0, 3).map((t) => ({ id: t.id, text: `Overdue: ${t.title}`, type: 'overdue' as const })),
    ...todayTasks.slice(0, 3).map((t) => ({ id: t.id, text: `Due today: ${t.title}`, type: 'today' as const })),
    ...upcomingTasks.slice(0, 2).map((t) => ({ id: t.id, text: `Upcoming: ${t.title} — ${t.due_date}`, type: 'upcoming' as const })),
  ];

  const notifCount = notifications.length;
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                SmartRemind AI
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-success-500" />
                <span>{completedCount} of {taskCount} done</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right mr-1">
              <p className="text-xs text-slate-400 dark:text-slate-500">Hello,</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</p>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error-500 text-white text-xs font-bold flex items-center justify-center animate-bounce-in">
                    {notifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications</p>
                    <p className="text-xs text-slate-400">{notifCount} reminder{notifCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <CheckCircle2 className="w-8 h-8 text-success-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="flex items-start gap-2.5 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                          <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                            n.type === 'overdue' ? 'bg-error-500' : n.type === 'today' ? 'bg-warning-500' : 'bg-primary-500'
                          }`} />
                          <p className="text-sm text-slate-600 dark:text-slate-300">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <SettingsPanel
              permission={notifPermission}
              isEnabled={notifEnabled}
              onEnable={onEnableNotif}
              onDisable={onDisableNotif}
            />

            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    {user.isGuest && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-xs font-medium bg-warning-50 dark:bg-warning-950/40 text-warning-600 dark:text-warning-400">
                        Guest Account
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-error-50 dark:hover:bg-error-950/40 hover:text-error-600 dark:hover:text-error-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
