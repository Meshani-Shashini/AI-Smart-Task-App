import { Clock, CheckCircle2, Receipt } from 'lucide-react';
import type { Task } from '@/types';

interface StatsOverviewProps {
  tasks: Task[];
}

export function StatsOverview({ tasks }: StatsOverviewProps) {
  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;
  const urgentBills = tasks.filter((t) =>
    t.category === 'Utility Bills' &&
    !t.completed &&
    (t.priority === 'high' || (t.due_date && new Date(t.due_date + 'T00:00:00') <= new Date(new Date().setDate(new Date().getDate() + 3))))
  ).length;

  const stats = [
    { label: 'Pending', value: pending, icon: Clock, color: 'text-cyan-600 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-slate-800 border border-cyan-200 dark:border-slate-700' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700' },
    { label: 'Urgent Bills', value: urgentBills, icon: Receipt, color: 'text-red-600 dark:text-red-300', bg: 'bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-slate-700' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-4 sm:p-5 shadow-sm transition-all`}
          >
            <Icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none">{stat.value}</p>
            <p className="text-xs text-slate-700 dark:text-slate-200 mt-1.5">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
