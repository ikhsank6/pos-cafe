import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  onRemove?: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showDeleteOnMin?: boolean;
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: {
    button: 'h-6 w-6',
    icon: 12,
    text: 'text-[10px] w-6',
    container: 'rounded-md',
  },
  md: {
    button: 'h-8 w-8',
    icon: 14,
    text: 'text-xs w-8',
    container: 'rounded-lg',
  },
  lg: {
    button: 'h-10 w-10',
    icon: 16,
    text: 'text-sm w-10',
    container: 'rounded-lg',
  },
};

/**
 * QuantityControl - Increment/Decrement control for quantity
 * Reusable quantity control with plus/minus buttons
 */
export function QuantityControl({
  value,
  onChange,
  onRemove,
  min = 1,
  max = 999,
  size = 'md',
  showDeleteOnMin = true,
  className,
  disabled = false,
}: QuantityControlProps) {
  const sizes = sizeClasses[size];
  const canDecrease = value > min;
  const canIncrease = value < max;
  const isAtMin = value <= min;

  const handleDecrease = () => {
    if (disabled) return;
    if (isAtMin && showDeleteOnMin && onRemove) {
      onRemove();
    } else if (canDecrease) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (disabled || !canIncrease) return;
    onChange(value + 1);
  };

  return (
    <div className={cn(
      "flex items-center border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800",
      sizes.container,
      className
    )}>
      <button
        type="button"
        className={cn(
          "flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors",
          sizes.button,
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleDecrease}
        disabled={disabled}
      >
        {isAtMin && showDeleteOnMin && onRemove ? (
          <Trash2 size={sizes.icon} className="text-rose-500" />
        ) : (
          <Minus size={sizes.icon} className="text-zinc-500" />
        )}
      </button>
      
      <div className={cn(
        "text-center font-bold text-zinc-800 dark:text-zinc-200",
        sizes.text
      )}>
        {value}
      </div>
      
      <button
        type="button"
        className={cn(
          "flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors",
          sizes.button,
          (!canIncrease || disabled) && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleIncrease}
        disabled={disabled || !canIncrease}
      >
        <Plus size={sizes.icon} className="text-zinc-500" />
      </button>
    </div>
  );
}

export default QuantityControl;
