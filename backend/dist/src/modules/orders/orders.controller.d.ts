import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderItemStatusDto, AddOrderItemsDto } from './dto/order.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(query: PaginationQueryDto, status?: string, orderType?: string, tableUuid?: string): Promise<{
        message: string;
        data: {
            items: import("./resources/order.resource").OrderResource[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    getKitchenOrders(): Promise<{
        message: string;
        data: import("./resources/order.resource").OrderResource[];
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: import("./resources/order.resource").OrderResource;
    }>;
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        message: string;
        data: import("./resources/order.resource").OrderResource;
    }>;
    updateStatus(uuid: string, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
        message: string;
        data: import("./resources/order.resource").OrderResource;
    }>;
    cancel(uuid: string, reason: string, req: any): Promise<{
        message: string;
        data: import("./resources/order.resource").OrderResource;
    }>;
    updateItemStatus(uuid: string, itemUuid: string, updateStatusDto: UpdateOrderItemStatusDto, req: any): Promise<{
        message: string;
        data: import("./resources/order.resource").OrderResource;
    }>;
    addItems(uuid: string, addItemsDto: AddOrderItemsDto, req: any): Promise<{
        message: string;
        data: import("./resources/order.resource").OrderResource;
    }>;
}
