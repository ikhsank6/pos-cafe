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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const product_resource_1 = require("./resources/product.resource");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10, search, categoryUuid, type, isActive) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryUuid) {
            const category = await this.prisma.category.findFirst({
                where: { uuid: categoryUuid, deletedAt: null },
            });
            if (category) {
                where.categoryId = category.id;
            }
        }
        if (type) {
            where.type = type;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    category: true,
                    media: true,
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(product_resource_1.ProductResource.collection(products), total, page, limit);
    }
    async findOne(uuid) {
        const product = await this.prisma.product.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                category: true,
                media: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Produk tidak ditemukan.');
        }
        return { message: 'Success', data: new product_resource_1.ProductResource(product) };
    }
    async create(createProductDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existingSku = await prisma.product.findFirst({
                where: { sku: createProductDto.sku, deletedAt: null },
            });
            if (existingSku) {
                throw new common_1.BadRequestException('SKU sudah digunakan.');
            }
            const category = await prisma.category.findFirst({
                where: { uuid: createProductDto.categoryUuid, deletedAt: null },
            });
            if (!category) {
                throw new common_1.BadRequestException('Kategori tidak ditemukan.');
            }
            let mediaId;
            if (createProductDto.mediaUuid) {
                const media = await prisma.media.findFirst({
                    where: { uuid: createProductDto.mediaUuid, deletedAt: null },
                });
                if (!media) {
                    throw new common_1.BadRequestException('Media tidak ditemukan.');
                }
                mediaId = media.id;
            }
            const product = await prisma.product.create({
                data: {
                    sku: createProductDto.sku,
                    name: createProductDto.name,
                    description: createProductDto.description,
                    categoryId: category.id,
                    price: createProductDto.price,
                    cost: createProductDto.cost,
                    stock: createProductDto.stock ?? 0,
                    minStock: createProductDto.minStock ?? 0,
                    unit: createProductDto.unit ?? 'pcs',
                    mediaId,
                    type: createProductDto.type ?? 'FOOD',
                    isActive: createProductDto.isActive ?? true,
                    createdBy,
                },
                include: {
                    category: true,
                    media: true,
                },
            });
            return { message: 'Produk berhasil dibuat.', data: new product_resource_1.ProductResource(product) };
        });
    }
    async update(uuid, updateProductDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.product.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Produk tidak ditemukan.');
            }
            if (updateProductDto.sku) {
                const existingSku = await prisma.product.findFirst({
                    where: { sku: updateProductDto.sku, id: { not: existing.id }, deletedAt: null },
                });
                if (existingSku) {
                    throw new common_1.BadRequestException('SKU sudah digunakan.');
                }
            }
            const data = { ...updateProductDto, updatedBy };
            if (updateProductDto.categoryUuid) {
                const category = await prisma.category.findFirst({
                    where: { uuid: updateProductDto.categoryUuid, deletedAt: null },
                });
                if (!category) {
                    throw new common_1.BadRequestException('Kategori tidak ditemukan.');
                }
                data.categoryId = category.id;
                delete data.categoryUuid;
            }
            if (updateProductDto.mediaUuid) {
                const media = await prisma.media.findFirst({
                    where: { uuid: updateProductDto.mediaUuid, deletedAt: null },
                });
                if (!media) {
                    throw new common_1.BadRequestException('Media tidak ditemukan.');
                }
                data.mediaId = media.id;
                delete data.mediaUuid;
            }
            const product = await prisma.product.update({
                where: { id: existing.id },
                data,
                include: {
                    category: true,
                    media: true,
                },
            });
            return { message: 'Produk berhasil diupdate.', data: new product_resource_1.ProductResource(product) };
        });
    }
    async remove(uuid, deletedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.product.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Produk tidak ditemukan.');
            }
            await prisma.product.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });
            return { message: 'Produk berhasil dihapus.', data: {} };
        });
    }
    async updateStock(uuid, quantity, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.product.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Produk tidak ditemukan.');
            }
            const newStock = existing.stock + quantity;
            if (newStock < 0) {
                throw new common_1.BadRequestException('Stock tidak mencukupi.');
            }
            const product = await prisma.product.update({
                where: { id: existing.id },
                data: { stock: newStock, updatedBy },
                include: {
                    category: true,
                    media: true,
                },
            });
            return { message: 'Stock berhasil diupdate.', data: new product_resource_1.ProductResource(product) };
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map