import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSettingDto {
    @ApiProperty({ example: '10' })
    @IsString()
    @IsNotEmpty()
    value: string;
}

export class UpdateTaxSettingsDto {
    @ApiProperty({ example: 'true' })
    @IsString()
    @IsNotEmpty()
    taxEnabled: string;

    @ApiProperty({ example: '10' })
    @IsString()
    @IsNotEmpty()
    taxRate: string;
}
