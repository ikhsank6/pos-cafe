import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InfoCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'success';
}

const variantClasses = {
  default: 'bg-zinc-50 dark:bg-zinc-800',
  highlight: 'bg-zinc-100 dark:bg-zinc-700',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900',
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900',
};

const labelVariantClasses = {
  default: 'text-zinc-400',
  highlight: 'text-zinc-500',
  warning: 'text-amber-600 dark:text-amber-500',
  success: 'text-emerald-600 dark:text-emerald-500',
};

/**
 * InfoCard - Small card displaying label and value
 * Reusable info card for displaying key-value pairs in a styled container
 */
export function InfoCard({
  label,
  value,
  icon,
  className,
  variant = 'default',
}: InfoCardProps) {
  return (
    <div className={cn(
      "p-3 rounded-xl",
      variantClasses[variant],
      className
    )}>
      <span className={cn(
        "text-[10px] font-bold uppercase",
        labelVariantClasses[variant]
      )}>
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">
        {value}
      </div>
    </div>
  );
}

export interface InfoCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

/**
 * InfoCardGrid - Grid container for InfoCard components
 */
export function InfoCardGrid({
  children,
  columns = 2,
  gap = 'md',
  className,
}: InfoCardGridProps) {
  return (
    <div className={cn(
      "grid",
      gridCols[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

export default InfoCard;
