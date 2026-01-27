import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats(startDate?: string, endDate?: string) {
        const where: any = { deletedAt: null };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        // Total Pendapatan (COMPLETED transactions)
        const totalIncome = await this.prisma.transaction.aggregate({
            where: {
                ...where,
                status: TransactionStatus.COMPLETED,
            },
            _sum: {
                amount: true,
            },
        });

        // Total Order yang Terbayar
        // Count unique orders that have a COMPLETED transaction
        const paidOrdersGroup = await this.prisma.transaction.groupBy({
            by: ['orderId'],
            where: {
                ...where,
                status: TransactionStatus.COMPLETED,
            },
        });
        const completedOrdersCount = paidOrdersGroup.length;

        // Orders by Status
        const ordersByStatus = await this.prisma.order.groupBy({
            by: ['status'],
            where,
            _count: {
                id: true,
            },
        });

        // Total Customers (Usually customers are not filtered by creation date for general stats, but let's see if we want to)
        // For general "business summary", total customers is usually absolute, 
        // but new customers in period could be interesting.
        const totalCustomers = await this.prisma.customer.count({
            where: { deletedAt: null },
        });

        // New Customers in period if filtered
        const newCustomersInPeriod = await this.prisma.customer.count({
            where: {
                ...where,
            },
        });

        // Recent Transactions
        const recentTransactions = await this.prisma.transaction.findMany({
            where,
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        customerName: true,
                    },
                },
            },
        });

        return {
            totalIncome: Number(totalIncome._sum.amount || 0),
            totalPaidOrders: completedOrdersCount,
            totalCustomers,
            newCustomersInPeriod,
            ordersByStatus: ordersByStatus.map(s => ({
                status: s.status,
                count: s._count.id,
            })),
            recentTransactions: recentTransactions.map(t => ({
                uuid: t.uuid,
                transactionNo: t.transactionNo,
                orderNumber: t.order?.orderNumber,
                customerName: t.order?.customerName || 'Guest',
                amount: Number(t.amount),
                status: t.status,
                createdAt: t.createdAt,
            })),
        };
    }
}
