export declare enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED_AMOUNT = "FIXED_AMOUNT"
}
export declare class CreateDiscountDto {
    code: string;
    name: string;
    description?: string;
    type: DiscountType;
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    usageLimit?: number;
}
export declare class UpdateDiscountDto {
    code?: string;
    name?: string;
    description?: string;
    type?: DiscountType;
    value?: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    usageLimit?: number;
}
