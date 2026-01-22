import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto, ReorderMenusDto } from './dto/menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    getTree(): Promise<{
        message: string;
        data: import("./resources/menu.resource").MenuResource[];
    }>;
    findAll(search?: string): Promise<{
        message: string;
        data: import("./resources/menu.resource").MenuResource[];
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: import("./resources/menu.resource").MenuResource;
    }>;
    create(createMenuDto: CreateMenuDto): Promise<{
        message: string;
        data: import("./resources/menu.resource").MenuResource;
    }>;
    reorder(reorderMenusDto: ReorderMenusDto): Promise<{
        message: string;
        data: import("./resources/menu.resource").MenuResource[];
    }>;
    update(uuid: string, updateMenuDto: UpdateMenuDto): Promise<{
        message: string;
        data: import("./resources/menu.resource").MenuResource;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}
