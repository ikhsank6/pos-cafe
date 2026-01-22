import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RoleResource } from './resources/role.resource';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string, isActive?: boolean): Promise<{
        message: string;
        data: {
            items: RoleResource[];
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
        data: RoleResource;
    }>;
    create(createRoleDto: CreateRoleDto): Promise<{
        message: string;
        data: RoleResource;
    }>;
    update(uuid: string, updateRoleDto: UpdateRoleDto): Promise<{
        message: string;
        data: RoleResource;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}
