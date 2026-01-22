import { PrismaService } from '../../prisma/prisma.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import { TableResource } from './resources/table.resource';
import { TableStatus } from '@prisma/client';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string, status?: string, location?: string): Promise<{
        message: string;
        data: {
            items: TableResource[];
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
        data: TableResource;
    }>;
    create(createTableDto: CreateTableDto, createdBy?: string): Promise<{
        message: string;
        data: TableResource;
    }>;
    update(uuid: string, updateTableDto: UpdateTableDto, updatedBy?: string): Promise<{
        message: string;
        data: TableResource;
    }>;
    remove(uuid: string, deletedBy?: string): Promise<{
        message: string;
        data: {};
    }>;
    updateStatus(uuid: string, status: TableStatus, updatedBy?: string): Promise<{
        message: string;
        data: TableResource;
    }>;
}
