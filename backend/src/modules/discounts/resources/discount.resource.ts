export class DiscountResource {
    uuid: string;
    code: string;
    name: string;
    description: string | null;
    type: string;
    value: number;
    minPurchase: number | null;
    maxDiscount: number | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
    usageLimit: number | null;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    isExpired: boolean;
    isUsable: boolean;

    constructor(discount: any) {
        this.uuid = discount.uuid;
        this.code = discount.code;
        this.name = discount.name;
        this.description = discount.description || null;
        this.type = discount.type;
        this.value = Number(discount.value);
        this.minPurchase = discount.minPurchase ? Number(discount.minPurchase) : null;
        this.maxDiscount = discount.maxDiscount ? Number(discount.maxDiscount) : null;
        this.startDate = (discount.startDate instanceof Date) ? discount.startDate.toISOString().split('T')[0] : (discount.startDate?.toISOString?.().split('T')[0] || (typeof discount.startDate === 'string' ? discount.startDate.split('T')[0] : discount.startDate));
        this.endDate = (discount.endDate instanceof Date) ? discount.endDate.toISOString().split('T')[0] : (discount.endDate?.toISOString?.().split('T')[0] || (typeof discount.endDate === 'string' ? discount.endDate.split('T')[0] : discount.endDate));
        this.isActive = discount.isActive;
        this.usageLimit = discount.usageLimit;
        this.usageCount = discount.usageCount;
        this.createdAt = discount.createdAt?.toISOString?.() || discount.createdAt;
        this.updatedAt = discount.updatedAt?.toISOString?.() || discount.updatedAt;
        this.createdBy = discount.createdBy || null;
        this.updatedBy = discount.updatedBy || null;

        // Calculate derived fields
        const now = new Date();
        const endDate = new Date(discount.endDate);
        this.isExpired = endDate < now;
        this.isUsable = discount.isActive && !this.isExpired &&
            (discount.usageLimit === null || discount.usageCount < discount.usageLimit);
    }

    static collection(discounts: any[]): DiscountResource[] {
        return discounts.map((discount) => new DiscountResource(discount));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            code: this.code,
            name: this.name,
            description: this.description,
            type: this.type,
            value: this.value,
            minPurchase: this.minPurchase,
            maxDiscount: this.maxDiscount,
            startDate: this.startDate,
            endDate: this.endDate,
            isActive: this.isActive,
            usageLimit: this.usageLimit,
            usageCount: this.usageCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            isExpired: this.isExpired,
            isUsable: this.isUsable,
        };
    }
}
