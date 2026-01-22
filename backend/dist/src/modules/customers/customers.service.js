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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const customer_resource_1 = require("./resources/customer.resource");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10, search) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { orders: { where: { deletedAt: null } } }
                    }
                }
            }),
            this.prisma.customer.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(customer_resource_1.CustomerResource.collection(customers), total, page, limit);
    }
    async findOne(uuid) {
        const customer = await this.prisma.customer.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                _count: {
                    select: { orders: { where: { deletedAt: null } } }
                }
            }
        });
        if (!customer) {
            throw new common_1.NotFoundException('Pelanggan tidak ditemukan.');
        }
        return { message: 'Success', data: new customer_resource_1.CustomerResource(customer) };
    }
    async findByPhone(phone) {
        const customer = await this.prisma.customer.findFirst({
            where: { phone, deletedAt: null },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Pelanggan tidak ditemukan.');
        }
        return { message: 'Success', data: new customer_resource_1.CustomerResource(customer) };
    }
    async create(createCustomerDto, createdBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existingPhone = await prisma.customer.findFirst({
                where: { phone: createCustomerDto.phone, deletedAt: null },
            });
            if (existingPhone) {
                throw new common_1.BadRequestException('Nomor telepon sudah terdaftar.');
            }
            if (createCustomerDto.email) {
                const existingEmail = await prisma.customer.findFirst({
                    where: { email: createCustomerDto.email, deletedAt: null },
                });
                if (existingEmail) {
                    throw new common_1.BadRequestException('Email sudah terdaftar.');
                }
            }
            const customer = await prisma.customer.create({
                data: {
                    name: createCustomerDto.name,
                    email: createCustomerDto.email,
                    phone: createCustomerDto.phone,
                    address: createCustomerDto.address,
                    dateOfBirth: createCustomerDto.dateOfBirth ? new Date(createCustomerDto.dateOfBirth) : null,
                    loyaltyPoints: 0,
                    createdBy,
                },
            });
            return { message: 'Pelanggan berhasil dibuat.', data: new customer_resource_1.CustomerResource(customer) };
        });
    }
    async update(uuid, updateCustomerDto, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.customer.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Pelanggan tidak ditemukan.');
            }
            if (updateCustomerDto.phone) {
                const existingPhone = await prisma.customer.findFirst({
                    where: { phone: updateCustomerDto.phone, id: { not: existing.id }, deletedAt: null },
                });
                if (existingPhone) {
                    throw new common_1.BadRequestException('Nomor telepon sudah digunakan.');
                }
            }
            if (updateCustomerDto.email) {
                const existingEmail = await prisma.customer.findFirst({
                    where: { email: updateCustomerDto.email, id: { not: existing.id }, deletedAt: null },
                });
                if (existingEmail) {
                    throw new common_1.BadRequestException('Email sudah digunakan.');
                }
            }
            const data = { ...updateCustomerDto, updatedBy };
            if (updateCustomerDto.dateOfBirth) {
                data.dateOfBirth = new Date(updateCustomerDto.dateOfBirth);
            }
            const customer = await prisma.customer.update({
                where: { id: existing.id },
                data,
            });
            return { message: 'Pelanggan berhasil diupdate.', data: new customer_resource_1.CustomerResource(customer) };
        });
    }
    async remove(uuid, deletedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.customer.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Pelanggan tidak ditemukan.');
            }
            await prisma.customer.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });
            return { message: 'Pelanggan berhasil dihapus.', data: {} };
        });
    }
    async addLoyaltyPoints(uuid, points, updatedBy) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.customer.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Pelanggan tidak ditemukan.');
            }
            const newPoints = existing.loyaltyPoints + points;
            if (newPoints < 0) {
                throw new common_1.BadRequestException('Loyalty points tidak mencukupi.');
            }
            const customer = await prisma.customer.update({
                where: { id: existing.id },
                data: { loyaltyPoints: newPoints, updatedBy },
            });
            return { message: 'Loyalty points berhasil diupdate.', data: new customer_resource_1.CustomerResource(customer) };
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map