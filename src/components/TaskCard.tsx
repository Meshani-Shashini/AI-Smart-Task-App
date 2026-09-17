import { Check, Clock, Calendar, Trash2, Heart, ShoppingCart, Receipt, Folder, AlertCircle } from 'lucide-react';
import type { Task, Category } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<Category, typeof Heart> = {
  'Health': Heart,
  'Grocery': ShoppingCart,
  'Utility Bills': Receipt,
  'General': Folder,
};

const CATEGORY_DOT: Record<Category, string> = {
  'Health': 'bg-rose-500',
  'Grocery': 'bg-emerald-500',
  'Utility Bills': 'bg-amber-500',
  'General': 'bg-slate-400',
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800',
  medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
  low: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600',
};

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 0 && diff <= 7) return `In ${diff} days`;
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  const Icon = CATEGORY_ICONS[task.category];
  const isOverdue = task.due_date && !task.completed && new Date(task.due_date + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className={`group flex items-center gap-3.5 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200/60 dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleComplete(task)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-success-500 border-success-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-500 hover:scale-110'
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium text-slate-800 dark:text-white truncate ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-200">
            <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[task.category]}`} />
            {task.category}
          </span>
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}>
              <Calendar className="w-3 h-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}
          {task.due_time && (
            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
              <Clock className="w-3 h-3" />
              {task.due_time}
            </span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
        {task.priority}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
