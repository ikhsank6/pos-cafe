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
exports.UpdateProductDto = exports.CreateProductDto = exports.ProductType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var ProductType;
(function (ProductType) {
    ProductType["FOOD"] = "FOOD";
    ProductType["BEVERAGE"] = "BEVERAGE";
    ProductType["SNACK"] = "SNACK";
    ProductType["OTHER"] = "OTHER";
})(ProductType || (exports.ProductType = ProductType = {}));
class CreateProductDto {
    sku;
    name;
    description;
    categoryUuid;
    price;
    cost;
    stock;
    minStock;
    unit;
    mediaUuid;
    type;
    isActive;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SKU-001', description: 'Unique product SKU', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nasi Goreng Spesial', description: 'Product name' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'nama produk harus diisi.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nasi goreng dengan telur dan ayam', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-category', description: 'Category UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'kategori harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'categoryUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25000, description: 'Selling price' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'harga harus diisi.' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'harga harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'harga tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000, required: false, description: 'Cost/HPP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'cost harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'cost tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, required: false, description: 'Initial stock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'stock harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'stock tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "stock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, required: false, description: 'Minimum stock alert' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'minStock harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'minStock tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "minStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pcs', required: false, description: 'Unit of measurement' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-media', required: false, description: 'Media UUID for product image' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'mediaUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "mediaUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'FOOD', enum: ProductType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProductType, { message: 'type harus salah satu dari: FOOD, BEVERAGE, SNACK, OTHER.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive harus boolean.' }),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isActive", void 0);
class UpdateProductDto {
    sku;
    name;
    description;
    categoryUuid;
    price;
    cost;
    stock;
    minStock;
    unit;
    mediaUuid;
    type;
    isActive;
}
exports.UpdateProductDto = UpdateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'SKU harus diisi.' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'nama produk harus diisi.' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'categoryUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "categoryUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'harga harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'harga tidak boleh negatif.' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'cost harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'cost tidak boleh negatif.' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'stock harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'stock tidak boleh negatif.' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "stock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'minStock harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'minStock tidak boleh negatif.' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "minStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'mediaUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "mediaUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProductType, { message: 'type harus salah satu dari: FOOD, BEVERAGE, SNACK, OTHER.' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive harus boolean.' }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isActive", void 0);
//# sourceMappingURL=product.dto.js.map