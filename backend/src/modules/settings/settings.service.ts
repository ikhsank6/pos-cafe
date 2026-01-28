import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTaxSettingsDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.taxSetting.findMany();
    }

    async findByKey(key: string) {
        const setting = await this.prisma.taxSetting.findUnique({
            where: { key },
        });

        if (!setting) {
            // Return a default value if not found instead of throwing
            return { key, value: this.getDefaultValue(key) };
        }

        return setting;
    }

    async updateTaxSettings(dto: UpdateTaxSettingsDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const keys = {
                'tax_enabled': dto.taxEnabled,
                'tax_rate': dto.taxRate,
            };

            const results: any[] = [];
            for (const [key, value] of Object.entries(keys)) {
                const setting = await prisma.taxSetting.upsert({
                    where: { key },
                    update: { value, updatedBy },
                    create: { key, value, createdBy: updatedBy },
                });
                results.push(setting);
            }

            return results;
        });
    }

    async update(key: string, value: string, updatedBy?: string) {
        return this.prisma.taxSetting.upsert({
            where: { key },
            update: { value, updatedBy },
            create: { key, value, createdBy: updatedBy },
        });
    }

    private getDefaultValue(key: string): string {
        const defaults: Record<string, string> = {
            'tax_enabled': 'false',
            'tax_rate': '0',
        };
        return defaults[key] || '';
    }

    async getTaxSettings() {
        try {
            const [enabled, rate] = await Promise.all([
                this.findByKey('tax_enabled'),
                this.findByKey('tax_rate'),
            ]);

            return {
                taxEnabled: enabled?.value === 'true',
                taxRate: parseFloat(rate?.value || '0') || 0,
            };
        } catch (error) {
            console.error('Error in getTaxSettings:', error);
            throw error;
        }
    }
}
