export declare enum OrderType {
    DINE_IN = "DINE_IN",
    TAKEAWAY = "TAKEAWAY",
    DELIVERY = "DELIVERY"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    SERVED = "SERVED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum OrderItemStatus {
    PENDING = "PENDING",
    PREPARING = "PREPARING",
    READY = "READY",
    SERVED = "SERVED",
    CANCELLED = "CANCELLED"
}
export declare class OrderItemDto {
    productUuid: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    orderType?: OrderType;
    tableUuid?: string;
    customerUuid?: string;
    items: OrderItemDto[];
    notes?: string;
    discountCode?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
export declare class UpdateOrderItemStatusDto {
    status: OrderItemStatus;
}
export declare class AddOrderItemsDto {
    items: OrderItemDto[];
}
