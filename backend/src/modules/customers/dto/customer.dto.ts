import { IsNotEmpty, IsOptional, IsEmail, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
    @ApiProperty({ example: 'John Doe', description: 'Customer name' })
    @IsNotEmpty({ message: 'nama pelanggan harus diisi.' })
    name: string;

    @ApiProperty({ example: 'john@example.com', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'format email tidak valid.' })
    email?: string;

    @ApiProperty({ example: '08123456789', description: 'Phone number' })
    @IsNotEmpty({ message: 'nomor telepon harus diisi.' })
    phone: string;

    @ApiProperty({ example: 'Jl. Contoh No. 123', required: false })
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '1990-01-15', required: false, description: 'Date of birth (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString({}, { message: 'format tanggal lahir tidak valid.' })
    dateOfBirth?: string;
}

export class UpdateCustomerDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'nama pelanggan harus diisi.' })
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail({}, { message: 'format email tidak valid.' })
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'nomor telepon harus diisi.' })
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString({}, { message: 'format tanggal lahir tidak valid.' })
    dateOfBirth?: string;

    @ApiProperty({ required: false, description: 'Loyalty points adjustment' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'loyaltyPoints harus berupa angka.' })
    @Min(0, { message: 'loyaltyPoints tidak boleh negatif.' })
    loyaltyPoints?: number;
}
