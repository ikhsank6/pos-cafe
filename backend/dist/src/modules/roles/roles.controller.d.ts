import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(query: PaginationQueryDto): Promise<{
        message: string;
        data: {
            items: import("./resources/role.resource").RoleResource[];
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
        data: import("./resources/role.resource").RoleResource;
    }>;
    create(createRoleDto: CreateRoleDto): Promise<{
        message: string;
        data: import("./resources/role.resource").RoleResource;
    }>;
    update(uuid: string, updateRoleDto: UpdateRoleDto): Promise<{
        message: string;
        data: import("./resources/role.resource").RoleResource;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}
