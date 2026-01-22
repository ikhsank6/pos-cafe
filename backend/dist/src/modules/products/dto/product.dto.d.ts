export declare enum ProductType {
    FOOD = "FOOD",
    BEVERAGE = "BEVERAGE",
    SNACK = "SNACK",
    OTHER = "OTHER"
}
export declare class CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    categoryUuid: string;
    price: number;
    cost?: number;
    stock?: number;
    minStock?: number;
    unit?: string;
    mediaUuid?: string;
    type?: ProductType;
    isActive?: boolean;
}
export declare class UpdateProductDto {
    sku?: string;
    name?: string;
    description?: string;
    categoryUuid?: string;
    price?: number;
    cost?: number;
    stock?: number;
    minStock?: number;
    unit?: string;
    mediaUuid?: string;
    type?: ProductType;
    isActive?: boolean;
}
