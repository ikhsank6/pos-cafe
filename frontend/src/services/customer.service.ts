import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';

export interface Customer {
  uuid: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
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

export const customerService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Customer>> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/customer-management/customers${query ? `?${query}` : ''}`) as any;
    return response;
  },

  getById: async (uuid: string): Promise<Customer> => {
    const response = await api.get(`/customer-management/customers/${uuid}`) as any;
    return response?.data;
  },

  getByPhone: async (phone: string): Promise<Customer | null> => {
    const response = await api.get(`/customer-management/customers/phone/${phone}`) as any;
    return response?.data;
  },

  create: async (data: CustomerFormData) => {
    const response = await api.post('/customer-management/customers', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: CustomerFormData) => {
    const response = await api.put(`/customer-management/customers/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/customer-management/customers/${uuid}`);
  },

  updateLoyaltyPoints: async (uuid: string, points: number, operation: 'add' | 'subtract') => {
    const response = await api.patch(`/customer-management/customers/${uuid}/loyalty-points`, { points, operation }) as any;
    return response?.data;
  },
};
