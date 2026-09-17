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
    { label: 'Pending', value: pending, icon: Clock, color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-50 dark:bg-accent-950/30' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-950/30' },
    { label: 'Urgent Bills', value: urgentBills, icon: Receipt, color: 'text-error-600 dark:text-error-400', bg: 'bg-error-50 dark:bg-error-950/30' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-4 sm:p-5 transition-all`}
          >
            <Icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
