import { IsNotEmpty, IsOptional, IsNumber, IsEnum, IsUUID, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentMethod {
    CASH = 'CASH',
    DEBIT_CARD = 'DEBIT_CARD',
    CREDIT_CARD = 'CREDIT_CARD',
    QRIS = 'QRIS',
    EWALLET = 'EWALLET',
    BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export class CreateTransactionDto {
    @ApiProperty({ example: 'uuid-order', description: 'Order UUID to pay' })
    @IsNotEmpty({ message: 'orderUuid harus diisi.' })
    @IsUUID('4', { message: 'orderUuid harus berupa UUID yang valid.' })
    orderUuid: string;

    @ApiProperty({ example: 'CASH', enum: PaymentMethod })
    @IsNotEmpty({ message: 'paymentMethod harus diisi.' })
    @IsEnum(PaymentMethod, { message: 'paymentMethod harus salah satu dari: CASH, DEBIT_CARD, CREDIT_CARD, QRIS, EWALLET, BANK_TRANSFER.' })
    paymentMethod: PaymentMethod;

    @ApiProperty({ example: 100000, description: 'Amount paid by customer' })
    @IsNotEmpty({ message: 'amountPaid harus diisi.' })
    @Type(() => Number)
    @IsNumber({}, { message: 'amountPaid harus berupa angka.' })
    @Min(0, { message: 'amountPaid tidak boleh negatif.' })
    amountPaid: number;

    @ApiProperty({ example: 'REF-123456', required: false, description: 'Payment reference number' })
    @IsOptional()
    @IsString()
    referenceNumber?: string;

    @ApiProperty({ example: 'Pembayaran via QRIS', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateTransactionStatusDto {
    @ApiProperty({ example: 'PAID', enum: TransactionStatus })
    @IsNotEmpty({ message: 'status harus diisi.' })
    @IsEnum(TransactionStatus, { message: 'status harus salah satu dari: PENDING, PAID, FAILED, REFUNDED.' })
    status: TransactionStatus;
}

export class RefundTransactionDto {
    @ApiProperty({ example: 'Pesanan dibatalkan customer', description: 'Refund reason' })
    @IsNotEmpty({ message: 'reason harus diisi.' })
    @IsString()
    reason: string;
}
