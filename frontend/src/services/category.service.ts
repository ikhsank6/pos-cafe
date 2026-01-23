import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';

export interface Category {
  uuid: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
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

export const categoryService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Category>> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/product-management/categories${query ? `?${query}` : ''}`) as any;
    return response;
  },

  getById: async (uuid: string): Promise<Category> => {
    const response = await api.get(`/product-management/categories/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: CategoryFormData) => {
    const response = await api.post('/product-management/categories', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: CategoryFormData) => {
    const response = await api.put(`/product-management/categories/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/product-management/categories/${uuid}`);
  },
};
