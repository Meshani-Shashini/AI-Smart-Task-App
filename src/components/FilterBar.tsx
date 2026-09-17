import { LayoutGrid, Heart, ShoppingCart, Receipt, Folder } from 'lucide-react';
import type { Category } from '@/types';

interface FilterBarProps {
  activeCategory: Category | 'All';
  onCategoryChange: (cat: Category | 'All') => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { key: Category | 'All'; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'All', label: 'All', icon: LayoutGrid },
  { key: 'Utility Bills', label: 'Bills', icon: Receipt },
  { key: 'Health', label: 'Health', icon: Heart },
  { key: 'Grocery', label: 'Grocery', icon: ShoppingCart },
  { key: 'General', label: 'General', icon: Folder },
];

export function FilterBar({ activeCategory, onCategoryChange, categoryCounts }: FilterBarProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
      {CATEGORIES.map(({ key, label, icon: Icon }) => {
        const isActive = activeCategory === key;
        const count = key === 'All'
          ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
          : categoryCounts[key] || 0;
        return (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {count > 0 && (
              <span className={`text-xs ${isActive ? 'opacity-60' : 'opacity-40'}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
