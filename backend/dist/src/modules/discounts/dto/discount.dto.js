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
exports.UpdateDiscountDto = exports.CreateDiscountDto = exports.DiscountType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FIXED_AMOUNT"] = "FIXED_AMOUNT";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
class CreateDiscountDto {
    code;
    name;
    description;
    type;
    value;
    minPurchase;
    maxDiscount;
    startDate;
    endDate;
    isActive;
    usageLimit;
}
exports.CreateDiscountDto = CreateDiscountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PROMO10', description: 'Discount code' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'kode diskon harus diisi.' }),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Promo Awal Tahun', description: 'Discount name' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'nama diskon harus diisi.' }),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Diskon 10% untuk semua menu', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PERCENTAGE', enum: DiscountType }),
    (0, class_validator_1.IsNotEmpty)({ message: 'tipe diskon harus diisi.' }),
    (0, class_validator_1.IsEnum)(DiscountType, { message: 'type harus salah satu dari: PERCENTAGE, FIXED_AMOUNT.' }),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Discount value (percentage or fixed amount)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'nilai diskon harus diisi.' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'value harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'value tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateDiscountDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000, required: false, description: 'Minimum purchase amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'minPurchase harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'minPurchase tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateDiscountDto.prototype, "minPurchase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25000, required: false, description: 'Maximum discount amount (for percentage type)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'maxDiscount harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'maxDiscount tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateDiscountDto.prototype, "maxDiscount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01', description: 'Start date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'tanggal mulai harus diisi.' }),
    (0, class_validator_1.IsDateString)({}, { message: 'format tanggal mulai tidak valid.' }),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-31', description: 'End date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'tanggal selesai harus diisi.' }),
    (0, class_validator_1.IsDateString)({}, { message: 'format tanggal selesai tidak valid.' }),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive harus boolean.' }),
    __metadata("design:type", Boolean)
], CreateDiscountDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, required: false, description: 'Maximum usage limit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'usageLimit harus berupa angka.' }),
    (0, class_validator_1.Min)(1, { message: 'usageLimit minimal 1.' }),
    __metadata("design:type", Number)
], CreateDiscountDto.prototype, "usageLimit", void 0);
class UpdateDiscountDto {
    code;
    name;
    description;
    type;
    value;
    minPurchase;
    maxDiscount;
    startDate;
    endDate;
    isActive;
    usageLimit;
}
exports.UpdateDiscountDto = UpdateDiscountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'kode diskon harus diisi.' }),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'nama diskon harus diisi.' }),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: DiscountType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DiscountType, { message: 'type harus salah satu dari: PERCENTAGE, FIXED_AMOUNT.' }),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'value harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'value tidak boleh negatif.' }),
    __metadata("design:type", Number)
], UpdateDiscountDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'minPurchase harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'minPurchase tidak boleh negatif.' }),
    __metadata("design:type", Number)
], UpdateDiscountDto.prototype, "minPurchase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'maxDiscount harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'maxDiscount tidak boleh negatif.' }),
    __metadata("design:type", Number)
], UpdateDiscountDto.prototype, "maxDiscount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'format tanggal mulai tidak valid.' }),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'format tanggal selesai tidak valid.' }),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive harus boolean.' }),
    __metadata("design:type", Boolean)
], UpdateDiscountDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'usageLimit harus berupa angka.' }),
    (0, class_validator_1.Min)(1, { message: 'usageLimit minimal 1.' }),
    __metadata("design:type", Number)
], UpdateDiscountDto.prototype, "usageLimit", void 0);
//# sourceMappingURL=discount.dto.js.map