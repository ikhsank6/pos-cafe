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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOrderItemsDto = exports.UpdateOrderItemStatusDto = exports.UpdateOrderStatusDto = exports.CreateOrderDto = exports.OrderItemDto = exports.OrderItemStatus = exports.OrderStatus = exports.OrderType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var OrderType;
(function (OrderType) {
    OrderType["DINE_IN"] = "DINE_IN";
    OrderType["TAKEAWAY"] = "TAKEAWAY";
    OrderType["DELIVERY"] = "DELIVERY";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["SERVED"] = "SERVED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderItemStatus;
(function (OrderItemStatus) {
    OrderItemStatus["PENDING"] = "PENDING";
    OrderItemStatus["PREPARING"] = "PREPARING";
    OrderItemStatus["READY"] = "READY";
    OrderItemStatus["SERVED"] = "SERVED";
    OrderItemStatus["CANCELLED"] = "CANCELLED";
})(OrderItemStatus || (exports.OrderItemStatus = OrderItemStatus = {}));
class OrderItemDto {
    productUuid;
    quantity;
    notes;
}
exports.OrderItemDto = OrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-product', description: 'Product UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'productUuid harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'productUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], OrderItemDto.prototype, "productUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'Quantity' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'quantity harus diisi.' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'quantity harus berupa angka.' }),
    (0, class_validator_1.Min)(1, { message: 'quantity minimal 1.' }),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tidak pakai sambal', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "notes", void 0);
class CreateOrderDto {
    orderType;
    tableUuid;
    customerUuid;
    items;
    notes;
    discountCode;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DINE_IN', enum: OrderType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OrderType, { message: 'orderType harus salah satu dari: DINE_IN, TAKEAWAY, DELIVERY.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "orderType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-table', required: false, description: 'Table UUID (for DINE_IN)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'tableUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "tableUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-customer', required: false, description: 'Customer UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'customerUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderItemDto], description: 'Order items' }),
    (0, class_validator_1.IsArray)({ message: 'items harus berupa array.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Catatan khusus...', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PROMO10', required: false, description: 'Discount code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "discountCode", void 0);
class UpdateOrderStatusDto {
    status;
}
exports.UpdateOrderStatusDto = UpdateOrderStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CONFIRMED', enum: OrderStatus }),
    (0, class_validator_1.IsNotEmpty)({ message: 'status harus diisi.' }),
    (0, class_validator_1.IsEnum)(OrderStatus, { message: 'status harus salah satu dari: PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED.' }),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "status", void 0);
class UpdateOrderItemStatusDto {
    status;
}
exports.UpdateOrderItemStatusDto = UpdateOrderItemStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PREPARING', enum: OrderItemStatus }),
    (0, class_validator_1.IsNotEmpty)({ message: 'status harus diisi.' }),
    (0, class_validator_1.IsEnum)(OrderItemStatus, { message: 'status harus salah satu dari: PENDING, PREPARING, READY, SERVED, CANCELLED.' }),
    __metadata("design:type", String)
], UpdateOrderItemStatusDto.prototype, "status", void 0);
class AddOrderItemsDto {
    items;
}
exports.AddOrderItemsDto = AddOrderItemsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderItemDto], description: 'New order items to add' }),
    (0, class_validator_1.IsArray)({ message: 'items harus berupa array.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    __metadata("design:type", Array)
], AddOrderItemsDto.prototype, "items", void 0);
//# sourceMappingURL=order.dto.js.map