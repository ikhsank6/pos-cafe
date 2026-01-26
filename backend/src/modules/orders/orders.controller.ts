import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderItemStatusDto, AddOrderItemsDto, OrderType, OrderStatus } from './dto/order.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('7. Order Management : Orders')
@ApiBearerAuth('JWT-auth')
@Controller('order-management/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Get all orders with pagination' })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    @ApiQuery({ name: 'orderType', required: false, enum: OrderType })
    @ApiQuery({ name: 'tableUuid', required: false, description: 'Filter by table UUID' })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Query('status') status?: string,
        @Query('orderType') orderType?: string,
        @Query('tableUuid') tableUuid?: string,
    ) {
        return this.ordersService.findAll(
            query.page,
            query.limit,
            query.search,
            status,
            orderType,
            tableUuid,
        );
    }

    @Get('kitchen')
    @Roles('Admin', 'OWNER', 'MANAGER', 'KITCHEN')
    @ApiOperation({ summary: 'Get active orders for kitchen display' })
    async getKitchenOrders() {
        return this.ordersService.getKitchenOrders();
    }

    @Get(':uuid')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Get order by UUID' })
    @ApiParam({ name: 'uuid', description: 'Order UUID' })
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.ordersService.findOne(uuid);
    }

    @Post()
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Create new order' })
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        return this.ordersService.create(createOrderDto, req.user?.uuid);
    }

    @Patch(':uuid/status')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN')
    @ApiOperation({ summary: 'Update order status' })
    @ApiParam({ name: 'uuid', description: 'Order UUID' })
    async updateStatus(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
        @Request() req,
    ) {
        return this.ordersService.updateStatus(uuid, updateStatusDto, req.user?.uuid);
    }

    @Patch(':uuid/cancel')
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Cancel order' })
    @ApiParam({ name: 'uuid', description: 'Order UUID' })
    async cancel(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body('reason') reason: string,
        @Request() req,
    ) {
        // Reuse updateStatus with CANCELLED status
        return this.ordersService.updateStatus(uuid, { status: OrderStatus.CANCELLED }, req.user?.uuid);
    }

    @Patch(':uuid/items/:itemUuid/status')
    @Roles('Admin', 'OWNER', 'MANAGER', 'KITCHEN')
    @ApiOperation({ summary: 'Update order item status' })
    @ApiParam({ name: 'uuid', description: 'Order UUID' })
    @ApiParam({ name: 'itemUuid', description: 'Order Item UUID' })
    async updateItemStatus(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Param('itemUuid', ParseUUIDPipe) itemUuid: string,
        @Body() updateStatusDto: UpdateOrderItemStatusDto,
        @Request() req,
    ) {
        return this.ordersService.updateItemStatus(uuid, itemUuid, updateStatusDto, req.user?.uuid);
    }

    @Post(':uuid/items')
    @HttpCode(200)
    @Roles('Admin', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER')
    @ApiOperation({ summary: 'Add items to existing order' })
    @ApiParam({ name: 'uuid', description: 'Order UUID' })
    async addItems(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() addItemsDto: AddOrderItemsDto,
        @Request() req,
    ) {
        return this.ordersService.addItems(uuid, addItemsDto, req.user?.uuid);
    }
}
