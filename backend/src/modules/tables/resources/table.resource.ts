export class TableResource {
    uuid: string;
    number: string;
    capacity: number;
    location: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    activeOrdersCount?: number;

    constructor(table: any) {
        this.uuid = table.uuid;
        this.number = table.number;
        this.capacity = table.capacity;
        this.location = table.location || null;
        this.status = table.status;
        this.createdAt = table.createdAt?.toISOString?.() || table.createdAt;
        this.updatedAt = table.updatedAt?.toISOString?.() || table.updatedAt;
        this.createdBy = table.createdBy || null;
        this.updatedBy = table.updatedBy || null;

        if (table._count?.orders !== undefined) {
            this.activeOrdersCount = table._count.orders;
        }
    }

    static collection(tables: any[]): TableResource[] {
        return tables.map((table) => new TableResource(table));
    }

    toJSON() {
        const result: any = {
            uuid: this.uuid,
            number: this.number,
            capacity: this.capacity,
            location: this.location,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };

        if (this.activeOrdersCount !== undefined) {
            result.activeOrdersCount = this.activeOrdersCount;
        }

        return result;
    }
}
