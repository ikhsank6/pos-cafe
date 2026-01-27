import * as React from 'react';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    container: 'h-32 py-4',
    icon: 'h-8 w-8',
    title: 'text-[10px]',
    description: 'text-xs',
  },
  md: {
    container: 'h-48 py-8',
    icon: 'h-12 w-12',
    title: 'text-sm',
    description: 'text-sm',
  },
  lg: {
    container: 'h-64 py-12',
    icon: 'h-16 w-16',
    title: 'text-base',
    description: 'text-base',
  },
};

/**
 * EmptyState - Display when there's no data
 * Reusable empty state component with customizable icon, title, and description
 */
export function EmptyState({
  icon,
  title = 'Tidak ada data',
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizes = sizeClasses[size];
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center opacity-40",
      sizes.container,
      className
    )}>
      <div className={cn("mb-2 text-zinc-400", sizes.icon)}>
        {icon || <ShoppingCart className="w-full h-full" />}
      </div>
      <p className={cn(
        "font-bold uppercase tracking-widest text-zinc-500",
        sizes.title
      )}>
        {title}
      </p>
      {description && (
        <p className={cn("text-zinc-400 mt-1", sizes.description)}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
