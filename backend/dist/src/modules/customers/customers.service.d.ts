import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CustomerResource } from './resources/customer.resource';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string): Promise<{
        message: string;
        data: {
            items: CustomerResource[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: CustomerResource;
    }>;
    findByPhone(phone: string): Promise<{
        message: string;
        data: CustomerResource;
    }>;
    create(createCustomerDto: CreateCustomerDto, createdBy?: string): Promise<{
        message: string;
        data: CustomerResource;
    }>;
    update(uuid: string, updateCustomerDto: UpdateCustomerDto, updatedBy?: string): Promise<{
        message: string;
        data: CustomerResource;
    }>;
    remove(uuid: string, deletedBy?: string): Promise<{
        message: string;
        data: {};
    }>;
    addLoyaltyPoints(uuid: string, points: number, updatedBy?: string): Promise<{
        message: string;
        data: CustomerResource;
    }>;
}
