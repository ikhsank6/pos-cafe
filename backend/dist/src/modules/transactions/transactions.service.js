"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const transaction_resource_1 = require("./resources/transaction.resource");
const client_1 = require("@prisma/client");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateTransactionNumber() {
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
    async findAll(page = 1, limit = 10, search, status, paymentMethod, startDate, endDate) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { transactionNo: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (paymentMethod) {
            where.paymentMethod = paymentMethod;
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
        return (0, pagination_util_1.buildPaginatedResponse)(transaction_resource_1.TransactionResource.collection(transactions), total, page, limit);
    }
    async findOne(uuid) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                order: {
                    include: { table: true },
                },
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaksi tidak ditemukan.');
        }
        return { message: 'Success', data: new transaction_resource_1.TransactionResource(transaction) };
    }
    async create(createTransactionDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findFirst({
                where: { uuid: createTransactionDto.orderUuid, deletedAt: null },
            });
            if (!order) {
                throw new common_1.BadRequestException('Order tidak ditemukan.');
            }
            if (order.status === client_1.OrderStatus.CANCELLED) {
                throw new common_1.BadRequestException('Order sudah dibatalkan.');
            }
            const existingTransaction = await prisma.transaction.findFirst({
                where: { orderId: order.id, status: client_1.TransactionStatus.COMPLETED, deletedAt: null },
            });
            if (existingTransaction) {
                throw new common_1.BadRequestException('Order sudah dibayar.');
            }
            const amount = Number(order.total);
            const paidAmount = createTransactionDto.amountPaid;
            if (paidAmount < amount) {
                throw new common_1.BadRequestException(`Jumlah pembayaran kurang. Total: Rp ${amount.toLocaleString()}`);
            }
            const changeAmount = paidAmount - amount;
            const transactionNo = await this.generateTransactionNumber();
            let paymentMethodEnum;
            switch (createTransactionDto.paymentMethod) {
                case 'EWALLET':
                    paymentMethodEnum = client_1.PaymentMethod.E_WALLET;
                    break;
                default:
                    paymentMethodEnum = createTransactionDto.paymentMethod;
            }
            const transaction = await prisma.transaction.create({
                data: {
                    transactionNo,
                    orderId: order.id,
                    paymentMethod: paymentMethodEnum,
                    status: client_1.TransactionStatus.COMPLETED,
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
            await prisma.order.update({
                where: { id: order.id },
                data: { status: client_1.OrderStatus.COMPLETED },
            });
            if (order.tableId) {
                const activeOrders = await prisma.order.count({
                    where: {
                        tableId: order.tableId,
                        id: { not: order.id },
                        status: { notIn: [client_1.OrderStatus.COMPLETED, client_1.OrderStatus.CANCELLED] },
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
            return { message: 'Pembayaran berhasil.', data: new transaction_resource_1.TransactionResource(transaction) };
        });
    }
    async refund(uuid, refundDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const transaction = await prisma.transaction.findFirst({
                where: { uuid, deletedAt: null },
                include: { order: true },
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaksi tidak ditemukan.');
            }
            if (transaction.status !== client_1.TransactionStatus.COMPLETED) {
                throw new common_1.BadRequestException('Hanya transaksi yang sudah dibayar yang bisa di-refund.');
            }
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: client_1.TransactionStatus.REFUNDED,
                    notes: `${transaction.notes || ''}\n[REFUND] ${refundDto.reason}`.trim(),
                    updatedBy,
                },
                include: {
                    order: {
                        include: { table: true },
                    },
                },
            });
            await prisma.order.update({
                where: { id: transaction.orderId },
                data: { status: client_1.OrderStatus.CANCELLED },
            });
            return { message: 'Refund berhasil.', data: new transaction_resource_1.TransactionResource(updatedTransaction) };
        });
    }
    async getDailySalesReport(date) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                status: client_1.TransactionStatus.COMPLETED,
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
        const byPaymentMethod = {};
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
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map