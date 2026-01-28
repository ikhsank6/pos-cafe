import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  onClear?: () => void;
}

/**
 * SearchInput - Input with search icon
 * Reusable search input with consistent styling
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, onClear, ...props }, ref) => {
    const hasValue = !!props.value;

    return (
      <div className={cn("relative group w-full", containerClassName)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-500 transition-colors" />
        <input
          ref={ref}
          className={cn(
            "w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl pl-10 h-10 text-sm outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 placeholder:text-zinc-400 transition-all",
            hasValue && onClear && "pr-10",
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" />
            <span className="sr-only">Clear</span>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
