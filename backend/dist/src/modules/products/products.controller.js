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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("./products.service");
const product_dto_1 = require("./dto/product.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(query, categoryUuid, type, isActive) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.productsService.findAll(query.page, query.limit, query.search, categoryUuid, type, isActiveBoolean);
    }
    async findOne(uuid) {
        return this.productsService.findOne(uuid);
    }
    async create(createProductDto, req) {
        return this.productsService.create(createProductDto, req.user?.uuid);
    }
    async update(uuid, updateProductDto, req) {
        return this.productsService.update(uuid, updateProductDto, req.user?.uuid);
    }
    async remove(uuid, req) {
        return this.productsService.remove(uuid, req.user?.uuid);
    }
    async updateStock(uuid, body, req) {
        return this.productsService.updateStock(uuid, body.quantity, req.user?.uuid);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryUuid', required: false, description: 'Filter by category UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: product_dto_1.ProductType, description: 'Filter by product type' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('categoryUuid')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager', 'Cashier'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Product UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new product' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Product UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product by UUID (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Product UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':uuid/stock'),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'Owner', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product stock (add/subtract)' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Product UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateStock", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('3. Product Management : Products'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('product-management/products'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map