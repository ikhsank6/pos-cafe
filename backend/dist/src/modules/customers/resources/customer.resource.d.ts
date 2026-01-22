export declare class CustomerResource {
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
    constructor(customer: any);
    static collection(customers: any[]): CustomerResource[];
    toJSON(): any;
}
