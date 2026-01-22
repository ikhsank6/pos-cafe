"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("./orders.service");
const order_dto_1 = require("./dto/order.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async findAll(query, status, orderType, tableUuid) {
        return this.ordersService.findAll(query.page, query.limit, query.search, status, orderType, tableUuid);
    }
    async getKitchenOrders() {
        return this.ordersService.getKitchenOrders();
    }
    async findOne(uuid) {
        return this.ordersService.findOne(uuid);
    }
    async create(createOrderDto, req) {
        return this.ordersService.create(createOrderDto, req.user?.uuid);
    }
    async updateStatus(uuid, updateStatusDto, req) {
        return this.ordersService.updateStatus(uuid, updateStatusDto, req.user?.uuid);
    }
    async updateItemStatus(uuid, itemUuid, updateStatusDto, req) {
        return this.ordersService.updateItemStatus(uuid, itemUuid, updateStatusDto, req.user?.uuid);
    }
    async addItems(uuid, addItemsDto, req) {
        return this.ordersService.addItems(uuid, addItemsDto, req.user?.uuid);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier', 'Waiter'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: order_dto_1.OrderStatus }),
    (0, swagger_1.ApiQuery)({ name: 'orderType', required: false, enum: order_dto_1.OrderType }),
    (0, swagger_1.ApiQuery)({ name: 'tableUuid', required: false, description: 'Filter by table UUID' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('orderType')),
    __param(3, (0, common_1.Query)('tableUuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('kitchen'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Kitchen'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active orders for kitchen display' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getKitchenOrders", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier', 'Waiter'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Order UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier', 'Waiter'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':uuid/status'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier', 'Waiter', 'Kitchen'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Order UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':uuid/items/:itemUuid/status'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Kitchen'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order item status' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Order UUID' }),
    (0, swagger_1.ApiParam)({ name: 'itemUuid', description: 'Order Item UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('itemUuid', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, order_dto_1.UpdateOrderItemStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateItemStatus", null);
__decorate([
    (0, common_1.Post)(':uuid/items'),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier', 'Waiter'),
    (0, swagger_1.ApiOperation)({ summary: 'Add items to existing order' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Order UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.AddOrderItemsDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "addItems", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('7. Order Management : Orders'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('order-management/orders'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map