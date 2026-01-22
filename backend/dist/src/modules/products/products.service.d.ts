import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductResource } from './resources/product.resource';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string, categoryUuid?: string, type?: string, isActive?: boolean): Promise<{
        message: string;
        data: {
            items: ProductResource[];
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
        data: ProductResource;
    }>;
    create(createProductDto: CreateProductDto, createdBy?: string): Promise<{
        message: string;
        data: ProductResource;
    }>;
    update(uuid: string, updateProductDto: UpdateProductDto, updatedBy?: string): Promise<{
        message: string;
        data: ProductResource;
    }>;
    remove(uuid: string, deletedBy?: string): Promise<{
        message: string;
        data: {};
    }>;
    updateStock(uuid: string, quantity: number, updatedBy?: string): Promise<{
        message: string;
        data: ProductResource;
    }>;
}
