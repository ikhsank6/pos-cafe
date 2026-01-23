import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('5. Customer Management : Customers')
@ApiBearerAuth('JWT-auth')
@Controller('customer-management/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Get all customers with pagination' })
    async findAll(@Query() query: PaginationQueryDto) {
        return this.customersService.findAll(query.page, query.limit, query.search);
    }

    @Get('by-phone/:phone')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Get customer by phone number' })
    @ApiParam({ name: 'phone', description: 'Customer phone number' })
    async findByPhone(@Param('phone') phone: string) {
        return this.customersService.findByPhone(phone);
    }

    @Get(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Get customer by UUID' })
    @ApiParam({ name: 'uuid', description: 'Customer UUID' })
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.customersService.findOne(uuid);
    }

    @Post()
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Create new customer' })
    async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
        return this.customersService.create(createCustomerDto, req.user?.uuid);
    }

    @Put(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Update customer by UUID' })
    @ApiParam({ name: 'uuid', description: 'Customer UUID' })
    async update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
        @Request() req,
    ) {
        return this.customersService.update(uuid, updateCustomerDto, req.user?.uuid);
    }

    @Delete(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Delete customer by UUID (soft delete)' })
    @ApiParam({ name: 'uuid', description: 'Customer UUID' })
    async remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
        return this.customersService.remove(uuid, req.user?.uuid);
    }

    @Post(':uuid/loyalty-points')
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Add/subtract loyalty points' })
    @ApiParam({ name: 'uuid', description: 'Customer UUID' })
    async addLoyaltyPoints(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: { points: number },
        @Request() req,
    ) {
        return this.customersService.addLoyaltyPoints(uuid, body.points, req.user?.uuid);
    }
}
