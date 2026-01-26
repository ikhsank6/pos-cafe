"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const discount_resource_1 = require("./resources/discount.resource");
let DiscountsService = class DiscountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10, search, isActive) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
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
        return (0, pagination_util_1.buildPaginatedResponse)(discount_resource_1.DiscountResource.collection(discounts), total, page, limit);
    }
    async findOne(uuid) {
        const discount = await this.prisma.discount.findFirst({
            where: { uuid, deletedAt: null },
        });
        if (!discount) {
            throw new common_1.NotFoundException('Diskon tidak ditemukan.');
        }
        return { message: 'Success', data: new discount_resource_1.DiscountResource(discount) };
    }
    async findByCode(code) {
        const discount = await this.prisma.discount.findFirst({
            where: { code, deletedAt: null },
        });
        if (!discount) {
            throw new common_1.NotFoundException('Kode diskon tidak ditemukan.');
        }
        return { message: 'Success', data: new discount_resource_1.DiscountResource(discount) };
    }
    async validateDiscount(code, orderAmount) {
        const discount = await this.prisma.discount.findFirst({
            where: { code, deletedAt: null },
        });
        if (!discount) {
            throw new common_1.BadRequestException('Kode diskon tidak valid.');
        }
        const now = new Date();
        if (!discount.isActive) {
            throw new common_1.BadRequestException('Diskon tidak aktif.');
        }
        if (new Date(discount.startDate) > now) {
            throw new common_1.BadRequestException('Diskon belum berlaku.');
        }
        if (new Date(discount.endDate) < now) {
            throw new common_1.BadRequestException('Diskon sudah kadaluarsa.');
        }
        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
            throw new common_1.BadRequestException('Kuota diskon sudah habis.');
        }
        if (discount.minPurchase && orderAmount < Number(discount.minPurchase)) {
            throw new common_1.BadRequestException(`Minimum pembelian Rp ${Number(discount.minPurchase).toLocaleString()}.`);
        }
        let discountAmount;
        if (discount.type === 'PERCENTAGE') {
            discountAmount = (orderAmount * Number(discount.value)) / 100;
            if (discount.maxDiscount && discountAmount > Number(discount.maxDiscount)) {
                discountAmount = Number(discount.maxDiscount);
            }
        }
        else {
            discountAmount = Number(discount.value);
        }
        return {
            message: 'Diskon valid.',
            data: {
                discount: new discount_resource_1.DiscountResource(discount),
                discountAmount,
                finalAmount: orderAmount - discountAmount,
            },
        };
    }
    async create(createDiscountDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existingCode = await prisma.discount.findFirst({
                where: { code: createDiscountDto.code, deletedAt: null },
            });
            if (existingCode) {
                throw new common_1.BadRequestException('Kode diskon sudah digunakan.');
            }
            const startDate = new Date(createDiscountDto.startDate);
            const endDate = new Date(createDiscountDto.endDate);
            if (endDate <= startDate) {
                throw new common_1.BadRequestException('Tanggal selesai harus setelah tanggal mulai.');
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
            return { message: 'Diskon berhasil dibuat.', data: new discount_resource_1.DiscountResource(discount) };
        });
    }
    async update(uuid, updateDiscountDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.discount.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Diskon tidak ditemukan.');
            }
            if (updateDiscountDto.code) {
                const existingCode = await prisma.discount.findFirst({
                    where: { code: updateDiscountDto.code, id: { not: existing.id }, deletedAt: null },
                });
                if (existingCode) {
                    throw new common_1.BadRequestException('Kode diskon sudah digunakan.');
                }
            }
            const data = {
                code: updateDiscountDto.code,
                name: updateDiscountDto.name,
                description: updateDiscountDto.description,
                type: updateDiscountDto.type,
                value: updateDiscountDto.value,
                minPurchase: updateDiscountDto.minPurchase,
                maxDiscount: updateDiscountDto.maxDiscount,
                usageLimit: updateDiscountDto.usageLimit,
                isActive: updateDiscountDto.isActive,
                updatedBy
            };
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
            return { message: 'Diskon berhasil diupdate.', data: new discount_resource_1.DiscountResource(discount) };
        });
    }
    async remove(uuid, deletedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.discount.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Diskon tidak ditemukan.');
            }
            await prisma.discount.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });
            return { message: 'Diskon berhasil dihapus.', data: {} };
        });
    }
};
exports.DiscountsService = DiscountsService;
exports.DiscountsService = DiscountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscountsService);
//# sourceMappingURL=discounts.service.js.map