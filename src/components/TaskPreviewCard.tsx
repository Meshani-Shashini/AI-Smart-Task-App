import { useState } from 'react';
import { Check, X, Calendar, Clock, Tag, AlertCircle, Edit3 } from 'lucide-react';
import type { ParsedTask, Category, Priority } from '@/types';
import { CATEGORIES, PRIORITIES } from '@/types';

interface TaskPreviewCardProps {
  task: ParsedTask;
  onConfirm: (task: ParsedTask) => void;
  onDismiss: () => void;
}

export function TaskPreviewCard({ task, onConfirm, onDismiss }: TaskPreviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<ParsedTask>(task);

  const handleFieldChange = <K extends keyof ParsedTask>(key: K, value: ParsedTask[K]) => {
    setEdited((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    onConfirm(edited);
  };

  const display = isEditing ? edited : task;

  return (
    <div className="mt-3 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/20 overflow-hidden animate-bounce-in">
      <div className="px-4 py-2 bg-primary-100/50 dark:bg-primary-950/40 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">
          Task Preview
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-950/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">Title</label>
          {isEditing ? (
            <input
              type="text"
              value={display.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          ) : (
            <p className="text-sm font-medium text-slate-900 dark:text-white">{display.title}</p>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Category:</label>
          {isEditing ? (
            <select
              value={display.category}
              onChange={(e) => handleFieldChange('category', e.target.value as Category)}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-slate-700 dark:text-slate-300">{display.category}</span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Date:</label>
          {isEditing ? (
            <input
              type="date"
              value={display.due_date || ''}
              onChange={(e) => handleFieldChange('due_date', e.target.value || null)}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          ) : (
            <span className="text-sm text-slate-700 dark:text-slate-200">{display.due_date || 'No date'}</span>
          )}
        </div>

        {/* Time */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Time:</label>
          {isEditing ? (
            <input
              type="time"
              value={display.due_time || ''}
              onChange={(e) => handleFieldChange('due_time', e.target.value || null)}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          ) : (
            <span className="text-sm text-slate-700 dark:text-slate-200">{display.due_time || 'No time'}</span>
          )}
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Priority:</label>
          {isEditing ? (
            <select
              value={display.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value as Priority)}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none capitalize"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-slate-700 dark:text-slate-200 capitalize">{display.priority}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-success-500 text-white text-sm font-medium hover:bg-success-600 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            Confirm & Save
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
