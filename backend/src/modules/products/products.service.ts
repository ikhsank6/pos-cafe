import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { ProductResource } from './resources/product.resource';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(
        page = 1,
        limit = 10,
        search?: string,
        categoryUuid?: string,
        type?: string,
        isActive?: boolean,
    ) {
        const skip = calculateSkip(page, limit);

        const where: any = { deletedAt: null };

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

        return buildPaginatedResponse(
            ProductResource.collection(products),
            total,
            page,
            limit,
        );
    }

    async findOne(uuid: string) {
        const product = await this.prisma.product.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                category: true,
                media: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Produk tidak ditemukan.');
        }

        return { message: 'Success', data: new ProductResource(product) };
    }

    async create(createProductDto: CreateProductDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            let sku = createProductDto.sku;

            // Generate SKU if not provided
            if (!sku) {
                const prefix = 'PRD';
                let isUnique = false;
                while (!isUnique) {
                    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
                    sku = `${prefix}-${random}`;
                    
                    const existing = await prisma.product.findFirst({
                        where: { sku, deletedAt: null },
                    });
                    
                    if (!existing) {
                        isUnique = true;
                    }
                }
            } else {
                // Check SKU uniqueness if provided
                const existingSku = await prisma.product.findFirst({
                    where: { sku, deletedAt: null },
                });

                if (existingSku) {
                    throw new BadRequestException('SKU sudah digunakan.');
                }
            }

            // Get category
            const category = await prisma.category.findFirst({
                where: { uuid: createProductDto.categoryUuid, deletedAt: null },
            });

            if (!category) {
                throw new BadRequestException('Kategori tidak ditemukan.');
            }

            // Get media if provided
            let mediaId: number | undefined;
            if (createProductDto.mediaUuid) {
                const media = await prisma.media.findFirst({
                    where: { uuid: createProductDto.mediaUuid, deletedAt: null },
                });
                if (!media) {
                    throw new BadRequestException('Media tidak ditemukan.');
                }
                mediaId = media.id;
            }

            const product = await prisma.product.create({
                data: {
                    sku: sku as string,
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

            return { message: 'Produk berhasil dibuat.', data: new ProductResource(product) };
        });
    }

    async update(uuid: string, updateProductDto: UpdateProductDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.product.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Produk tidak ditemukan.');
            }

            // Check SKU uniqueness if updating
            if (updateProductDto.sku) {
                const existingSku = await prisma.product.findFirst({
                    where: { sku: updateProductDto.sku, id: { not: existing.id }, deletedAt: null },
                });
                if (existingSku) {
                    throw new BadRequestException('SKU sudah digunakan.');
                }
            }

            const data: any = { ...updateProductDto, updatedBy };

            // Handle category update
            if (updateProductDto.categoryUuid) {
                const category = await prisma.category.findFirst({
                    where: { uuid: updateProductDto.categoryUuid, deletedAt: null },
                });
                if (!category) {
                    throw new BadRequestException('Kategori tidak ditemukan.');
                }
                data.categoryId = category.id;
                delete data.categoryUuid;
            }

            // Handle media update
            if (updateProductDto.mediaUuid) {
                const media = await prisma.media.findFirst({
                    where: { uuid: updateProductDto.mediaUuid, deletedAt: null },
                });
                if (!media) {
                    throw new BadRequestException('Media tidak ditemukan.');
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

            return { message: 'Produk berhasil diupdate.', data: new ProductResource(product) };
        });
    }

    async remove(uuid: string, deletedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.product.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Produk tidak ditemukan.');
            }

            await prisma.product.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });

            return { message: 'Produk berhasil dihapus.', data: {} };
        });
    }

    async updateStock(uuid: string, quantity: number, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.product.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Produk tidak ditemukan.');
            }

            const newStock = existing.stock + quantity;
            if (newStock < 0) {
                throw new BadRequestException('Stock tidak mencukupi.');
            }

            const product = await prisma.product.update({
                where: { id: existing.id },
                data: { stock: newStock, updatedBy },
                include: {
                    category: true,
                    media: true,
                },
            });

            return { message: 'Stock berhasil diupdate.', data: new ProductResource(product) };
        });
    }
}
