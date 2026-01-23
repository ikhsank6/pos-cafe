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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customers_service_1 = require("./customers.service");
const customer_dto_1 = require("./dto/customer.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async findAll(query) {
        return this.customersService.findAll(query.page, query.limit, query.search);
    }
    async findByPhone(phone) {
        return this.customersService.findByPhone(phone);
    }
    async findOne(uuid) {
        return this.customersService.findOne(uuid);
    }
    async create(createCustomerDto, req) {
        return this.customersService.create(createCustomerDto, req.user?.uuid);
    }
    async update(uuid, updateCustomerDto, req) {
        return this.customersService.update(uuid, updateCustomerDto, req.user?.uuid);
    }
    async remove(uuid, req) {
        return this.customersService.remove(uuid, req.user?.uuid);
    }
    async addLoyaltyPoints(uuid, body, req) {
        return this.customersService.addLoyaltyPoints(uuid, body.points, req.user?.uuid);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers with pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-phone/:phone'),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer by phone number' }),
    (0, swagger_1.ApiParam)({ name: 'phone', description: 'Customer phone number' }),
    __param(0, (0, common_1.Param)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findByPhone", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Customer UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new customer' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CreateCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Customer UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.UpdateCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete customer by UUID (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Customer UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':uuid/loyalty-points'),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Add/subtract loyalty points' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Customer UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "addLoyaltyPoints", null);
exports.CustomersController = CustomersController = __decorate([
    (0, swagger_1.ApiTags)('5. Customer Management : Customers'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('customer-management/customers'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map