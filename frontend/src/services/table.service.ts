import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export const TABLE_STATUS_OPTIONS: { value: TableStatus; label: string; color: string }[] = [
  { value: 'AVAILABLE', label: 'Tersedia', color: 'bg-green-500' },
  { value: 'OCCUPIED', label: 'Terisi', color: 'bg-red-500' },
  { value: 'RESERVED', label: 'Reserved', color: 'bg-yellow-500' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-gray-500' },
];

export interface Table {
  uuid: string;
  number: string;
  capacity: number;
  status: TableStatus;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface TableFormData {
  number: string;
  capacity: number;
  status?: TableStatus;
  location?: string;
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

export const tableService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: TableStatus }): Promise<PaginatedResponse<Table>> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/table-management/tables${query ? `?${query}` : ''}`) as any;
    return response;
  },

  getById: async (uuid: string): Promise<Table> => {
    const response = await api.get(`/table-management/tables/${uuid}`) as any;
    return response?.data;
  },

  create: async (data: TableFormData) => {
    const response = await api.post('/table-management/tables', data) as any;
    return response?.data;
  },

  update: async (uuid: string, data: TableFormData) => {
    const response = await api.put(`/table-management/tables/${uuid}`, data) as any;
    return response?.data;
  },

  delete: async (uuid: string) => {
    return api.delete(`/table-management/tables/${uuid}`);
  },

  updateStatus: async (uuid: string, status: TableStatus) => {
    const response = await api.patch(`/table-management/tables/${uuid}/status`, { status }) as any;
    return response?.data;
  },

  getAvailable: async (): Promise<Table[]> => {
    const response = await api.get('/table-management/tables/available') as any;
    return response?.data || [];
  },
};
