import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, RefundTransactionDto } from './dto/transaction.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { TransactionResource } from './resources/transaction.resource';
import { PaymentMethod, TransactionStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    private async generateTransactionNumber(): Promise<string> {
        const today = new Date();
        const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

        const lastTransaction = await this.prisma.transaction.findFirst({
            where: {
                transactionNo: { startsWith: `TRX-${datePrefix}` },
            },
            orderBy: { transactionNo: 'desc' },
        });

        let sequence = 1;
        if (lastTransaction) {
            const lastSequence = parseInt(lastTransaction.transactionNo.slice(-4));
            sequence = lastSequence + 1;
        }

        return `TRX-${datePrefix}-${sequence.toString().padStart(4, '0')}`;
    }

    async findAll(
        page = 1,
        limit = 10,
        search?: string,
        status?: string,
        paymentMethod?: string,
        startDate?: string,
        endDate?: string,
    ) {
        const skip = calculateSkip(page, limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { transactionNo: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status as TransactionStatus;
        }

        if (paymentMethod) {
            where.paymentMethod = paymentMethod as PaymentMethod;
        }

        if (startDate) {
            where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt = { ...where.createdAt, lte: end };
        }

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        include: { table: true },
                    },
                },
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return buildPaginatedResponse(
            TransactionResource.collection(transactions),
            total,
            page,
            limit,
        );
    }

    async findOne(uuid: string) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                order: {
                    include: { table: true },
                },
            },
        });

        if (!transaction) {
            throw new NotFoundException('Transaksi tidak ditemukan.');
        }

        return { message: 'Success', data: new TransactionResource(transaction) };
    }

    async create(createTransactionDto: CreateTransactionDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            // Get order with items
            const order = await prisma.order.findFirst({
                where: { uuid: createTransactionDto.orderUuid, deletedAt: null },
                include: {
                    orderItems: true,
                },
            });

            if (!order) {
                throw new BadRequestException('Order tidak ditemukan.');
            }

            if (order.status === OrderStatus.CANCELLED) {
                throw new BadRequestException('Order sudah dibatalkan.');
            }

            // Check if order already has a paid transaction
            const existingTransaction = await prisma.transaction.findFirst({
                where: { orderId: order.id, status: TransactionStatus.COMPLETED, deletedAt: null },
            });

            if (existingTransaction) {
                throw new BadRequestException('Order sudah dibayar.');
            }

            const amount = Number(order.total);
            const paidAmount = createTransactionDto.amountPaid;

            if (paidAmount < amount) {
                throw new BadRequestException(`Jumlah pembayaran kurang. Total: Rp ${amount.toLocaleString()}`);
            }

            const changeAmount = paidAmount - amount;

            // Generate transaction number
            const transactionNo = await this.generateTransactionNumber();

            // Map payment method
            let paymentMethodEnum: PaymentMethod;
            switch (createTransactionDto.paymentMethod) {
                case 'EWALLET':
                    paymentMethodEnum = PaymentMethod.E_WALLET;
                    break;
                default:
                    paymentMethodEnum = createTransactionDto.paymentMethod as PaymentMethod;
            }

            // Create transaction
            const transaction = await prisma.transaction.create({
                data: {
                    transactionNo,
                    orderId: order.id,
                    paymentMethod: paymentMethodEnum,
                    status: TransactionStatus.COMPLETED,
                    amount,
                    paidAmount,
                    changeAmount,
                    notes: createTransactionDto.notes,
                    createdBy,
                },
                include: {
                    order: {
                        include: { table: true },
                    },
                },
            });

            // Update order status to CONFIRMED (paid but still need to be prepared/served)
            await prisma.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.CONFIRMED },
            });

            // Update product stock and record movement
            for (const item of order.orderItems) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });

                await prisma.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: 'OUT',
                        quantity: item.quantity,
                        notes: `Pembayaran Order: ${transactionNo}`,
                        reference: transactionNo,
                        createdBy,
                    },
                });
            }

            // Free up table if DINE_IN
            if (order.tableId) {
                const activeOrders = await prisma.order.count({
                    where: {
                        tableId: order.tableId,
                        id: { not: order.id },
                        status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
                        deletedAt: null,
                    },
                });

                if (activeOrders === 0) {
                    await prisma.table.update({
                        where: { id: order.tableId },
                        data: { status: 'AVAILABLE' },
                    });
                }
            }

            return { message: 'Pembayaran berhasil.', data: new TransactionResource(transaction) };
        });
    }

    async refund(uuid: string, refundDto: RefundTransactionDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const transaction = await prisma.transaction.findFirst({
                where: { uuid, deletedAt: null },
                include: { 
                    order: {
                        include: { orderItems: true }
                    } 
                },
            });

            if (!transaction) {
                throw new NotFoundException('Transaksi tidak ditemukan.');
            }

            if (transaction.status !== TransactionStatus.COMPLETED) {
                throw new BadRequestException('Hanya transaksi yang sudah dibayar yang bisa di-refund.');
            }

            // Update transaction status
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: TransactionStatus.REFUNDED,
                    notes: `${transaction.notes || ''}\n[REFUND] ${refundDto.reason}`.trim(),
                    updatedBy,
                },
                include: {
                    order: {
                        include: { table: true },
                    },
                },
            });

            // Update order status to CANCELLED
            await prisma.order.update({
                where: { id: transaction.orderId },
                data: { status: OrderStatus.CANCELLED },
            });

            // Return stock and record movement
            if (transaction.order && transaction.order.orderItems) {
                for (const item of transaction.order.orderItems) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: { increment: item.quantity },
                        },
                    });

                    await prisma.stockMovement.create({
                        data: {
                            productId: item.productId,
                            type: 'RETURN',
                            quantity: item.quantity,
                            notes: `Refund Transaksi: ${transaction.transactionNo}`,
                            reference: transaction.transactionNo,
                            createdBy: updatedBy,
                        },
                    });
                }
            }

            // Return discount usage if exists
            if (transaction.order && transaction.order.discountId) {
                await prisma.discount.update({
                    where: { id: transaction.order.discountId },
                    data: {
                        usageCount: { decrement: 1 },
                    },
                });
            }

            return { message: 'Refund berhasil.', data: new TransactionResource(updatedTransaction) };
        });
    }

    // Daily sales report
    async getDailySalesReport(date?: string) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const transactions = await this.prisma.transaction.findMany({
            where: {
                status: TransactionStatus.COMPLETED,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                deletedAt: null,
            },
            include: {
                order: true,
            },
        });

        const totalSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalTransactions = transactions.length;

        // Group by payment method
        const byPaymentMethod: Record<string, { count: number; total: number }> = {};
        transactions.forEach((t) => {
            if (!byPaymentMethod[t.paymentMethod]) {
                byPaymentMethod[t.paymentMethod] = { count: 0, total: 0 };
            }
            byPaymentMethod[t.paymentMethod].count++;
            byPaymentMethod[t.paymentMethod].total += Number(t.amount);
        });

        return {
            message: 'Success',
            data: {
                date: targetDate.toISOString().split('T')[0],
                totalSales,
                totalTransactions,
                averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
                byPaymentMethod,
            },
        };
    }
}
