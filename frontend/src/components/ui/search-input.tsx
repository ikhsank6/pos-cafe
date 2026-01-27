import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

/**
 * SearchInput - Input with search icon
 * Reusable search input with consistent styling
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          ref={ref}
          className={cn(
            "w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg pl-10 h-10 text-sm outline-none focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-700 placeholder:text-zinc-400",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
