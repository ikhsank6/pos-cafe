import { IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TableStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    RESERVED = 'RESERVED',
    MAINTENANCE = 'MAINTENANCE',
}

export class CreateTableDto {
    @ApiProperty({ example: 'T01', description: 'Table number' })
    @IsNotEmpty({ message: 'nomor meja harus diisi.' })
    number: string;

    @ApiProperty({ example: 4, description: 'Table capacity' })
    @IsNotEmpty({ message: 'kapasitas harus diisi.' })
    @Type(() => Number)
    @IsNumber({}, { message: 'kapasitas harus berupa angka.' })
    @Min(1, { message: 'kapasitas minimal 1.' })
    capacity: number;

    @ApiProperty({ example: 'Indoor', required: false, description: 'Table location (Indoor, Outdoor, VIP)' })
    @IsOptional()
    location?: string;

    @ApiProperty({ example: 'AVAILABLE', enum: TableStatus, required: false })
    @IsOptional()
    @IsEnum(TableStatus, { message: 'status harus salah satu dari: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE.' })
    status?: TableStatus;
}

export class UpdateTableDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'nomor meja harus diisi.' })
    number?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'kapasitas harus berupa angka.' })
    @Min(1, { message: 'kapasitas minimal 1.' })
    capacity?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    location?: string;

    @ApiProperty({ required: false, enum: TableStatus })
    @IsOptional()
    @IsEnum(TableStatus, { message: 'status harus salah satu dari: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE.' })
    status?: TableStatus;
}
