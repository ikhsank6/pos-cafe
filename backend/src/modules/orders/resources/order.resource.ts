export class OrderItemResource {
    uuid: string;
    product: {
        uuid: string;
        name: string;
        sku: string;
    } | null;
    quantity: number;
    price: number;
    subtotal: number;
    notes: string | null;
    status: string;
    createdAt: string;

    constructor(item: any) {
        this.uuid = item.uuid;
        this.product = item.product ? {
            uuid: item.product.uuid,
            name: item.product.name,
            sku: item.product.sku,
        } : null;
        this.quantity = item.quantity;
        this.price = Number(item.price);
        this.subtotal = Number(item.subtotal);
        this.notes = item.notes || null;
        this.status = item.status;
        this.createdAt = item.createdAt?.toISOString?.() || item.createdAt;
    }

    static collection(items: any[]): OrderItemResource[] {
        return items.map((item) => new OrderItemResource(item));
    }
}

export class OrderResource {
    uuid: string;
    orderNumber: string;
    type: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    table: {
        uuid: string;
        number: string;
    } | null;
    customer: {
        uuid: string;
        name: string;
        phone: string;
    } | null;
    discountCode: {
        uuid: string;
        code: string;
        name: string;
    } | null;
    items: OrderItemResource[];

    constructor(order: any) {
        this.uuid = order.uuid;
        this.orderNumber = order.orderNumber;
        this.type = order.type;
        this.status = order.status;
        this.subtotal = Number(order.subtotal);
        this.discount = Number(order.discount);
        this.tax = Number(order.tax);
        this.total = Number(order.total);
        this.notes = order.notes || null;
        this.createdAt = order.createdAt?.toISOString?.() || order.createdAt;
        this.updatedAt = order.updatedAt?.toISOString?.() || order.updatedAt;
        this.createdBy = order.createdBy || null;

        this.table = order.table ? {
            uuid: order.table.uuid,
            number: order.table.number,
        } : null;

        this.customer = order.customer ? {
            uuid: order.customer.uuid,
            name: order.customer.name,
            phone: order.customer.phone,
        } : null;

        this.discountCode = order.discountCode ? {
            uuid: order.discountCode.uuid,
            code: order.discountCode.code,
            name: order.discountCode.name,
        } : null;

        this.items = order.orderItems ? OrderItemResource.collection(order.orderItems) : [];
    }

    static collection(orders: any[]): OrderResource[] {
        return orders.map((order) => new OrderResource(order));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            orderNumber: this.orderNumber,
            type: this.type,
            status: this.status,
            subtotal: this.subtotal,
            discount: this.discount,
            tax: this.tax,
            total: this.total,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            table: this.table,
            customer: this.customer,
            discountCode: this.discountCode,
            items: this.items,
        };
    }
}
