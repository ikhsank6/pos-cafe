import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderItemStatusDto, AddOrderItemsDto } from './dto/order.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { OrderResource } from './resources/order.resource';
import { OrderType, OrderStatus, OrderItemStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    private async generateOrderNumber(): Promise<string> {
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

    async findAll(
        page = 1,
        limit = 10,
        search?: string,
        status?: string,
        orderType?: string,
        tableUuid?: string,
    ) {
        const skip = calculateSkip(page, limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status as OrderStatus;
        }

        if (orderType) {
            where.type = orderType as OrderType;
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

        return buildPaginatedResponse(
            OrderResource.collection(orders),
            total,
            page,
            limit,
        );
    }

    async findOne(uuid: string) {
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
            throw new NotFoundException('Order tidak ditemukan.');
        }

        return { message: 'Success', data: new OrderResource(order) };
    }

    async create(createOrderDto: CreateOrderDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            // Map orderType from DTO to Prisma enum
            let orderType: OrderType = OrderType.DINE_IN;
            if (createOrderDto.orderType === 'TAKEAWAY') {
                orderType = OrderType.TAKE_AWAY;
            } else if (createOrderDto.orderType === 'DELIVERY') {
                orderType = OrderType.DELIVERY;
            }

            // Validate table if provided
            let tableId: number | null = null;
            if (createOrderDto.tableUuid) {
                const table = await prisma.table.findFirst({
                    where: { uuid: createOrderDto.tableUuid, deletedAt: null },
                });
                if (!table) {
                    throw new BadRequestException('Meja tidak ditemukan.');
                }
                if (table.status !== 'AVAILABLE' && table.status !== 'OCCUPIED') {
                    throw new BadRequestException('Meja tidak tersedia.');
                }
                tableId = table.id;
            }

            // Validate customer if provided
            let customerId: number | null = null;
            if (createOrderDto.customerUuid) {
                const customer = await prisma.customer.findFirst({
                    where: { uuid: createOrderDto.customerUuid, deletedAt: null },
                });
                if (!customer) {
                    throw new BadRequestException('Customer tidak ditemukan.');
                }
                customerId = customer.id;
            }

            // Process items and calculate subtotal
            let subtotal = 0;
            const orderItems: any[] = [];

            for (const item of createOrderDto.items) {
                const product = await prisma.product.findFirst({
                    where: { uuid: item.productUuid, deletedAt: null },
                });

                if (!product) {
                    throw new BadRequestException(`Produk tidak ditemukan.`);
                }

                if (!product.isActive) {
                    throw new BadRequestException(`Produk ${product.name} tidak aktif.`);
                }

                const itemSubtotal = Number(product.price) * item.quantity;
                subtotal += itemSubtotal;

                orderItems.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                    subtotal: itemSubtotal,
                    notes: item.notes,
                    status: OrderItemStatus.PENDING,
                    createdBy,
                });
            }

            // Validate and apply discount
            let discountId: number | null = null;
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
                                } else {
                                    discountAmount = Number(discount.value);
                                }
                                discountId = discount.id;

                                // Increment usage count
                                await prisma.discount.update({
                                    where: { id: discount.id },
                                    data: { usageCount: { increment: 1 } },
                                });
                            }
                        }
                    }
                }
            }

            // Calculate tax (10% PPN)
            const TAX_RATE = 0.10;
            const tax = (subtotal - discountAmount) * TAX_RATE;
            const total = subtotal - discountAmount + tax;

            // Generate order number
            const orderNumber = await this.generateOrderNumber();

            // Create order
            const order = await prisma.order.create({
                data: {
                    orderNumber,
                    type: orderType,
                    status: OrderStatus.PENDING,
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

            // Update table status to OCCUPIED if DINE_IN
            if (tableId) {
                await prisma.table.update({
                    where: { id: tableId },
                    data: { status: 'OCCUPIED' },
                });
            }

            return { message: 'Order berhasil dibuat.', data: new OrderResource(order) };
        });
    }

    async updateStatus(uuid: string, updateStatusDto: UpdateOrderStatusDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findFirst({
                where: { uuid, deletedAt: null },
                include: { table: true },
            });

            if (!order) {
                throw new NotFoundException('Order tidak ditemukan.');
            }

            // Validate status transition
            const validTransitions: Record<string, string[]> = {
                PENDING: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
                CONFIRMED: ['PREPARING', 'READY', 'CANCELLED'],
                PREPARING: ['READY', 'SERVED', 'CANCELLED'],
                READY: ['SERVED', 'COMPLETED', 'CANCELLED'],
                SERVED: ['COMPLETED'],
                COMPLETED: [],
                CANCELLED: [],
            };

            if (!validTransitions[order.status]?.includes(updateStatusDto.status)) {
                throw new BadRequestException(`Status tidak bisa diubah dari ${order.status} ke ${updateStatusDto.status}.`);
            }

            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: { status: updateStatusDto.status as OrderStatus, updatedBy },
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

            // If completed or cancelled, free up the table
            if (['COMPLETED', 'CANCELLED'].includes(updateStatusDto.status) && order.tableId) {
                // Check if table has other active orders
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

            return { message: 'Status order berhasil diupdate.', data: new OrderResource(updatedOrder) };
        });
    }

    async updateItemStatus(
        orderUuid: string,
        itemUuid: string,
        updateStatusDto: UpdateOrderItemStatusDto,
        updatedBy?: string,
    ) {
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findFirst({
                where: { uuid: orderUuid, deletedAt: null },
            });

            if (!order) {
                throw new NotFoundException('Order tidak ditemukan.');
            }

            const item = await prisma.orderItem.findFirst({
                where: { uuid: itemUuid, orderId: order.id, deletedAt: null },
            });

            if (!item) {
                throw new NotFoundException('Order item tidak ditemukan.');
            }

            await prisma.orderItem.update({
                where: { id: item.id },
                data: { status: updateStatusDto.status as OrderItemStatus, updatedBy },
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

            return { message: 'Status item berhasil diupdate.', data: new OrderResource(updatedOrder) };
        });
    }

    async addItems(uuid: string, addItemsDto: AddOrderItemsDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!order) {
                throw new NotFoundException('Order tidak ditemukan.');
            }

            if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
                throw new BadRequestException('Order sudah selesai atau dibatalkan.');
            }

            let additionalSubtotal = 0;
            const newItems: any[] = [];

            for (const item of addItemsDto.items) {
                const product = await prisma.product.findFirst({
                    where: { uuid: item.productUuid, deletedAt: null },
                });

                if (!product) {
                    throw new BadRequestException('Produk tidak ditemukan.');
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
                    status: OrderItemStatus.PENDING,
                    createdBy,
                });
            }

            // Add new items
            await prisma.orderItem.createMany({
                data: newItems,
            });

            // Recalculate totals
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

            return { message: 'Item berhasil ditambahkan.', data: new OrderResource(updatedOrder) };
        });
    }

    // Get active orders for kitchen display
    async getKitchenOrders() {
        const orders = await this.prisma.order.findMany({
            where: {
                deletedAt: null,
                status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
            },
            orderBy: { createdAt: 'asc' },
            include: {
                table: true,
                orderItems: {
                    where: {
                        deletedAt: null,
                        status: { in: [OrderItemStatus.PENDING, OrderItemStatus.PREPARING] },
                    },
                    include: { product: true },
                },
            },
        });

        return { message: 'Success', data: OrderResource.collection(orders) };
    }
}
