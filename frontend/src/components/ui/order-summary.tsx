import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  discountLabel?: string;
  tax?: number;
  taxLabel?: string;
  total?: number;
  showTotal?: boolean;
  className?: string;
}

/**
 * OrderSummary - Display order price summary
 * Reusable order summary with subtotal, discount, tax, and total
 */
export function OrderSummary({
  subtotal,
  discount = 0,
  discountLabel = 'Diskon',
  tax = 0,
  taxLabel = 'Pajak',
  total,
  showTotal = true,
  className,
}: OrderSummaryProps) {
  const finalTotal = total ?? (subtotal - discount + tax);

  return (
    <div className={cn("space-y-1", className)}>
      {/* Subtotal */}
      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-400">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-emerald-600">
          <span>{discountLabel}</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}

      {/* Tax */}
      {tax > 0 && (
        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-400">
          <span>{taxLabel}</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      )}

      {/* Total */}
      {showTotal && (
        <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-1">
          <span className="text-xs font-extrabold uppercase text-zinc-500">
            Total Tagihan
          </span>
          <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">
            {formatCurrency(Math.max(0, finalTotal))}
          </span>
        </div>
      )}
    </div>
  );
}

export default OrderSummary;
