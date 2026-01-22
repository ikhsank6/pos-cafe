import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';
import { MenuAccessResource } from './resources/menu-access.resource';
export declare class MenuAccessService {
    private prisma;
    constructor(prisma: PrismaService);
    findByRole(roleUuid: string): Promise<{
        message: string;
        data: MenuAccessResource[];
    }>;
    getAccessibleMenus(roleId: number): Promise<{
        message: string;
        data: ({
            children: {
                id: number;
                uuid: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                deletedBy: string | null;
                path: string | null;
                icon: string | null;
                parentId: number | null;
                order: number;
            }[];
        } & {
            id: number;
            uuid: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            deletedBy: string | null;
            path: string | null;
            icon: string | null;
            parentId: number | null;
            order: number;
        })[];
    }>;
    create(createMenuAccessDto: CreateMenuAccessDto): Promise<{
        message: string;
        data: MenuAccessResource;
    }>;
    update(uuid: string, updateMenuAccessDto: UpdateMenuAccessDto): Promise<{
        message: string;
        data: MenuAccessResource;
    }>;
    bulkUpdate(bulkDto: BulkMenuAccessDto): Promise<{
        message: string;
        data: {};
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}
