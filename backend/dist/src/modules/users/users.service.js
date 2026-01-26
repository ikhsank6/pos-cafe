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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const hash_util_1 = require("../../common/utils/hash.util");
const pagination_util_1 = require("../../common/utils/pagination.util");
const queue_service_1 = require("../queue/queue.service");
const uuid_1 = require("uuid");
const user_resource_1 = require("./resources/user.resource");
let UsersService = class UsersService {
    prisma;
    queueService;
    constructor(prisma, queueService) {
        this.prisma = prisma;
        this.queueService = queueService;
    }
    async findAll(page = 1, limit = 10, search, isActive) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    userRoles: {
                        include: { role: true },
                        where: { deletedAt: null }
                    },
                    activeRole: true
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(user_resource_1.UserResource.collection(users), total, page, limit);
    }
    async findOne(uuid) {
        const user = await this.prisma.user.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                userRoles: {
                    include: { role: true },
                    where: { deletedAt: null }
                },
                activeRole: true
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User tidak ditemukan.');
        }
        return { message: 'Success', data: new user_resource_1.UserResource(user) };
    }
    async findById(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: {
                userRoles: {
                    include: { role: true },
                    where: { deletedAt: null }
                },
                activeRole: true
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User tidak ditemukan.');
        }
        return { message: 'Success', data: new user_resource_1.UserResource(user) };
    }
    async create(createUserDto, currentUserId) {
        return this.prisma.$transaction(async (prisma) => {
            const existingEmail = await prisma.user.findFirst({
                where: { email: createUserDto.email, deletedAt: null },
            });
            if (existingEmail) {
                throw new common_1.BadRequestException('Email sudah terdaftar.');
            }
            const existingUsername = await prisma.user.findFirst({
                where: { username: createUserDto.username, deletedAt: null },
            });
            if (existingUsername) {
                throw new common_1.BadRequestException('Username sudah terdaftar.');
            }
            const roleIds = [];
            if (createUserDto.roleUuids && createUserDto.roleUuids.length > 0) {
                for (const roleUuid of createUserDto.roleUuids) {
                    const role = await prisma.role.findFirst({
                        where: { uuid: roleUuid, deletedAt: null },
                    });
                    if (!role) {
                        throw new common_1.BadRequestException(`Role dengan UUID ${roleUuid} tidak ditemukan.`);
                    }
                    roleIds.push(role.id);
                }
            }
            if (roleIds.length === 0) {
                throw new common_1.BadRequestException('roleUuids harus diisi minimal 1 role.');
            }
            const isActive = createUserDto.isActive ?? false;
            let temporaryPassword = undefined;
            let passwordToHash = createUserDto.password;
            if (!passwordToHash) {
                temporaryPassword = Math.random().toString(36).slice(-8) +
                    Math.random().toString(36).toUpperCase().slice(-2) +
                    "@1";
                passwordToHash = temporaryPassword;
            }
            const hashedPassword = await (0, hash_util_1.hashPassword)(passwordToHash);
            const verificationToken = !isActive ? (0, uuid_1.v4)() : null;
            const { roleUuids, ...dataWithoutRoleUuids } = createUserDto;
            const user = await prisma.user.create({
                data: {
                    username: dataWithoutRoleUuids.username,
                    email: dataWithoutRoleUuids.email,
                    fullName: dataWithoutRoleUuids.fullName,
                    phone: dataWithoutRoleUuids.phone,
                    password: hashedPassword,
                    isActive,
                    verifiedAt: isActive ? new Date() : null,
                    verificationToken,
                    activeRoleId: roleIds[0],
                },
            });
            for (const roleId of roleIds) {
                await prisma.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: roleId,
                    },
                });
            }
            const userWithRoles = await prisma.user.findFirst({
                where: { id: user.id },
                include: {
                    userRoles: {
                        include: { role: true },
                        where: { deletedAt: null }
                    },
                    activeRole: true
                },
            });
            if (!isActive && verificationToken) {
                await this.queueService.addVerificationEmailJob({
                    email: user.email,
                    name: user.fullName,
                    verificationToken,
                    createdAt: user.createdAt.toISOString(),
                    temporaryPassword,
                });
            }
            return {
                message: isActive
                    ? 'User berhasil dibuat.'
                    : 'User berhasil dibuat. Email verifikasi telah dikirim.',
                data: new user_resource_1.UserResource(userWithRoles)
            };
        });
    }
    async update(uuid, updateUserDto) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.user.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('User tidak ditemukan.');
            }
            if (updateUserDto.email) {
                const existingUser = await prisma.user.findFirst({
                    where: { email: updateUserDto.email, id: { not: existing.id }, deletedAt: null },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Email sudah digunakan.');
                }
            }
            if (updateUserDto.username) {
                const existingUser = await prisma.user.findFirst({
                    where: { username: updateUserDto.username, id: { not: existing.id }, deletedAt: null },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Username sudah digunakan.');
                }
            }
            const roleIds = [];
            if (updateUserDto.roleUuids && updateUserDto.roleUuids.length > 0) {
                for (const roleUuid of updateUserDto.roleUuids) {
                    const role = await prisma.role.findFirst({
                        where: { uuid: roleUuid, deletedAt: null },
                    });
                    if (!role) {
                        throw new common_1.BadRequestException(`Role dengan UUID ${roleUuid} tidak ditemukan.`);
                    }
                    roleIds.push(role.id);
                }
            }
            const { roleUuids, ...dataWithoutRoleUuids } = updateUserDto;
            const data = { ...dataWithoutRoleUuids };
            if (updateUserDto.name) {
                data.fullName = updateUserDto.name;
                delete data.name;
            }
            if (updateUserDto.password) {
                data.password = await (0, hash_util_1.hashPassword)(updateUserDto.password);
            }
            if (roleIds.length > 0) {
                await prisma.userRole.deleteMany({
                    where: { userId: existing.id },
                });
                for (const roleId of roleIds) {
                    await prisma.userRole.create({
                        data: {
                            userId: existing.id,
                            roleId: roleId,
                        },
                    });
                }
                if (!roleIds.includes(existing.activeRoleId ?? -1)) {
                    data.activeRoleId = roleIds[0];
                }
            }
            const user = await prisma.user.update({
                where: { id: existing.id },
                data,
            });
            const userWithRoles = await prisma.user.findFirst({
                where: { id: user.id },
                include: {
                    userRoles: {
                        include: { role: true },
                        where: { deletedAt: null }
                    },
                    activeRole: true
                },
            });
            return { message: 'User berhasil diupdate.', data: new user_resource_1.UserResource(userWithRoles) };
        });
    }
    async remove(uuid) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.user.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('User tidak ditemukan.');
            }
            await prisma.user.update({
                where: { id: existing.id },
                data: { deletedAt: new Date() },
            });
            return { message: 'User berhasil dihapus.', data: {} };
        });
    }
    async resendVerificationEmail(uuid) {
        return this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!user) {
                throw new common_1.NotFoundException('User tidak ditemukan.');
            }
            if (user.verifiedAt) {
                throw new common_1.BadRequestException('User sudah terverifikasi.');
            }
            const verificationToken = (0, uuid_1.v4)();
            await prisma.user.update({
                where: { id: user.id },
                data: { verificationToken },
            });
            await this.queueService.addVerificationEmailJob({
                email: user.email,
                name: user.fullName,
                verificationToken,
                createdAt: user.createdAt.toISOString(),
            });
            return {
                message: 'Email verifikasi telah dikirim ulang.',
                data: {}
            };
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], UsersService);
//# sourceMappingURL=users.service.js.map