import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { CustomerResource } from './resources/customer.resource';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 10, search?: string) {
        const skip = calculateSkip(page, limit);

        const where: any = { deletedAt: null };

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

        return buildPaginatedResponse(
            CustomerResource.collection(customers),
            total,
            page,
            limit,
        );
    }

    async findOne(uuid: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                _count: {
                    select: { orders: { where: { deletedAt: null } } }
                }
            }
        });

        if (!customer) {
            throw new NotFoundException('Pelanggan tidak ditemukan.');
        }

        return { message: 'Success', data: new CustomerResource(customer) };
    }

    async findByPhone(phone: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { phone, deletedAt: null },
        });

        if (!customer) {
            throw new NotFoundException('Pelanggan tidak ditemukan.');
        }

        return { message: 'Success', data: new CustomerResource(customer) };
    }

    async create(createCustomerDto: CreateCustomerDto, createdBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            // Check phone uniqueness
            const existingPhone = await prisma.customer.findFirst({
                where: { phone: createCustomerDto.phone, deletedAt: null },
            });

            if (existingPhone) {
                throw new BadRequestException('Nomor telepon sudah terdaftar.');
            }

            // Check email uniqueness if provided
            if (createCustomerDto.email) {
                const existingEmail = await prisma.customer.findFirst({
                    where: { email: createCustomerDto.email, deletedAt: null },
                });
                if (existingEmail) {
                    throw new BadRequestException('Email sudah terdaftar.');
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

            return { message: 'Pelanggan berhasil dibuat.', data: new CustomerResource(customer) };
        });
    }

    async update(uuid: string, updateCustomerDto: UpdateCustomerDto, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.customer.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Pelanggan tidak ditemukan.');
            }

            // Check phone uniqueness if updating
            if (updateCustomerDto.phone) {
                const existingPhone = await prisma.customer.findFirst({
                    where: { phone: updateCustomerDto.phone, id: { not: existing.id }, deletedAt: null },
                });
                if (existingPhone) {
                    throw new BadRequestException('Nomor telepon sudah digunakan.');
                }
            }

            // Check email uniqueness if updating
            if (updateCustomerDto.email) {
                const existingEmail = await prisma.customer.findFirst({
                    where: { email: updateCustomerDto.email, id: { not: existing.id }, deletedAt: null },
                });
                if (existingEmail) {
                    throw new BadRequestException('Email sudah digunakan.');
                }
            }

            const data: any = { ...updateCustomerDto, updatedBy };
            if (updateCustomerDto.dateOfBirth) {
                data.dateOfBirth = new Date(updateCustomerDto.dateOfBirth);
            }

            const customer = await prisma.customer.update({
                where: { id: existing.id },
                data,
            });

            return { message: 'Pelanggan berhasil diupdate.', data: new CustomerResource(customer) };
        });
    }

    async remove(uuid: string, deletedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.customer.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Pelanggan tidak ditemukan.');
            }

            await prisma.customer.update({
                where: { id: existing.id },
                data: { deletedAt: new Date(), deletedBy },
            });

            return { message: 'Pelanggan berhasil dihapus.', data: {} };
        });
    }

    async addLoyaltyPoints(uuid: string, points: number, updatedBy?: string) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.customer.findFirst({
                where: { uuid, deletedAt: null },
            });

            if (!existing) {
                throw new NotFoundException('Pelanggan tidak ditemukan.');
            }

            const newPoints = existing.loyaltyPoints + points;
            if (newPoints < 0) {
                throw new BadRequestException('Loyalty points tidak mencukupi.');
            }

            const customer = await prisma.customer.update({
                where: { id: existing.id },
                data: { loyaltyPoints: newPoints, updatedBy },
            });

            return { message: 'Loyalty points berhasil diupdate.', data: new CustomerResource(customer) };
        });
    }
}
