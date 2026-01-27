import api from '@/config/axios';
import { createQueryParams } from '@/lib/utils';

export interface DashboardStats {
  totalIncome: number;
  totalPaidOrders: number;
  totalCustomers: number;
  newCustomersInPeriod: number;
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  recentTransactions: {
    uuid: string;
    transactionNo: string;
    orderNumber: string;
    customerName: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

export const dashboardService = {
  getStats: async (params?: { startDate?: string; endDate?: string }): Promise<DashboardStats> => {
    const query = createQueryParams(params || {});
    const response = await api.get(`/dashboard/stats${query ? `?${query}` : ''}`) as any;
    return response?.data;
  },
};
