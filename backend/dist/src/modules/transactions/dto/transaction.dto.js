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
exports.RefundTransactionDto = exports.UpdateTransactionStatusDto = exports.CreateTransactionDto = exports.TransactionStatus = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["QRIS"] = "QRIS";
    PaymentMethod["EWALLET"] = "EWALLET";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PAID"] = "PAID";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
class CreateTransactionDto {
    orderUuid;
    paymentMethod;
    amountPaid;
    referenceNumber;
    notes;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-order', description: 'Order UUID to pay' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'orderUuid harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'orderUuid harus berupa UUID yang valid.' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "orderUuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CASH', enum: PaymentMethod }),
    (0, class_validator_1.IsNotEmpty)({ message: 'paymentMethod harus diisi.' }),
    (0, class_validator_1.IsEnum)(PaymentMethod, { message: 'paymentMethod harus salah satu dari: CASH, DEBIT_CARD, CREDIT_CARD, QRIS, EWALLET, BANK_TRANSFER.' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000, description: 'Amount paid by customer' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'amountPaid harus diisi.' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'amountPaid harus berupa angka.' }),
    (0, class_validator_1.Min)(0, { message: 'amountPaid tidak boleh negatif.' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amountPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'REF-123456', required: false, description: 'Payment reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "referenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pembayaran via QRIS', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "notes", void 0);
class UpdateTransactionStatusDto {
    status;
}
exports.UpdateTransactionStatusDto = UpdateTransactionStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PAID', enum: TransactionStatus }),
    (0, class_validator_1.IsNotEmpty)({ message: 'status harus diisi.' }),
    (0, class_validator_1.IsEnum)(TransactionStatus, { message: 'status harus salah satu dari: PENDING, PAID, FAILED, REFUNDED.' }),
    __metadata("design:type", String)
], UpdateTransactionStatusDto.prototype, "status", void 0);
class RefundTransactionDto {
    reason;
}
exports.RefundTransactionDto = RefundTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pesanan dibatalkan customer', description: 'Refund reason' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'reason harus diisi.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundTransactionDto.prototype, "reason", void 0);
//# sourceMappingURL=transaction.dto.js.map