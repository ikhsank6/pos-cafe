import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';
import type { Category } from './category.service';

export interface Product {
  uuid: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
  categoryUuid?: string;
  category?: Category;
  media?: {
    uuid: string;
    path: string;
    filename: string;
    originalName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  sku?: string;
  imageUrl?: string;
  categoryUuid?: string;
  mediaUuid?: string;
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

export const productService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; categoryUuid?: string }): Promise<PaginatedResponse<Product>> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/product-management/products${query ? `?${query}` : ''}`) as any;
    return response;
  },

  getById: async (uuid: string): Promise<Product> => {
    const response = await api.get(`/product-management/products/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: ProductFormData) => {
    const response = await api.post('/product-management/products', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: ProductFormData) => {
    const response = await api.put(`/product-management/products/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/product-management/products/${uuid}`);
  },

  updateStock: async (uuid: string, quantity: number, operation: 'add' | 'subtract') => {
    const response = await api.patch(`/product-management/products/${uuid}/stock`, { quantity, operation }) as any;
    return response?.data;
  },
};
