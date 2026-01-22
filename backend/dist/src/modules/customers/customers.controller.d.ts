import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(query: PaginationQueryDto): Promise<{
        message: string;
        data: {
            items: import("./resources/customer.resource").CustomerResource[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findByPhone(phone: string): Promise<{
        message: string;
        data: import("./resources/customer.resource").CustomerResource;
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: import("./resources/customer.resource").CustomerResource;
    }>;
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<{
        message: string;
        data: import("./resources/customer.resource").CustomerResource;
    }>;
    update(uuid: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<{
        message: string;
        data: import("./resources/customer.resource").CustomerResource;
    }>;
    remove(uuid: string, req: any): Promise<{
        message: string;
        data: {};
    }>;
    addLoyaltyPoints(uuid: string, body: {
        points: number;
    }, req: any): Promise<{
        message: string;
        data: import("./resources/customer.resource").CustomerResource;
    }>;
}
