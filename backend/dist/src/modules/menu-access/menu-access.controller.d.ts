import { MenuAccessService } from './menu-access.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';
export declare class MenuAccessController {
    private readonly menuAccessService;
    constructor(menuAccessService: MenuAccessService);
    getMyMenus(req: any): Promise<{
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
    findByRole(roleUuid: string): Promise<{
        message: string;
        data: import("./resources/menu-access.resource").MenuAccessResource[];
    }>;
    create(createMenuAccessDto: CreateMenuAccessDto): Promise<{
        message: string;
        data: import("./resources/menu-access.resource").MenuAccessResource;
    }>;
    bulkUpdate(bulkDto: BulkMenuAccessDto): Promise<{
        message: string;
        data: {};
    }>;
    update(uuid: string, updateMenuAccessDto: UpdateMenuAccessDto): Promise<{
        message: string;
        data: import("./resources/menu-access.resource").MenuAccessResource;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}
