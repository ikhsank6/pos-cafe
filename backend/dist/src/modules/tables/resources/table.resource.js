"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableResource = void 0;
class TableResource {
    uuid;
    number;
    capacity;
    location;
    status;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    activeOrdersCount;
    constructor(table) {
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
    static collection(tables) {
        return tables.map((table) => new TableResource(table));
    }
    toJSON() {
        const result = {
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
exports.TableResource = TableResource;
//# sourceMappingURL=table.resource.js.map