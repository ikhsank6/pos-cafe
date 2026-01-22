import { IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsUUID, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ProductType {
    FOOD = 'FOOD',
    BEVERAGE = 'BEVERAGE',
    SNACK = 'SNACK',
    OTHER = 'OTHER',
}

export class CreateProductDto {
    @ApiProperty({ example: 'SKU-001', description: 'Unique product SKU' })
    @IsNotEmpty({ message: 'SKU harus diisi.' })
    sku: string;

    @ApiProperty({ example: 'Nasi Goreng Spesial', description: 'Product name' })
    @IsNotEmpty({ message: 'nama produk harus diisi.' })
    name: string;

    @ApiProperty({ example: 'Nasi goreng dengan telur dan ayam', required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'uuid-category', description: 'Category UUID' })
    @IsNotEmpty({ message: 'kategori harus diisi.' })
    @IsUUID('4', { message: 'categoryUuid harus berupa UUID yang valid.' })
    categoryUuid: string;

    @ApiProperty({ example: 25000, description: 'Selling price' })
    @IsNotEmpty({ message: 'harga harus diisi.' })
    @Type(() => Number)
    @IsNumber({}, { message: 'harga harus berupa angka.' })
    @Min(0, { message: 'harga tidak boleh negatif.' })
    price: number;

    @ApiProperty({ example: 15000, required: false, description: 'Cost/HPP' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'cost harus berupa angka.' })
    @Min(0, { message: 'cost tidak boleh negatif.' })
    cost?: number;

    @ApiProperty({ example: 100, required: false, description: 'Initial stock' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'stock harus berupa angka.' })
    @Min(0, { message: 'stock tidak boleh negatif.' })
    stock?: number;

    @ApiProperty({ example: 10, required: false, description: 'Minimum stock alert' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'minStock harus berupa angka.' })
    @Min(0, { message: 'minStock tidak boleh negatif.' })
    minStock?: number;

    @ApiProperty({ example: 'pcs', required: false, description: 'Unit of measurement' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiProperty({ example: 'uuid-media', required: false, description: 'Media UUID for product image' })
    @IsOptional()
    @IsUUID('4', { message: 'mediaUuid harus berupa UUID yang valid.' })
    mediaUuid?: string;

    @ApiProperty({ example: 'FOOD', enum: ProductType, required: false })
    @IsOptional()
    @IsEnum(ProductType, { message: 'type harus salah satu dari: FOOD, BEVERAGE, SNACK, OTHER.' })
    type?: ProductType;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean({ message: 'isActive harus boolean.' })
    isActive?: boolean;
}

export class UpdateProductDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'SKU harus diisi.' })
    sku?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'nama produk harus diisi.' })
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID('4', { message: 'categoryUuid harus berupa UUID yang valid.' })
    categoryUuid?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'harga harus berupa angka.' })
    @Min(0, { message: 'harga tidak boleh negatif.' })
    price?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'cost harus berupa angka.' })
    @Min(0, { message: 'cost tidak boleh negatif.' })
    cost?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'stock harus berupa angka.' })
    @Min(0, { message: 'stock tidak boleh negatif.' })
    stock?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'minStock harus berupa angka.' })
    @Min(0, { message: 'minStock tidak boleh negatif.' })
    minStock?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID('4', { message: 'mediaUuid harus berupa UUID yang valid.' })
    mediaUuid?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(ProductType, { message: 'type harus salah satu dari: FOOD, BEVERAGE, SNACK, OTHER.' })
    type?: ProductType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean({ message: 'isActive harus boolean.' })
    isActive?: boolean;
}
