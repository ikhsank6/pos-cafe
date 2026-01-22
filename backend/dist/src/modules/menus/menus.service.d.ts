import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto, ReorderMenusDto } from './dto/menu.dto';
import { MenuResource } from './resources/menu.resource';
export declare class MenusService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: string): Promise<{
        message: string;
        data: MenuResource[];
    }>;
    getTree(): Promise<{
        message: string;
        data: MenuResource[];
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: MenuResource;
    }>;
    create(createMenuDto: CreateMenuDto): Promise<{
        message: string;
        data: MenuResource;
    }>;
    update(uuid: string, updateMenuDto: UpdateMenuDto): Promise<{
        message: string;
        data: MenuResource;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
    reorder(reorderMenusDto: ReorderMenusDto): Promise<{
        message: string;
        data: MenuResource[];
    }>;
}
