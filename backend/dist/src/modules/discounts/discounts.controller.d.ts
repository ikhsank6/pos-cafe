import { DiscountsService } from './discounts.service';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class DiscountsController {
    private readonly discountsService;
    constructor(discountsService: DiscountsService);
    findAll(query: PaginationQueryDto, isActive?: string): Promise<{
        message: string;
        data: {
            items: import("./resources/discount.resource").DiscountResource[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    validateDiscount(code: string, amount: string): Promise<{
        message: string;
        data: {
            discount: import("./resources/discount.resource").DiscountResource;
            discountAmount: number;
            finalAmount: number;
        };
    }>;
    findByCode(code: string): Promise<{
        message: string;
        data: import("./resources/discount.resource").DiscountResource;
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: import("./resources/discount.resource").DiscountResource;
    }>;
    create(createDiscountDto: CreateDiscountDto, req: any): Promise<{
        message: string;
        data: import("./resources/discount.resource").DiscountResource;
    }>;
    update(uuid: string, updateDiscountDto: UpdateDiscountDto, req: any): Promise<{
        message: string;
        data: import("./resources/discount.resource").DiscountResource;
    }>;
    remove(uuid: string, req: any): Promise<{
        message: string;
        data: {};
    }>;
}
