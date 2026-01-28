import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PromoCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  onRemove?: () => void;
  appliedCode?: string | null;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * PromoCodeInput - Input for promo/discount code with apply button
 * Reusable promo code input with validation states
 */
export function PromoCodeInput({
  value,
  onChange,
  onApply,
  onRemove,
  appliedCode,
  error,
  loading = false,
  disabled = false,
  placeholder = 'KODE PROMO',
  className,
}: PromoCodeInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Input row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            placeholder={placeholder}
            className={cn(
              "w-full h-9 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-700",
              value && !appliedCode && "pr-8"
            )}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            disabled={disabled || !!appliedCode}
          />
          {value && !appliedCode && !disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
            >
              <X size={12} className="text-zinc-400" />
            </button>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 px-4 font-bold text-[10px] rounded-lg"
          onClick={onApply}
          disabled={loading || !value || disabled || !!appliedCode}
        >
          {loading ? 'LOADING...' : 'PAKAI'}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[10px] font-bold text-rose-500 px-1">{error}</p>
      )}

      {/* Applied discount badge */}
      {appliedCode && (
        <div className="flex items-center justify-between text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {appliedCode} AKTIF
          </span>
          {onRemove && (
            <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PromoCodeInput;
