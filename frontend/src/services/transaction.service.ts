import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';

export type PaymentMethod = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'E_WALLET' | 'QRIS' | 'BANK_TRANSFER';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';

export interface Transaction {
  uuid: string;
  transactionNo: string;
  orderUuid: string;
  order?: {
    uuid: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    table?: {
      uuid: string;
      number: string;
    } | null;
  } | null;
  paymentMethod: PaymentMethod;
  amount: number;
  paidAmount: number;
  changeAmount: number;
  notes?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  orderUuid: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const transactionService = {
  getAll: async (params?: { page?: number; limit?: number; status?: TransactionStatus; paymentMethod?: PaymentMethod }): Promise<PaginatedResponse<Transaction>> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/transaction-management/transactions${query ? `?${query}` : ''}`) as any;
    return response;
  },

  getById: async (uuid: string): Promise<Transaction> => {
    const response = await api.get(`/transaction-management/transactions/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: CreateTransactionData) => {
    const response = await api.post('/transaction-management/transactions', data) as any;
    return response?.data;
  },

  refund: async (uuid: string, reason?: string) => {
    const response = await api.patch(`/transaction-management/transactions/${uuid}/refund`, { reason }) as any;
    return response?.data;
  },

  getDailyReport: async (date: string) => {
    const response = await api.get(`/transaction-management/transactions/report/daily?date=${date}`) as any;
    return response?.data;
  },
};
