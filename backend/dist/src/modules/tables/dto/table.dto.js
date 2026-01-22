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
exports.UpdateTableDto = exports.CreateTableDto = exports.TableStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var TableStatus;
(function (TableStatus) {
    TableStatus["AVAILABLE"] = "AVAILABLE";
    TableStatus["OCCUPIED"] = "OCCUPIED";
    TableStatus["RESERVED"] = "RESERVED";
    TableStatus["MAINTENANCE"] = "MAINTENANCE";
})(TableStatus || (exports.TableStatus = TableStatus = {}));
class CreateTableDto {
    number;
    capacity;
    location;
    status;
}
exports.CreateTableDto = CreateTableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'T01', description: 'Table number' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'nomor meja harus diisi.' }),
    __metadata("design:type", String)
], CreateTableDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4, description: 'Table capacity' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'kapasitas harus diisi.' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'kapasitas harus berupa angka.' }),
    (0, class_validator_1.Min)(1, { message: 'kapasitas minimal 1.' }),
    __metadata("design:type", Number)
], CreateTableDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Indoor', required: false, description: 'Table location (Indoor, Outdoor, VIP)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTableDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AVAILABLE', enum: TableStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TableStatus, { message: 'status harus salah satu dari: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE.' }),
    __metadata("design:type", String)
], CreateTableDto.prototype, "status", void 0);
class UpdateTableDto {
    number;
    capacity;
    location;
    status;
}
exports.UpdateTableDto = UpdateTableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'nomor meja harus diisi.' }),
    __metadata("design:type", String)
], UpdateTableDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'kapasitas harus berupa angka.' }),
    (0, class_validator_1.Min)(1, { message: 'kapasitas minimal 1.' }),
    __metadata("design:type", Number)
], UpdateTableDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTableDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: TableStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TableStatus, { message: 'status harus salah satu dari: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE.' }),
    __metadata("design:type", String)
], UpdateTableDto.prototype, "status", void 0);
//# sourceMappingURL=table.dto.js.map