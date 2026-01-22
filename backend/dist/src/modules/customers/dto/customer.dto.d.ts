export declare class CreateCustomerDto {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    loyaltyPoints?: number;
}
