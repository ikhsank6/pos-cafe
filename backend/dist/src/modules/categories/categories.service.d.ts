import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryResource } from './resources/category.resource';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string, isActive?: boolean): Promise<{
        message: string;
        data: {
            items: CategoryResource[];
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
        data: CategoryResource;
    }>;
    create(createCategoryDto: CreateCategoryDto, createdBy?: string): Promise<{
        message: string;
        data: CategoryResource;
    }>;
    update(uuid: string, updateCategoryDto: UpdateCategoryDto, updatedBy?: string): Promise<{
        message: string;
        data: CategoryResource;
    }>;
    remove(uuid: string, deletedBy?: string): Promise<{
        message: string;
        data: {};
    }>;
}
