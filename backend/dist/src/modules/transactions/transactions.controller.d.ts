import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, RefundTransactionDto } from './dto/transaction.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(query: PaginationQueryDto, status?: string, paymentMethod?: string, startDate?: string, endDate?: string): Promise<{
        message: string;
        data: {
            items: import("./resources/transaction.resource").TransactionResource[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
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
    findOne(uuid: string): Promise<{
        message: string;
        data: import("./resources/transaction.resource").TransactionResource;
    }>;
    create(createTransactionDto: CreateTransactionDto, req: any): Promise<{
        message: string;
        data: import("./resources/transaction.resource").TransactionResource;
    }>;
    refund(uuid: string, refundDto: RefundTransactionDto, req: any): Promise<{
        message: string;
        data: import("./resources/transaction.resource").TransactionResource;
    }>;
}
