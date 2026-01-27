// Payment and discount utilities

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'E_WALLET', label: 'E-Wallet' },
  { value: 'DEBIT_CARD', label: 'Kartu Debit' },
  { value: 'CREDIT_CARD', label: 'Kartu Kredit' },
  { value: 'BANK_TRANSFER', label: 'Transfer Bank' },
] as const;

export type PaymentMethodValue = typeof PAYMENT_METHODS[number]['value'];

export const getPaymentMethodLabel = (value: string): string => {
  const method = PAYMENT_METHODS.find(pm => pm.value === value);
  return method?.label || value;
};

// Order types
export const ORDER_TYPES = [
  { value: 'DINE_IN', label: 'Dine In' },
  { value: 'TAKEAWAY', label: 'Take Away' },
  { value: 'DELIVERY', label: 'Delivery' },
] as const;

export type OrderTypeValue = typeof ORDER_TYPES[number]['value'];

export const getOrderTypeLabel = (value: string): string => {
  const type = ORDER_TYPES.find(t => t.value === value);
  return type?.label || value;
};

// Discount calculation
export interface DiscountData {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  maxDiscount?: number | null;
  minPurchase?: number | null;
}

/**
 * Calculate discount amount based on discount type
 * @param subtotal - The subtotal amount before discount
 * @param discount - The discount data object
 * @returns The calculated discount amount
 */
export const calculateDiscountAmount = (subtotal: number, discount: DiscountData | null): number => {
  if (!discount) return 0;
  
  let amount = discount.type === 'PERCENTAGE' 
    ? (subtotal * discount.value) / 100 
    : discount.value;
  
  // Apply max discount cap if exists
  if (discount.maxDiscount && amount > discount.maxDiscount) {
    amount = discount.maxDiscount;
  }
  
  // Ensure discount doesn't exceed subtotal
  return Math.min(amount, subtotal);
};

/**
 * Calculate final total after discount
 * @param subtotal - The subtotal amount before discount
 * @param discount - The discount data object
 * @returns The final total after discount
 */
export const calculateFinalTotal = (subtotal: number, discount: DiscountData | null): number => {
  return Math.max(0, subtotal - calculateDiscountAmount(subtotal, discount));
};

/**
 * Check if minimum purchase requirement is met
 * @param subtotal - The current subtotal
 * @param discount - The discount data object
 * @returns True if minimum requirement is met or no minimum exists
 */
export const isMinimumPurchaseMet = (subtotal: number, discount: DiscountData | null): boolean => {
  if (!discount || !discount.minPurchase) return true;
  return subtotal >= discount.minPurchase;
};

/**
 * Format discount display text
 * @param discount - The discount data object
 * @returns Formatted discount string (e.g., "10%" or "Rp 5.000")
 */
export const formatDiscountValue = (discount: DiscountData): string => {
  if (discount.type === 'PERCENTAGE') {
    return `${discount.value}%`;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discount.value);
};
