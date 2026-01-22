import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { TableResource } from './resources/table.resource';
import { TableStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class TablesService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 10, search?: string, status?: string, location?: string) {
        const skip = calculateSkip(page, limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { number: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status as TableStatus;
        }

        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }

        const [tables, total] = await Promise.all([
            this.prisma.table.findMany({
                where,
                skip,
                take: limit,
                orderBy: { number: 'asc' },
                include: {
                    _count: {
                        select: {
                            orders: {
                                where: {
                                    deletedAt: null,
                                    status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.table.count({ where }),
        ]);

        return buildPaginatedResponse(
            TableResource.collection(tables),
            total,
            page,
            limit,
        );
    }

    async findOne(uuid: string) {
        const table = await this.prisma.table.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                _count: {
                    select: {
                        orders: {
                            where: {
                                deletedAt: null,
                                status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }
                            }
                        }
                    }
                }
            }
        });

        if (!table) {
            throw new NotFoundException('Meja tidak ditemukan.');
        }

        return { message: 'Success', data: new TableResource(table) };
    }

    async create(createTableDto: CreateTableDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existingTable = await prisma.table.findFirst({
                where: { number: createTableDto.number, deletedAt: null },
            });

            if (existingTable) {
                throw new BadRequestException('Nomor meja sudah ada.');
            }

            const table = await prisma.table.create({
                data: {
                    number: createTableDto.number,
                    capacity: createTableDto.capacity,
                    location: createTableDto.location,
                    status: (createTableDto.status as TableStatus) ?? TableStatus.AVAILABLE,
                    createdBy,
                },
            });

            return { message: 'Meja berhasil dibuat.', data: new TableResource(table) };
        });
    }

    async update(uuid: string, updateTableDto: UpdateTableDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.table.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Meja tidak ditemukan.');
            }

            if (updateTableDto.number) {
                const existingTable = await prisma.table.findFirst({
                    where: { number: updateTableDto.number, id: { not: existing.id }, deletedAt: null },
                });
                if (existingTable) {
                    throw new BadRequestException('Nomor meja sudah digunakan.');
                }
            }

            const data: any = { ...updateTableDto, updatedBy };
            if (updateTableDto.status) {
                data.status = updateTableDto.status as TableStatus;
            }

            const table = await prisma.table.update({
                where: { id: existing.id },
                data,
            });

            return { message: 'Meja berhasil diupdate.', data: new TableResource(table) };
        });
    }

    async remove(uuid: string, deletedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.table.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Meja tidak ditemukan.');
            }

            // Check if table has active orders
            const activeOrders = await prisma.order.count({
                where: {
                    tableId: existing.id,
                    deletedAt: null,
                    status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }
                },
            });

            if (activeOrders > 0) {
                throw new BadRequestException('Meja masih memiliki pesanan aktif.');
            }

            await prisma.table.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });

            return { message: 'Meja berhasil dihapus.', data: {} };
        });
    }

    async updateStatus(uuid: string, status: TableStatus, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.table.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Meja tidak ditemukan.');
            }

            const table = await prisma.table.update({
                where: { id: existing.id },
                data: { status, updatedBy },
            });

            return { message: 'Status meja berhasil diupdate.', data: new TableResource(table) };
        });
    }
}
