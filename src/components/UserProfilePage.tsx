import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, Clock3, LogOut, Moon, Save, ShieldCheck, Sun, UserCircle2, Mail, Calendar, ReceiptText } from 'lucide-react';
import type { Task, User } from '@/types';

interface UserProfilePageProps {
  user: User;
  tasks: Task[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

interface ProfileSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultView: 'all' | 'pending' | 'completed' | 'high';
}

const PROFILE_SETTINGS_KEY = 'smartremind_profile_settings';

export function UserProfilePage({
  user,
  tasks,
  theme,
  onToggleTheme,
  onLogout,
  onBack,
  onUpdateProfile,
}: UserProfilePageProps) {
  const [displayName, setDisplayName] = useState(user.name || 'User');
  const [settings, setSettings] = useState<ProfileSettings>({
    emailNotifications: true,
    pushNotifications: true,
    defaultView: 'all',
  });

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<ProfileSettings>;
        setSettings({
          emailNotifications: parsed.emailNotifications ?? true,
          pushNotifications: parsed.pushNotifications ?? true,
          defaultView: parsed.defaultView ?? 'all',
        });
      } catch {
        // ignore invalid stored data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const initials = useMemo(() => {
    return (displayName || user.name || 'User')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U';
  }, [displayName, user.name]);

  const stats = useMemo(() => {
    const totalReminders = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const activeBills = tasks.filter((task) => task.category === 'Utility Bills' && !task.completed).length;
    const pendingTasks = tasks.filter((task) => !task.completed).length;

    return {
      totalReminders,
      completedTasks,
      activeBills,
      pendingTasks,
    };
  }, [tasks]);

  const joinedDate = useMemo(() => {
    const raw = user.joinedAt || new Date().toISOString();
    return new Date(raw).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [user.joinedAt]);

  const handleSaveProfile = () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setDisplayName(user.name || 'User');
      return;
    }

    onUpdateProfile({ name: trimmedName });
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <button
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-2xl font-bold text-white shadow-lg shadow-primary-500/20">
              {initials}
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Profile</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <Mail className="w-4 h-4 text-primary-500" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Joined {joinedDate}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              <span>{user.isGuest ? 'Guest Account' : user.role || 'Personal User'}</span>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <UserCircle2 className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-600 dark:text-slate-300">
                <span className="mb-1.5 block font-medium">Display Name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <p className="font-medium text-slate-700 dark:text-slate-200">Account Email</p>
                <p className="mt-1">{user.email}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:scale-[1.01] transition-transform"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Usage Summary</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-primary-50 p-4 dark:bg-primary-950/30">
                <p className="text-xs uppercase tracking-wide text-primary-600 dark:text-primary-300">Total</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{stats.totalReminders}</p>
              </div>
              <div className="rounded-2xl bg-success-50 p-4 dark:bg-success-950/30">
                <p className="text-xs uppercase tracking-wide text-success-600 dark:text-success-300">Completed</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{stats.completedTasks}</p>
              </div>
              <div className="rounded-2xl bg-warning-50 p-4 dark:bg-warning-950/30">
                <p className="text-xs uppercase tracking-wide text-warning-600 dark:text-warning-300">Pending</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{stats.pendingTasks}</p>
              </div>
              <div className="rounded-2xl bg-error-50 p-4 dark:bg-error-950/30">
                <p className="text-xs uppercase tracking-wide text-error-600 dark:text-error-300">Utility Bills</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{stats.activeBills}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings & Preferences</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Email Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive reminders by email</p>
                </div>
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${settings.emailNotifications ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white transition ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Push Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Browser reminders and task alerts</p>
                </div>
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${settings.pushNotifications ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white transition ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Theme</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Current appearance</p>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {theme === 'light' ? 'Light' : 'Dark'}
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <label className="flex items-center justify-between gap-4 text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-medium">Default Task View</span>
                  <select
                    value={settings.defaultView}
                    onChange={(e) => setSettings((prev) => ({ ...prev, defaultView: e.target.value as ProfileSettings['defaultView'] }))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="high">High Priority</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <LogOut className="w-5 h-5 text-error-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account</h2>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-error-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-error-500/20 hover:bg-error-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
