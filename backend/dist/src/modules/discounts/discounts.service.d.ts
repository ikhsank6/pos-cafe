import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { DiscountResource } from './resources/discount.resource';
export declare class DiscountsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string, isActive?: boolean): Promise<{
        message: string;
        data: {
            items: DiscountResource[];
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
        data: DiscountResource;
    }>;
    findByCode(code: string): Promise<{
        message: string;
        data: DiscountResource;
    }>;
    validateDiscount(code: string, orderAmount: number): Promise<{
        message: string;
        data: {
            discount: DiscountResource;
            discountAmount: number;
            finalAmount: number;
        };
    }>;
    create(createDiscountDto: CreateDiscountDto, createdBy?: string): Promise<{
        message: string;
        data: DiscountResource;
    }>;
    update(uuid: string, updateDiscountDto: UpdateDiscountDto, updatedBy?: string): Promise<{
        message: string;
        data: DiscountResource;
    }>;
    remove(uuid: string, deletedBy?: string): Promise<{
        message: string;
        data: {};
    }>;
}
