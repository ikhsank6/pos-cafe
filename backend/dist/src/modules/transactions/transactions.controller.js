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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transactions_service_1 = require("./transactions.service");
const transaction_dto_1 = require("./dto/transaction.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async findAll(query, status, paymentMethod, startDate, endDate) {
        return this.transactionsService.findAll(query.page, query.limit, query.search, status, paymentMethod, startDate, endDate);
    }
    async getDailySalesReport(date) {
        return this.transactionsService.getDailySalesReport(date);
    }
    async findOne(uuid) {
        return this.transactionsService.findOne(uuid);
    }
    async create(createTransactionDto, req) {
        return this.transactionsService.create(createTransactionDto, req.user?.uuid);
    }
    async refund(uuid, refundDto, req) {
        return this.transactionsService.refund(uuid, refundDto, req.user?.uuid);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: transaction_dto_1.TransactionStatus }),
    (0, swagger_1.ApiQuery)({ name: 'paymentMethod', required: false, enum: transaction_dto_1.PaymentMethod }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Filter from date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Filter to date (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('paymentMethod')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('daily-report'),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily sales report' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Date for report (YYYY-MM-DD), defaults to today' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getDailySalesReport", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by UUID' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Transaction UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment for order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_dto_1.CreateTransactionDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':uuid/refund'),
    (0, common_1.HttpCode)(200),
    (0, roles_decorator_1.Roles)('Admin', 'OWNER', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund transaction' }),
    (0, swagger_1.ApiParam)({ name: 'uuid', description: 'Transaction UUID' }),
    __param(0, (0, common_1.Param)('uuid', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.RefundTransactionDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "refund", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('8. Transaction Management : Transactions'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('transaction-management/transactions'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map