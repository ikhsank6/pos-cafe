import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, RefundTransactionDto } from './dto/transaction.dto';
import { TransactionResource } from './resources/transaction.resource';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateTransactionNumber;
    findAll(page?: number, limit?: number, search?: string, status?: string, paymentMethod?: string, startDate?: string, endDate?: string): Promise<{
        message: string;
        data: {
            items: TransactionResource[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: TransactionResource;
    }>;
    create(createTransactionDto: CreateTransactionDto, createdBy?: string): Promise<{
        message: string;
        data: TransactionResource;
    }>;
    refund(uuid: string, refundDto: RefundTransactionDto, updatedBy?: string): Promise<{
        message: string;
        data: TransactionResource;
    }>;
    getDailySalesReport(date?: string): Promise<{
        message: string;
        data: {
            date: string;
            totalSales: number;
            totalTransactions: number;
            averageTransaction: number;
            byPaymentMethod: Record<string, {
                count: number;
                total: number;
            }>;
        };
    }>;
}
