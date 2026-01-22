export declare class OrderItemResource {
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
    constructor(item: any);
    static collection(items: any[]): OrderItemResource[];
}
export declare class OrderResource {
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
    constructor(order: any);
    static collection(orders: any[]): OrderResource[];
    toJSON(): {
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
    };
}
