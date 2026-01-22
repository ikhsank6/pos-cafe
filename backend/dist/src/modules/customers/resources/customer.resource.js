"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResource = void 0;
class CustomerResource {
    uuid;
    name;
    email;
    phone;
    address;
    dateOfBirth;
    loyaltyPoints;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    ordersCount;
    constructor(customer) {
        this.uuid = customer.uuid;
        this.name = customer.name;
        this.email = customer.email || null;
        this.phone = customer.phone;
        this.address = customer.address || null;
        this.dateOfBirth = customer.dateOfBirth?.toISOString?.().split('T')[0] || customer.dateOfBirth || null;
        this.loyaltyPoints = customer.loyaltyPoints;
        this.createdAt = customer.createdAt?.toISOString?.() || customer.createdAt;
        this.updatedAt = customer.updatedAt?.toISOString?.() || customer.updatedAt;
        this.createdBy = customer.createdBy || null;
        this.updatedBy = customer.updatedBy || null;
        if (customer._count?.orders !== undefined) {
            this.ordersCount = customer._count.orders;
        }
    }
    static collection(customers) {
        return customers.map((customer) => new CustomerResource(customer));
    }
    toJSON() {
        const result = {
            uuid: this.uuid,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            dateOfBirth: this.dateOfBirth,
            loyaltyPoints: this.loyaltyPoints,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
        if (this.ordersCount !== undefined) {
            result.ordersCount = this.ordersCount;
        }
        return result;
    }
}
exports.CustomerResource = CustomerResource;
//# sourceMappingURL=customer.resource.js.map