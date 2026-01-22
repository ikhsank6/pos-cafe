import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: PaginationQueryDto, categoryUuid?: string, type?: string, isActive?: string): Promise<{
        message: string;
        data: {
            items: import("./resources/product.resource").ProductResource[];
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
        data: import("./resources/product.resource").ProductResource;
    }>;
    create(createProductDto: CreateProductDto, req: any): Promise<{
        message: string;
        data: import("./resources/product.resource").ProductResource;
    }>;
    update(uuid: string, updateProductDto: UpdateProductDto, req: any): Promise<{
        message: string;
        data: import("./resources/product.resource").ProductResource;
    }>;
    remove(uuid: string, req: any): Promise<{
        message: string;
        data: {};
    }>;
    updateStock(uuid: string, body: {
        quantity: number;
    }, req: any): Promise<{
        message: string;
        data: import("./resources/product.resource").ProductResource;
    }>;
}
