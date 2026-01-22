import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderItemStatusDto, AddOrderItemsDto } from './dto/order.dto';
import { OrderResource } from './resources/order.resource';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateOrderNumber;
    findAll(page?: number, limit?: number, search?: string, status?: string, orderType?: string, tableUuid?: string): Promise<{
        message: string;
        data: {
            items: OrderResource[];
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
        data: OrderResource;
    }>;
    create(createOrderDto: CreateOrderDto, createdBy?: string): Promise<{
        message: string;
        data: OrderResource;
    }>;
    updateStatus(uuid: string, updateStatusDto: UpdateOrderStatusDto, updatedBy?: string): Promise<{
        message: string;
        data: OrderResource;
    }>;
    updateItemStatus(orderUuid: string, itemUuid: string, updateStatusDto: UpdateOrderItemStatusDto, updatedBy?: string): Promise<{
        message: string;
        data: OrderResource;
    }>;
    addItems(uuid: string, addItemsDto: AddOrderItemsDto, createdBy?: string): Promise<{
        message: string;
        data: OrderResource;
    }>;
    getKitchenOrders(): Promise<{
        message: string;
        data: OrderResource[];
    }>;
}
