import { cn } from '@/lib/utils';

export interface CategoryTab {
  id: string | null;
  label: string;
  count?: number;
}

export interface CategoryTabsProps {
  categories: CategoryTab[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
  showCount?: boolean;
}

/**
 * CategoryTabs - Horizontal scrollable category filter tabs
 * Reusable category filter with pill-style buttons
 */
export function CategoryTabs({
  categories,
  selectedId,
  onSelect,
  className,
  showCount = true,
}: CategoryTabsProps) {
  return (
    <nav className={cn(
      "flex gap-2 overflow-x-auto no-scrollbar py-2",
      className
    )}>
      {categories.map((category) => (
        <button
          key={category.id || 'all'}
          onClick={() => onSelect(category.id)}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
            selectedId === category.id
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          )}
        >
          {category.label}
          {showCount && category.count !== undefined && (
            <span className="ml-1">({category.count})</span>
          )}
        </button>
      ))}
    </nav>
  );
}

export default CategoryTabs;
