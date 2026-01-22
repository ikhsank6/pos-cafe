import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { CategoryResource } from './resources/category.resource';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 10, search?: string, isActive?: boolean) {
        const skip = calculateSkip(page, limit);

        const where: any = { deletedAt: null };

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

        return buildPaginatedResponse(
            CategoryResource.collection(categories),
            total,
            page,
            limit,
        );
    }

    async findOne(uuid: string) {
        const category = await this.prisma.category.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                _count: {
                    select: { products: { where: { deletedAt: null } } }
                }
            }
        });

        if (!category) {
            throw new NotFoundException('Kategori tidak ditemukan.');
        }

        return { message: 'Success', data: new CategoryResource(category) };
    }

    async create(createCategoryDto: CreateCategoryDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existingCategory = await prisma.category.findFirst({
                where: { name: createCategoryDto.name, deletedAt: null },
            });

            if (existingCategory) {
                throw new BadRequestException('Nama kategori sudah ada.');
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

            return { message: 'Kategori berhasil dibuat.', data: new CategoryResource(category) };
        });
    }

    async update(uuid: string, updateCategoryDto: UpdateCategoryDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.category.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Kategori tidak ditemukan.');
            }

            if (updateCategoryDto.name) {
                const existingCategory = await prisma.category.findFirst({
                    where: { name: updateCategoryDto.name, id: { not: existing.id }, deletedAt: null },
                });
                if (existingCategory) {
                    throw new BadRequestException('Nama kategori sudah digunakan.');
                }
            }

            const category = await prisma.category.update({
                where: { id: existing.id },
                data: {
                    ...updateCategoryDto,
                    updatedBy,
                },
            });

            return { message: 'Kategori berhasil diupdate.', data: new CategoryResource(category) };
        });
    }

    async remove(uuid: string, deletedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.category.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Kategori tidak ditemukan.');
            }

            const productsInCategory = await prisma.product.count({
                where: { categoryId: existing.id, deletedAt: null },
            });

            if (productsInCategory > 0) {
                throw new BadRequestException('Kategori masih memiliki produk.');
            }

            await prisma.category.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });

            return { message: 'Kategori berhasil dihapus.', data: {} };
        });
    }
}
