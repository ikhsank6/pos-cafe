import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Discount {
  uuid: string;
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface DiscountFormData {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
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

export const discountService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Discount>> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/discount-management/discounts${query ? `?${query}` : ''}`) as any;
    return response;
  },

  getById: async (uuid: string): Promise<Discount> => {
    const response = await api.get(`/discount-management/discounts/${uuid}`) as any;
    return response?.data;
  },

  getByCode: async (code: string): Promise<Discount | null> => {
    const response = await api.get(`/discount-management/discounts/code/${code}`) as any;
    return response?.data;
  },

  create: async (data: DiscountFormData) => {
    const response = await api.post('/discount-management/discounts', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: DiscountFormData) => {
    const response = await api.put(`/discount-management/discounts/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/discount-management/discounts/${uuid}`);
  },

  validateCode: async (code: string, orderAmount: number): Promise<{ valid: boolean; discount?: Discount; message?: string }> => {
    const response = await api.get(`/discount-management/discounts/validate/${code}?amount=${orderAmount}`) as any;
    return response;
  },
};
