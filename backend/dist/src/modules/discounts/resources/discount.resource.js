"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountResource = void 0;
class DiscountResource {
    uuid;
    code;
    name;
    description;
    type;
    value;
    minPurchase;
    maxDiscount;
    startDate;
    endDate;
    isActive;
    usageLimit;
    usageCount;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    isExpired;
    isUsable;
    constructor(discount) {
        this.uuid = discount.uuid;
        this.code = discount.code;
        this.name = discount.name;
        this.description = discount.description || null;
        this.type = discount.type;
        this.value = Number(discount.value);
        this.minPurchase = discount.minPurchase ? Number(discount.minPurchase) : null;
        this.maxDiscount = discount.maxDiscount ? Number(discount.maxDiscount) : null;
        this.startDate = discount.startDate?.toISOString?.().split('T')[0] || discount.startDate;
        this.endDate = discount.endDate?.toISOString?.().split('T')[0] || discount.endDate;
        this.isActive = discount.isActive;
        this.usageLimit = discount.usageLimit;
        this.usageCount = discount.usageCount;
        this.createdAt = discount.createdAt?.toISOString?.() || discount.createdAt;
        this.updatedAt = discount.updatedAt?.toISOString?.() || discount.updatedAt;
        this.createdBy = discount.createdBy || null;
        this.updatedBy = discount.updatedBy || null;
        const now = new Date();
        const endDate = new Date(discount.endDate);
        this.isExpired = endDate < now;
        this.isUsable = discount.isActive && !this.isExpired &&
            (discount.usageLimit === null || discount.usageCount < discount.usageLimit);
    }
    static collection(discounts) {
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
exports.DiscountResource = DiscountResource;
//# sourceMappingURL=discount.resource.js.map