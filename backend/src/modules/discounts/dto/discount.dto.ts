import { IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class CreateDiscountDto {
    @ApiProperty({ example: 'PROMO10', description: 'Discount code' })
    @IsNotEmpty({ message: 'kode diskon harus diisi.' })
    code: string;

    @ApiProperty({ example: 'Promo Awal Tahun', description: 'Discount name' })
    @IsNotEmpty({ message: 'nama diskon harus diisi.' })
    name: string;

    @ApiProperty({ example: 'Diskon 10% untuk semua menu', required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'PERCENTAGE', enum: DiscountType })
    @IsNotEmpty({ message: 'tipe diskon harus diisi.' })
    @IsEnum(DiscountType, { message: 'type harus salah satu dari: PERCENTAGE, FIXED_AMOUNT.' })
    type: DiscountType;

    @ApiProperty({ example: 10, description: 'Discount value (percentage or fixed amount)' })
    @IsNotEmpty({ message: 'nilai diskon harus diisi.' })
    @Type(() => Number)
    @IsNumber({}, { message: 'value harus berupa angka.' })
    @Min(0, { message: 'value tidak boleh negatif.' })
    value: number;

    @ApiProperty({ example: 50000, required: false, description: 'Minimum purchase amount' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'minPurchase harus berupa angka.' })
    @Min(0, { message: 'minPurchase tidak boleh negatif.' })
    minPurchase?: number;

    @ApiProperty({ example: 25000, required: false, description: 'Maximum discount amount (for percentage type)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'maxDiscount harus berupa angka.' })
    @Min(0, { message: 'maxDiscount tidak boleh negatif.' })
    maxDiscount?: number;

    @ApiProperty({ example: '2024-01-01', description: 'Start date (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'tanggal mulai harus diisi.' })
    @IsDateString({}, { message: 'format tanggal mulai tidak valid.' })
    startDate: string;

    @ApiProperty({ example: '2024-12-31', description: 'End date (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'tanggal selesai harus diisi.' })
    @IsDateString({}, { message: 'format tanggal selesai tidak valid.' })
    endDate: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean({ message: 'isActive harus boolean.' })
    isActive?: boolean;

    @ApiProperty({ example: 100, required: false, description: 'Maximum usage limit' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'usageLimit harus berupa angka.' })
    @Min(1, { message: 'usageLimit minimal 1.' })
    usageLimit?: number;
}

export class UpdateDiscountDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'kode diskon harus diisi.' })
    code?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'nama diskon harus diisi.' })
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false, enum: DiscountType })
    @IsOptional()
    @IsEnum(DiscountType, { message: 'type harus salah satu dari: PERCENTAGE, FIXED_AMOUNT.' })
    type?: DiscountType;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'value harus berupa angka.' })
    @Min(0, { message: 'value tidak boleh negatif.' })
    value?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'minPurchase harus berupa angka.' })
    @Min(0, { message: 'minPurchase tidak boleh negatif.' })
    minPurchase?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'maxDiscount harus berupa angka.' })
    @Min(0, { message: 'maxDiscount tidak boleh negatif.' })
    maxDiscount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString({}, { message: 'format tanggal mulai tidak valid.' })
    startDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString({}, { message: 'format tanggal selesai tidak valid.' })
    endDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean({ message: 'isActive harus boolean.' })
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'usageLimit harus berupa angka.' })
    @Min(1, { message: 'usageLimit minimal 1.' })
    usageLimit?: number;
}
