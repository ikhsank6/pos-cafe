import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('6. Discount Management : Discounts')
@ApiBearerAuth('JWT-auth')
@Controller('discount-management/discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscountsController {
    constructor(private readonly discountsService: DiscountsService) { }

    @Get()
    @Roles('Admin', 'Owner', 'Manager')
    @ApiOperation({ summary: 'Get all discounts with pagination' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Query('isActive') isActive?: string,
    ) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.discountsService.findAll(query.page, query.limit, query.search, isActiveBoolean);
    }

    @Get('validate/:code')
    @Roles('Admin', 'Owner', 'Manager', 'Cashier')
    @ApiOperation({ summary: 'Validate discount code for an order' })
    @ApiParam({ name: 'code', description: 'Discount code' })
    @ApiQuery({ name: 'amount', required: true, type: Number, description: 'Order amount' })
    async validateDiscount(
        @Param('code') code: string,
        @Query('amount') amount: string,
    ) {
        return this.discountsService.validateDiscount(code, Number(amount));
    }

    @Get('by-code/:code')
    @Roles('Admin', 'Owner', 'Manager', 'Cashier')
    @ApiOperation({ summary: 'Get discount by code' })
    @ApiParam({ name: 'code', description: 'Discount code' })
    async findByCode(@Param('code') code: string) {
        return this.discountsService.findByCode(code);
    }

    @Get(':uuid')
    @Roles('Admin', 'Owner', 'Manager')
    @ApiOperation({ summary: 'Get discount by UUID' })
    @ApiParam({ name: 'uuid', description: 'Discount UUID' })
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.discountsService.findOne(uuid);
    }

    @Post()
    @HttpCode(200)
    @Roles('Admin', 'Owner', 'Manager')
    @ApiOperation({ summary: 'Create new discount' })
    async create(@Body() createDiscountDto: CreateDiscountDto, @Request() req) {
        return this.discountsService.create(createDiscountDto, req.user?.uuid);
    }

    @Put(':uuid')
    @Roles('Admin', 'Owner', 'Manager')
    @ApiOperation({ summary: 'Update discount by UUID' })
    @ApiParam({ name: 'uuid', description: 'Discount UUID' })
    async update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateDiscountDto: UpdateDiscountDto,
        @Request() req,
    ) {
        return this.discountsService.update(uuid, updateDiscountDto, req.user?.uuid);
    }

    @Delete(':uuid')
    @Roles('Admin', 'Owner', 'Manager')
    @ApiOperation({ summary: 'Delete discount by UUID (soft delete)' })
    @ApiParam({ name: 'uuid', description: 'Discount UUID' })
    async remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
        return this.discountsService.remove(uuid, req.user?.uuid);
    }
}
