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
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const table_resource_1 = require("./resources/table.resource");
const client_1 = require("@prisma/client");
let TablesService = class TablesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10, search, status, location) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { number: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
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
                                    status: { notIn: [client_1.OrderStatus.COMPLETED, client_1.OrderStatus.CANCELLED] }
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.table.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(table_resource_1.TableResource.collection(tables), total, page, limit);
    }
    async findOne(uuid) {
        const table = await this.prisma.table.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                _count: {
                    select: {
                        orders: {
                            where: {
                                deletedAt: null,
                                status: { notIn: [client_1.OrderStatus.COMPLETED, client_1.OrderStatus.CANCELLED] }
                            }
                        }
                    }
                }
            }
        });
        if (!table) {
            throw new common_1.NotFoundException('Meja tidak ditemukan.');
        }
        return { message: 'Success', data: new table_resource_1.TableResource(table) };
    }
    async create(createTableDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existingTable = await prisma.table.findFirst({
                where: { number: createTableDto.number, deletedAt: null },
            });
            if (existingTable) {
                throw new common_1.BadRequestException('Nomor meja sudah ada.');
            }
            const table = await prisma.table.create({
                data: {
                    number: createTableDto.number,
                    capacity: createTableDto.capacity,
                    location: createTableDto.location,
                    status: createTableDto.status ?? client_1.TableStatus.AVAILABLE,
                    createdBy,
                },
            });
            return { message: 'Meja berhasil dibuat.', data: new table_resource_1.TableResource(table) };
        });
    }
    async update(uuid, updateTableDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.table.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Meja tidak ditemukan.');
            }
            if (updateTableDto.number) {
                const existingTable = await prisma.table.findFirst({
                    where: { number: updateTableDto.number, id: { not: existing.id }, deletedAt: null },
                });
                if (existingTable) {
                    throw new common_1.BadRequestException('Nomor meja sudah digunakan.');
                }
            }
            const data = { ...updateTableDto, updatedBy };
            if (updateTableDto.status) {
                data.status = updateTableDto.status;
            }
            const table = await prisma.table.update({
                where: { id: existing.id },
                data,
            });
            return { message: 'Meja berhasil diupdate.', data: new table_resource_1.TableResource(table) };
        });
    }
    async remove(uuid, deletedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.table.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Meja tidak ditemukan.');
            }
            const activeOrders = await prisma.order.count({
                where: {
                    tableId: existing.id,
                    deletedAt: null,
                    status: { notIn: [client_1.OrderStatus.COMPLETED, client_1.OrderStatus.CANCELLED] }
                },
            });
            if (activeOrders > 0) {
                throw new common_1.BadRequestException('Meja masih memiliki pesanan aktif.');
            }
            await prisma.table.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });
            return { message: 'Meja berhasil dihapus.', data: {} };
        });
    }
    async updateStatus(uuid, status, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.table.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Meja tidak ditemukan.');
            }
            const table = await prisma.table.update({
                where: { id: existing.id },
                data: { status, updatedBy },
            });
            return { message: 'Status meja berhasil diupdate.', data: new table_resource_1.TableResource(table) };
        });
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map