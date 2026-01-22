import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Makanan', description: 'Nama kategori' })
    @IsNotEmpty({ message: 'nama kategori harus diisi.' })
    name: string;

    @ApiProperty({ example: 'Kategori untuk makanan', required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'Utensils', required: false, description: 'Icon name' })
    @IsOptional()
    icon?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean({ message: 'isActive harus boolean.' })
    isActive?: boolean;
}

export class UpdateCategoryDto {
    @ApiProperty({ example: 'Makanan', required: false })
    @IsOptional()
    @IsNotEmpty({ message: 'nama kategori harus diisi.' })
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    icon?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean({ message: 'isActive harus boolean.' })
    isActive?: boolean;
}
