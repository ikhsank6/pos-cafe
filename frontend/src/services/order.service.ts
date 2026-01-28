import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';
import type { Product } from './product.service';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export interface OrderItem {
  uuid: string;
  productUuid: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  status: OrderItemStatus;
}

export interface Order {
  uuid: string;
  orderNumber: string;
  type: OrderType;
  tableUuid?: string;
  table?: {
    uuid: string;
    number: string;
  };
  customerUuid?: string;
  customer?: {
    uuid: string;
    name: string;
    phone: string;
  };
  discountCode?: {
    uuid: string;
    code: string;
    name: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  isPaid: boolean;
  transactionNo?: string | null;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateOrderData {
  type: OrderType;
  tableUuid?: string;
  customerUuid?: string;
  discountCode?: string;
  items: {
    productUuid: string;
    quantity: number;
    notes?: string;
  }[];
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

export const orderService = {
  getAll: async (params?: { page?: number; limit?: number; status?: OrderStatus; type?: OrderType }): Promise<PaginatedResponse<Order>> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/order-management/orders${query ? `?${query}` : ''}`) as any;
    return response;
  },

  getById: async (uuid: string): Promise<Order> => {
    const response = await api.get(`/order-management/orders/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: CreateOrderData) => {
    const response = await api.post('/order-management/orders', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: Partial<CreateOrderData>) => {
    const response = await api.put(`/order-management/orders/${uuid}`, data) as any;
    return response?.data;
  },

  updateStatus: async (uuid: string, status: OrderStatus) => {
    const response = await api.patch(`/order-management/orders/${uuid}/status`, { status }) as any;
    return response?.data;
  },

  cancel: async (uuid: string, reason?: string) => {
    const response = await api.patch(`/order-management/orders/${uuid}/cancel`, { reason }) as any;
    return response?.data;
  },

  getKitchenOrders: async (): Promise<Order[]> => {
    const response = await api.get('/order-management/orders/kitchen') as any;
    return response?.data || [];
  },

  updateItemStatus: async (orderUuid: string, itemUuid: string, status: OrderItemStatus) => {
    const response = await api.patch(`/order-management/orders/${orderUuid}/items/${itemUuid}/status`, { status }) as any;
    return response?.data;
  },
  
  delete: async (uuid: string) => {
    return api.delete(`/order-management/orders/${uuid}`);
  },
};
