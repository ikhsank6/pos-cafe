export class ProductResource {
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
        filename: string;
        originalName: string;
    } | null;

    constructor(product: any) {
        this.uuid = product.uuid;
        this.sku = product.sku;
        this.name = product.name;
        this.description = product.description || null;
        this.price = Number(product.price);
        this.cost = product.cost ? Number(product.cost) : null;
        this.stock = product.stock;
        this.minStock = product.minStock;
        this.unit = product.unit;
        this.image = product.image || null;
        this.type = product.type;
        this.isActive = product.isActive;
        this.createdAt = product.createdAt?.toISOString?.() || product.createdAt;
        this.updatedAt = product.updatedAt?.toISOString?.() || product.updatedAt;
        this.createdBy = product.createdBy || null;
        this.updatedBy = product.updatedBy || null;

        this.category = product.category ? {
            uuid: product.category.uuid,
            name: product.category.name,
        } : null;

        this.media = product.media ? {
            uuid: product.media.uuid,
            path: `/upload/images/${product.media.uuid}`,
            filename: product.media.filename,
            originalName: product.media.originalName,
        } : null;
    }

    static collection(products: any[]): ProductResource[] {
        return products.map((product) => new ProductResource(product));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            sku: this.sku,
            name: this.name,
            description: this.description,
            price: this.price,
            cost: this.cost,
            stock: this.stock,
            minStock: this.minStock,
            unit: this.unit,
            image: this.image,
            type: this.type,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            category: this.category,
            media: this.media,
        };
    }
}
