export declare class ProductResource {
    uuid: string;
    sku: string;
    name: string;
    description: string | null;
    price: number;
    cost: number | null;
    stock: number;
    minStock: number;
    unit: string;
    image: string | null;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    category: {
        uuid: string;
        name: string;
    } | null;
    media: {
        uuid: string;
        path: string;
    } | null;
    constructor(product: any);
    static collection(products: any[]): ProductResource[];
    toJSON(): {
        uuid: string;
        sku: string;
        name: string;
        description: string | null;
        price: number;
        cost: number | null;
        stock: number;
        minStock: number;
        unit: string;
        image: string | null;
        type: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        createdBy: string | null;
        updatedBy: string | null;
        category: {
            uuid: string;
            name: string;
        } | null;
        media: {
            uuid: string;
            path: string;
        } | null;
    };
}
