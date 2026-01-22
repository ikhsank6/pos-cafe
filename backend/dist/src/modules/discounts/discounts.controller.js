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
exports.DiscountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const discounts_service_1 = require("./discounts.service");
const discount_dto_1 = require("./dto/discount.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let DiscountsController = class DiscountsController {
    discountsService;
    constructor(discountsService) {
        this.discountsService = discountsService;
    }
    async findAll(query, isActive) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.discountsService.findAll(query.page, query.limit, query.search, isActiveBoolean);
    }
    async validateDiscount(code, amount) {
        return this.discountsService.validateDiscount(code, Number(amount));
    }
    async findByCode(code) {
        return this.discountsService.findByCode(code);
    }
    async findOne(uuid) {
        return this.discountsService.findOne(uuid);
    }
    async create(createDiscountDto, req) {
        return this.discountsService.create(createDiscountDto, req.user?.uuid);
    }
    async update(uuid, updateDiscountDto, req) {
        return this.discountsService.update(uuid, updateDiscountDto, req.user?.uuid);
    }
    async remove(uuid, req) {
        return this.discountsService.remove(uuid, req.user?.uuid);
    }
};
exports.DiscountsController = DiscountsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all discounts with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, String]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('validate/:code'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate discount code for an order' }),
    (0, swagger_1.ApiParam)({ name: 'code', description: 'Discount code' }),
    (0, swagger_1.ApiQuery)({ name: 'amount', required: true, type: Number, description: 'Order amount' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "validateDiscount", null);
__decorate([
    (0, common_1.Get)('by-code/:code'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier'),
    (0, swagger_1.ApiOperation)({ summary: 'Get discount by code' }),
    (0, swagger_1.ApiParam)({ name: 'code', description: 'Discount code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Get discount by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Discount UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new discount' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discount_dto_1.CreateDiscountDto, Object]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update discount by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Discount UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, discount_dto_1.UpdateDiscountDto, Object]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete discount by UUID (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Discount UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "remove", null);
exports.DiscountsController = DiscountsController = __decorate([
    (0, swagger_1.ApiTags)('6. Discount Management : Discounts'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('discount-management/discounts'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [discounts_service_1.DiscountsService])
], DiscountsController);
//# sourceMappingURL=discounts.controller.js.map