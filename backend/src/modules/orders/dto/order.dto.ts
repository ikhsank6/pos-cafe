import { IsNotEmpty, IsOptional, IsArray, IsUUID, IsNumber, IsEnum, ValidateNested, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum OrderType {
    DINE_IN = 'DINE_IN',
    TAKEAWAY = 'TAKEAWAY',
    DELIVERY = 'DELIVERY',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum OrderItemStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    READY = 'READY',
    CANCELLED = 'CANCELLED',
}

export class OrderItemDto {
    @ApiProperty({ example: 'uuid-product', description: 'Product UUID' })
    @IsNotEmpty({ message: 'productUuid harus diisi.' })
    @IsUUID('4', { message: 'productUuid harus berupa UUID yang valid.' })
    productUuid: string;

    @ApiProperty({ example: 2, description: 'Quantity' })
    @IsNotEmpty({ message: 'quantity harus diisi.' })
    @Type(() => Number)
    @IsNumber({}, { message: 'quantity harus berupa angka.' })
    @Min(1, { message: 'quantity minimal 1.' })
    quantity: number;

    @ApiProperty({ example: 'Tidak pakai sambal', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateOrderDto {
    @ApiProperty({ example: 'DINE_IN', enum: OrderType, required: false })
    @IsOptional()
    @IsEnum(OrderType, { message: 'orderType harus salah satu dari: DINE_IN, TAKEAWAY, DELIVERY.' })
    orderType?: OrderType;

    @ApiProperty({ example: 'uuid-table', required: false, description: 'Table UUID (for DINE_IN)' })
    @IsOptional()
    @IsUUID('4', { message: 'tableUuid harus berupa UUID yang valid.' })
    tableUuid?: string;

    @ApiProperty({ example: 'uuid-customer', required: false, description: 'Customer UUID' })
    @IsOptional()
    @IsUUID('4', { message: 'customerUuid harus berupa UUID yang valid.' })
    customerUuid?: string;

    @ApiProperty({ type: [OrderItemDto], description: 'Order items' })
    @IsArray({ message: 'items harus berupa array.' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({ example: 'Catatan khusus...', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: 'PROMO10', required: false, description: 'Discount code' })
    @IsOptional()
    @IsString()
    discountCode?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ example: 'CONFIRMED', enum: OrderStatus })
    @IsNotEmpty({ message: 'status harus diisi.' })
    @IsEnum(OrderStatus, { message: 'status harus salah satu dari: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED.' })
    status: OrderStatus;
}

export class UpdateOrderItemStatusDto {
    @ApiProperty({ example: 'PREPARING', enum: OrderItemStatus })
    @IsNotEmpty({ message: 'status harus diisi.' })
    @IsEnum(OrderItemStatus, { message: 'status harus salah satu dari: PENDING, PREPARING, READY, CANCELLED.' })
    status: OrderItemStatus;
}

export class AddOrderItemsDto {
    @ApiProperty({ type: [OrderItemDto], description: 'New order items to add' })
    @IsArray({ message: 'items harus berupa array.' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
