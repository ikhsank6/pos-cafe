export class CategoryResource {
    uuid: string;
    name: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    productCount?: number;

    constructor(category: any) {
        this.uuid = category.uuid;
        this.name = category.name;
        this.description = category.description || null;
        this.icon = category.icon || null;
        this.isActive = category.isActive;
        this.createdAt = category.createdAt?.toISOString?.() || category.createdAt;
        this.updatedAt = category.updatedAt?.toISOString?.() || category.updatedAt;
        this.createdBy = category.createdBy || null;
        this.updatedBy = category.updatedBy || null;

        if (category._count?.products !== undefined) {
            this.productCount = category._count.products;
        }
    }

    static collection(categories: any[]): CategoryResource[] {
        return categories.map((category) => new CategoryResource(category));
    }

    toJSON() {
        const result: any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            icon: this.icon,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };

        if (this.productCount !== undefined) {
            result.productCount = this.productCount;
        }

        return result;
    }
}
