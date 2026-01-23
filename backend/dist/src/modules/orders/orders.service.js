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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const order_resource_1 = require("./resources/order.resource");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateOrderNumber() {
        const today = new Date();
        const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
        const lastOrder = await this.prisma.order.findFirst({
            where: {
                orderNumber: { startsWith: `ORD-${datePrefix}` },
            },
            orderBy: { orderNumber: 'desc' },
        });
        let sequence = 1;
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
            sequence = lastSequence + 1;
        }
        return `ORD-${datePrefix}-${sequence.toString().padStart(4, '0')}`;
    }
    async findAll(page = 1, limit = 10, search, status, orderType, tableUuid) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (orderType) {
            where.type = orderType;
        }
        if (tableUuid) {
            const table = await this.prisma.table.findFirst({
                where: { uuid: tableUuid, deletedAt: null },
            });
            if (table) {
                where.tableId = table.id;
            }
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    table: true,
                    customer: true,
                    discountCode: true,
                    orderItems: {
                        where: { deletedAt: null },
                        include: { product: true },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(order_resource_1.OrderResource.collection(orders), total, page, limit);
    }
    async findOne(uuid) {
        const order = await this.prisma.order.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                table: true,
                customer: true,
                discountCode: true,
                orderItems: {
                    where: { deletedAt: null },
                    include: { product: true },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order tidak ditemukan.');
        }
        return { message: 'Success', data: new order_resource_1.OrderResource(order) };
    }
    async create(createOrderDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            let orderType = client_1.OrderType.DINE_IN;
            if (createOrderDto.orderType === 'TAKEAWAY') {
                orderType = client_1.OrderType.TAKE_AWAY;
            }
            else if (createOrderDto.orderType === 'DELIVERY') {
                orderType = client_1.OrderType.DELIVERY;
            }
            let tableId = null;
            if (createOrderDto.tableUuid) {
                const table = await prisma.table.findFirst({
                    where: { uuid: createOrderDto.tableUuid, deletedAt: null },
                });
                if (!table) {
                    throw new common_1.BadRequestException('Meja tidak ditemukan.');
                }
                if (table.status !== 'AVAILABLE' && table.status !== 'OCCUPIED') {
                    throw new common_1.BadRequestException('Meja tidak tersedia.');
                }
                tableId = table.id;
            }
            let customerId = null;
            if (createOrderDto.customerUuid) {
                const customer = await prisma.customer.findFirst({
                    where: { uuid: createOrderDto.customerUuid, deletedAt: null },
                });
                if (!customer) {
                    throw new common_1.BadRequestException('Customer tidak ditemukan.');
                }
                customerId = customer.id;
            }
            let subtotal = 0;
            const orderItems = [];
            for (const item of createOrderDto.items) {
                const product = await prisma.product.findFirst({
                    where: { uuid: item.productUuid, deletedAt: null },
                });
                if (!product) {
                    throw new common_1.BadRequestException(`Produk tidak ditemukan.`);
                }
                if (!product.isActive) {
                    throw new common_1.BadRequestException(`Produk ${product.name} tidak aktif.`);
                }
                const itemSubtotal = Number(product.price) * item.quantity;
                subtotal += itemSubtotal;
                orderItems.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                    subtotal: itemSubtotal,
                    notes: item.notes,
                    status: client_1.OrderItemStatus.PENDING,
                    createdBy,
                });
            }
            let discountId = null;
            let discountAmount = 0;
            if (createOrderDto.discountCode) {
                const discount = await prisma.discount.findFirst({
                    where: { code: createOrderDto.discountCode, deletedAt: null },
                });
                if (discount) {
                    const now = new Date();
                    if (discount.isActive && new Date(discount.startDate) <= now && new Date(discount.endDate) >= now) {
                        if (!discount.usageLimit || discount.usageCount < discount.usageLimit) {
                            if (!discount.minPurchase || subtotal >= Number(discount.minPurchase)) {
                                if (discount.type === 'PERCENTAGE') {
                                    discountAmount = (subtotal * Number(discount.value)) / 100;
                                    if (discount.maxDiscount && discountAmount > Number(discount.maxDiscount)) {
                                        discountAmount = Number(discount.maxDiscount);
                                    }
                                }
                                else {
                                    discountAmount = Number(discount.value);
                                }
                                discountId = discount.id;
                                await prisma.discount.update({
                                    where: { id: discount.id },
                                    data: { usageCount: { increment: 1 } },
                                });
                            }
                        }
                    }
                }
            }
            const TAX_RATE = 0.10;
            const tax = (subtotal - discountAmount) * TAX_RATE;
            const total = subtotal - discountAmount + tax;
            const orderNumber = await this.generateOrderNumber();
            const order = await prisma.order.create({
                data: {
                    orderNumber,
                    type: orderType,
                    status: client_1.OrderStatus.PENDING,
                    tableId,
                    customerId,
                    discountId,
                    subtotal,
                    discount: discountAmount,
                    tax,
                    total,
                    notes: createOrderDto.notes,
                    createdBy,
                    orderItems: {
                        create: orderItems,
                    },
                },
                include: {
                    table: true,
                    customer: true,
                    discountCode: true,
                    orderItems: {
                        include: { product: true },
                    },
                },
            });
            if (tableId) {
                await prisma.table.update({
                    where: { id: tableId },
                    data: { status: 'OCCUPIED' },
                });
            }
            return { message: 'Order berhasil dibuat.', data: new order_resource_1.OrderResource(order) };
        });
    }
    async updateStatus(uuid, updateStatusDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findFirst({
                where: { uuid, deletedAt: null },
                include: { table: true },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order tidak ditemukan.');
            }
            const validTransitions = {
                PENDING: ['CONFIRMED', 'CANCELLED'],
                CONFIRMED: ['PREPARING', 'CANCELLED'],
                PREPARING: ['READY', 'CANCELLED'],
                READY: ['SERVED', 'CANCELLED'],
                SERVED: ['COMPLETED'],
                COMPLETED: [],
                CANCELLED: [],
            };
            if (!validTransitions[order.status]?.includes(updateStatusDto.status)) {
                throw new common_1.BadRequestException(`Status tidak bisa diubah dari ${order.status} ke ${updateStatusDto.status}.`);
            }
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: { status: updateStatusDto.status, updatedBy },
                include: {
                    table: true,
                    customer: true,
                    discountCode: true,
                    orderItems: {
                        where: { deletedAt: null },
                        include: { product: true },
                    },
                },
            });
            if (['COMPLETED', 'CANCELLED'].includes(updateStatusDto.status) && order.tableId) {
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
            return { message: 'Status order berhasil diupdate.', data: new order_resource_1.OrderResource(updatedOrder) };
        });
    }
    async updateItemStatus(orderUuid, itemUuid, updateStatusDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findFirst({
                where: { uuid: orderUuid, deletedAt: null },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order tidak ditemukan.');
            }
            const item = await prisma.orderItem.findFirst({
                where: { uuid: itemUuid, orderId: order.id, deletedAt: null },
            });
            if (!item) {
                throw new common_1.NotFoundException('Order item tidak ditemukan.');
            }
            await prisma.orderItem.update({
                where: { id: item.id },
                data: { status: updateStatusDto.status, updatedBy },
            });
            const updatedOrder = await prisma.order.findFirst({
                where: { id: order.id },
                include: {
                    table: true,
                    customer: true,
                    discountCode: true,
                    orderItems: {
                        where: { deletedAt: null },
                        include: { product: true },
                    },
                },
            });
            return { message: 'Status item berhasil diupdate.', data: new order_resource_1.OrderResource(updatedOrder) };
        });
    }
    async addItems(uuid, addItemsDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!order) {
                throw new common_1.NotFoundException('Order tidak ditemukan.');
            }
            if (order.status === client_1.OrderStatus.COMPLETED || order.status === client_1.OrderStatus.CANCELLED) {
                throw new common_1.BadRequestException('Order sudah selesai atau dibatalkan.');
            }
            let additionalSubtotal = 0;
            const newItems = [];
            for (const item of addItemsDto.items) {
                const product = await prisma.product.findFirst({
                    where: { uuid: item.productUuid, deletedAt: null },
                });
                if (!product) {
                    throw new common_1.BadRequestException('Produk tidak ditemukan.');
                }
                const itemSubtotal = Number(product.price) * item.quantity;
                additionalSubtotal += itemSubtotal;
                newItems.push({
                    orderId: order.id,
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                    subtotal: itemSubtotal,
                    notes: item.notes,
                    status: client_1.OrderItemStatus.PENDING,
                    createdBy,
                });
            }
            await prisma.orderItem.createMany({
                data: newItems,
            });
            const newSubtotal = Number(order.subtotal) + additionalSubtotal;
            const TAX_RATE = 0.10;
            const newTax = (newSubtotal - Number(order.discount)) * TAX_RATE;
            const newTotal = newSubtotal - Number(order.discount) + newTax;
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    subtotal: newSubtotal,
                    tax: newTax,
                    total: newTotal,
                    updatedBy: createdBy,
                },
                include: {
                    table: true,
                    customer: true,
                    discountCode: true,
                    orderItems: {
                        where: { deletedAt: null },
                        include: { product: true },
                    },
                },
            });
            return { message: 'Item berhasil ditambahkan.', data: new order_resource_1.OrderResource(updatedOrder) };
        });
    }
    async getKitchenOrders() {
        const orders = await this.prisma.order.findMany({
            where: {
                deletedAt: null,
                status: { in: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.PREPARING] },
            },
            orderBy: { createdAt: 'asc' },
            include: {
                table: true,
                orderItems: {
                    where: {
                        deletedAt: null,
                        status: { in: [client_1.OrderItemStatus.PENDING, client_1.OrderItemStatus.PREPARING] },
                    },
                    include: { product: true },
                },
            },
        });
        return { message: 'Success', data: order_resource_1.OrderResource.collection(orders) };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map