import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: PaginationQueryDto): Promise<{
        message: string;
        data: {
            items: import("./resources/user.resource").UserResource[];
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
        data: import("./resources/user.resource").UserResource;
    }>;
    create(createUserDto: CreateUserDto, req: any): Promise<{
        message: string;
        data: import("./resources/user.resource").UserResource;
    }>;
    update(uuid: string, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        data: import("./resources/user.resource").UserResource;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
    resendVerification(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}
