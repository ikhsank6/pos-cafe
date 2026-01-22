export class CustomerResource {
    uuid: string;
    name: string;
    email: string | null;
    phone: string;
    address: string | null;
    dateOfBirth: string | null;
    loyaltyPoints: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    ordersCount?: number;

    constructor(customer: any) {
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

    static collection(customers: any[]): CustomerResource[] {
        return customers.map((customer) => new CustomerResource(customer));
    }

    toJSON() {
        const result: any = {
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
