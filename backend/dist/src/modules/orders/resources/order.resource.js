"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderResource = exports.OrderItemResource = void 0;
class OrderItemResource {
    uuid;
    product;
    quantity;
    price;
    subtotal;
    notes;
    status;
    createdAt;
    constructor(item) {
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
    static collection(items) {
        return items.map((item) => new OrderItemResource(item));
    }
}
exports.OrderItemResource = OrderItemResource;
class OrderResource {
    uuid;
    orderNumber;
    type;
    status;
    subtotal;
    discount;
    tax;
    total;
    notes;
    createdAt;
    updatedAt;
    createdBy;
    table;
    customer;
    discountCode;
    items;
    constructor(order) {
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
    static collection(orders) {
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
exports.OrderResource = OrderResource;
//# sourceMappingURL=order.resource.js.map