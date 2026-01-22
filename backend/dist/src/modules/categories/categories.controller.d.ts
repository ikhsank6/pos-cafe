import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(query: PaginationQueryDto, isActive?: string): Promise<{
        message: string;
        data: {
            items: import("./resources/category.resource").CategoryResource[];
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
        data: import("./resources/category.resource").CategoryResource;
    }>;
    create(createCategoryDto: CreateCategoryDto, req: any): Promise<{
        message: string;
        data: import("./resources/category.resource").CategoryResource;
    }>;
    update(uuid: string, updateCategoryDto: UpdateCategoryDto, req: any): Promise<{
        message: string;
        data: import("./resources/category.resource").CategoryResource;
    }>;
    remove(uuid: string, req: any): Promise<{
        message: string;
        data: {};
    }>;
}
