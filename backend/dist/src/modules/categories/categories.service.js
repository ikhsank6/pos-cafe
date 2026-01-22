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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const category_resource_1 = require("./resources/category.resource");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10, search, isActive) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { products: { where: { deletedAt: null } } }
                    }
                }
            }),
            this.prisma.category.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(category_resource_1.CategoryResource.collection(categories), total, page, limit);
    }
    async findOne(uuid) {
        const category = await this.prisma.category.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                _count: {
                    select: { products: { where: { deletedAt: null } } }
                }
            }
        });
        if (!category) {
            throw new common_1.NotFoundException('Kategori tidak ditemukan.');
        }
        return { message: 'Success', data: new category_resource_1.CategoryResource(category) };
    }
    async create(createCategoryDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existingCategory = await prisma.category.findFirst({
                where: { name: createCategoryDto.name, deletedAt: null },
            });
            if (existingCategory) {
                throw new common_1.BadRequestException('Nama kategori sudah ada.');
            }
            const category = await prisma.category.create({
                data: {
                    name: createCategoryDto.name,
                    description: createCategoryDto.description,
                    icon: createCategoryDto.icon,
                    isActive: createCategoryDto.isActive ?? true,
                    createdBy,
                },
            });
            return { message: 'Kategori berhasil dibuat.', data: new category_resource_1.CategoryResource(category) };
        });
    }
    async update(uuid, updateCategoryDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.category.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Kategori tidak ditemukan.');
            }
            if (updateCategoryDto.name) {
                const existingCategory = await prisma.category.findFirst({
                    where: { name: updateCategoryDto.name, id: { not: existing.id }, deletedAt: null },
                });
                if (existingCategory) {
                    throw new common_1.BadRequestException('Nama kategori sudah digunakan.');
                }
            }
            const category = await prisma.category.update({
                where: { id: existing.id },
                data: {
                    ...updateCategoryDto,
                    updatedBy,
                },
            });
            return { message: 'Kategori berhasil diupdate.', data: new category_resource_1.CategoryResource(category) };
        });
    }
    async remove(uuid, deletedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.category.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Kategori tidak ditemukan.');
            }
            const productsInCategory = await prisma.product.count({
                where: { categoryId: existing.id, deletedAt: null },
            });
            if (productsInCategory > 0) {
                throw new common_1.BadRequestException('Kategori masih memiliki produk.');
            }
            await prisma.category.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });
            return { message: 'Kategori berhasil dihapus.', data: {} };
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map