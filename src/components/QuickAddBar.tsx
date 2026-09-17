import { useState } from 'react';
import { Plus, Mic } from 'lucide-react';
import type { Category, Priority } from '@/types';
import { CATEGORIES, PRIORITIES } from '@/types';

interface QuickAddBarProps {
  onAdd: (title: string, category: Category, priority: Priority) => void;
}

export function QuickAddBar({ onAdd }: QuickAddBarProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('General');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), category, priority);
    setTitle('');
    setCategory('General');
    setPriority('medium');
    setShowOptions(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {showOptions && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2 animate-slide-up">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none capitalize"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              showOptions
                ? 'bg-primary-600 text-white rotate-45'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
          />

          <button
            type="button"
            className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary-500 transition-colors flex items-center justify-center"
            title="Voice command (simulated)"
          >
            <Mic className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
