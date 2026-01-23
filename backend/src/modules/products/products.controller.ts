import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductType } from './dto/product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('3. Product Management : Products')
@ApiBearerAuth('JWT-auth')
@Controller('product-management/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Get all products with pagination' })
    @ApiQuery({ name: 'categoryUuid', required: false, description: 'Filter by category UUID' })
    @ApiQuery({ name: 'type', required: false, enum: ProductType, description: 'Filter by product type' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Query('categoryUuid') categoryUuid?: string,
        @Query('type') type?: string,
        @Query('isActive') isActive?: string,
    ) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.productsService.findAll(
            query.page,
            query.limit,
            query.search,
            categoryUuid,
            type,
            isActiveBoolean,
        );
    }

    @Get(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Get product by UUID' })
    @ApiParam({ name: 'uuid', description: 'Product UUID' })
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.productsService.findOne(uuid);
    }

    @Post()
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Create new product' })
    async create(@Body() createProductDto: CreateProductDto, @Request() req) {
        return this.productsService.create(createProductDto, req.user?.uuid);
    }

    @Put(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Update product by UUID' })
    @ApiParam({ name: 'uuid', description: 'Product UUID' })
    async update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateProductDto: UpdateProductDto,
        @Request() req,
    ) {
        return this.productsService.update(uuid, updateProductDto, req.user?.uuid);
    }

    @Delete(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Delete product by UUID (soft delete)' })
    @ApiParam({ name: 'uuid', description: 'Product UUID' })
    async remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
        return this.productsService.remove(uuid, req.user?.uuid);
    }

    @Post(':uuid/stock')
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER')
    @ApiOperation({ summary: 'Update product stock (add/subtract)' })
    @ApiParam({ name: 'uuid', description: 'Product UUID' })
    async updateStock(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: { quantity: number },
        @Request() req,
    ) {
        return this.productsService.updateStock(uuid, body.quantity, req.user?.uuid);
    }
}
