import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { DiscountResource } from './resources/discount.resource';

@Injectable()
export class DiscountsService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 10, search?: string, isActive?: boolean) {
        const skip = calculateSkip(page, limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [discounts, total] = await Promise.all([
            this.prisma.discount.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.discount.count({ where }),
        ]);

        return buildPaginatedResponse(
            DiscountResource.collection(discounts),
            total,
            page,
            limit,
        );
    }

    async findOne(uuid: string) {
        const discount = await this.prisma.discount.findFirst({
            where: { uuid, deletedAt: null },
        });

        if (!discount) {
            throw new NotFoundException('Diskon tidak ditemukan.');
        }

        return { message: 'Success', data: new DiscountResource(discount) };
    }

    async findByCode(code: string) {
        const discount = await this.prisma.discount.findFirst({
            where: { code, deletedAt: null },
        });

        if (!discount) {
            throw new NotFoundException('Kode diskon tidak ditemukan.');
        }

        return { message: 'Success', data: new DiscountResource(discount) };
    }

    async validateDiscount(code: string, orderAmount: number) {
        const discount = await this.prisma.discount.findFirst({
            where: { code, deletedAt: null },
        });

        if (!discount) {
            throw new BadRequestException('Kode diskon tidak valid.');
        }

        const now = new Date();

        if (!discount.isActive) {
            throw new BadRequestException('Diskon tidak aktif.');
        }

        if (new Date(discount.startDate) > now) {
            throw new BadRequestException('Diskon belum berlaku.');
        }

        if (new Date(discount.endDate) < now) {
            throw new BadRequestException('Diskon sudah kadaluarsa.');
        }

        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
            throw new BadRequestException('Kuota diskon sudah habis.');
        }

        if (discount.minPurchase && orderAmount < Number(discount.minPurchase)) {
            throw new BadRequestException(`Minimum pembelian Rp ${Number(discount.minPurchase).toLocaleString()}.`);
        }

        // Calculate discount amount
        let discountAmount: number;
        if (discount.type === 'PERCENTAGE') {
            discountAmount = (orderAmount * Number(discount.value)) / 100;
            if (discount.maxDiscount && discountAmount > Number(discount.maxDiscount)) {
                discountAmount = Number(discount.maxDiscount);
            }
        } else {
            discountAmount = Number(discount.value);
        }

        return {
            message: 'Diskon valid.',
            data: {
                discount: new DiscountResource(discount),
                discountAmount,
                finalAmount: orderAmount - discountAmount,
            },
        };
    }

    async create(createDiscountDto: CreateDiscountDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existingCode = await prisma.discount.findFirst({
                where: { code: createDiscountDto.code, deletedAt: null },
            });

            if (existingCode) {
                throw new BadRequestException('Kode diskon sudah digunakan.');
            }

            // Validate dates
            const startDate = new Date(createDiscountDto.startDate);
            const endDate = new Date(createDiscountDto.endDate);
            if (endDate <= startDate) {
                throw new BadRequestException('Tanggal selesai harus setelah tanggal mulai.');
            }

            const discount = await prisma.discount.create({
                data: {
                    code: createDiscountDto.code,
                    name: createDiscountDto.name,
                    description: createDiscountDto.description,
                    type: createDiscountDto.type,
                    value: createDiscountDto.value,
                    minPurchase: createDiscountDto.minPurchase,
                    maxDiscount: createDiscountDto.maxDiscount,
                    startDate,
                    endDate,
                    isActive: createDiscountDto.isActive ?? true,
                    usageLimit: createDiscountDto.usageLimit,
                    createdBy,
                },
            });

            return { message: 'Diskon berhasil dibuat.', data: new DiscountResource(discount) };
        });
    }

    async update(uuid: string, updateDiscountDto: UpdateDiscountDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.discount.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Diskon tidak ditemukan.');
            }

            if (updateDiscountDto.code) {
                const existingCode = await prisma.discount.findFirst({
                    where: { code: updateDiscountDto.code, id: { not: existing.id }, deletedAt: null },
                });
                if (existingCode) {
                    throw new BadRequestException('Kode diskon sudah digunakan.');
                }
            }

            const data: any = { ...updateDiscountDto, updatedBy };
            if (updateDiscountDto.startDate) {
                data.startDate = new Date(updateDiscountDto.startDate);
            }
            if (updateDiscountDto.endDate) {
                data.endDate = new Date(updateDiscountDto.endDate);
            }

            const discount = await prisma.discount.update({
                where: { id: existing.id },
                data,
            });

            return { message: 'Diskon berhasil diupdate.', data: new DiscountResource(discount) };
        });
    }

    async remove(uuid: string, deletedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.discount.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Diskon tidak ditemukan.');
            }

            await prisma.discount.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });

            return { message: 'Diskon berhasil dihapus.', data: {} };
        });
    }
}
