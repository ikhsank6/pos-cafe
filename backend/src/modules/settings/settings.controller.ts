import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { UpdateTaxSettingsDto } from './dto/update-setting.dto';

@ApiTags('1. System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all settings' })
    async findAll() {
        return {
            message: 'Success',
            data: await this.settingsService.findAll(),
        };
    }

    @Get('tax')
    @ApiOperation({ summary: 'Get tax settings' })
    async getTaxSettings() {
        return {
            message: 'Success',
            data: await this.settingsService.getTaxSettings(),
        };
    }

    @Put('tax')
    @ApiOperation({ summary: 'Update tax settings' })
    async updateTaxSettings(@Body() dto: UpdateTaxSettingsDto, @Req() req: any) {
        return {
            message: 'Settings updated',
            data: await this.settingsService.updateTaxSettings(dto, req.user.username),
        };
    }
}
