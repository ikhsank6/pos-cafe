import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { QueueService } from '../queue/queue.service';
import { UserResource } from './resources/user.resource';
export declare class UsersService {
    private prisma;
    private queueService;
    constructor(prisma: PrismaService, queueService: QueueService);
    findAll(page?: number, limit?: number, search?: string, isActive?: boolean): Promise<{
        message: string;
        data: {
            items: UserResource[];
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
        data: UserResource;
    }>;
    findById(id: number): Promise<{
        message: string;
        data: UserResource;
    }>;
    create(createUserDto: CreateUserDto, currentUserId?: number): Promise<{
        message: string;
        data: UserResource;
    }>;
    update(uuid: string, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        data: UserResource;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
    resendVerificationEmail(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}
