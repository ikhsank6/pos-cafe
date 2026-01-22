import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, TableStatus } from './dto/table.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(query: PaginationQueryDto, status?: string, location?: string): Promise<{
        message: string;
        data: {
            items: import("./resources/table.resource").TableResource[];
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
        data: import("./resources/table.resource").TableResource;
    }>;
    create(createTableDto: CreateTableDto, req: any): Promise<{
        message: string;
        data: import("./resources/table.resource").TableResource;
    }>;
    update(uuid: string, updateTableDto: UpdateTableDto, req: any): Promise<{
        message: string;
        data: import("./resources/table.resource").TableResource;
    }>;
    remove(uuid: string, req: any): Promise<{
        message: string;
        data: {};
    }>;
    updateStatus(uuid: string, body: {
        status: TableStatus;
    }, req: any): Promise<{
        message: string;
        data: import("./resources/table.resource").TableResource;
    }>;
}
