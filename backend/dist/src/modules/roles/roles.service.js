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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const role_resource_1 = require("./resources/role.resource");
let RolesService = class RolesService {
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
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [roles, total] = await Promise.all([
            this.prisma.role.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.role.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResponse)(role_resource_1.RoleResource.collection(roles), total, page, limit);
    }
    async findOne(uuid) {
        const role = await this.prisma.role.findFirst({
            where: { uuid, deletedAt: null },
            include: { menuAccess: { include: { menu: true } } },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role tidak ditemukan.');
        }
        return { message: 'Success', data: new role_resource_1.RoleResource(role) };
    }
    async create(createRoleDto) {
        return this.prisma.$transaction(async (prisma) => {
            const existingRole = await prisma.role.findFirst({
                where: { name: createRoleDto.name, deletedAt: null },
            });
            if (existingRole) {
                throw new common_1.BadRequestException('Nama role sudah ada.');
            }
            const existingCode = await prisma.role.findFirst({
                where: { code: createRoleDto.code, deletedAt: null },
            });
            if (existingCode) {
                throw new common_1.BadRequestException('Kode role sudah ada.');
            }
            const role = await prisma.role.create({
                data: {
                    name: createRoleDto.name,
                    code: createRoleDto.code,
                    description: createRoleDto.description,
                    isActive: createRoleDto.isActive ?? true,
                }
            });
            return { message: 'Role berhasil dibuat.', data: new role_resource_1.RoleResource(role) };
        });
    }
    async update(uuid, updateRoleDto) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.role.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Role tidak ditemukan.');
            }
            if (updateRoleDto.name) {
                const existingRole = await prisma.role.findFirst({
                    where: { name: updateRoleDto.name, id: { not: existing.id }, deletedAt: null },
                });
                if (existingRole) {
                    throw new common_1.BadRequestException('Nama role sudah digunakan.');
                }
            }
            if (updateRoleDto.code) {
                const existingCode = await prisma.role.findFirst({
                    where: { code: updateRoleDto.code, id: { not: existing.id }, deletedAt: null },
                });
                if (existingCode) {
                    throw new common_1.BadRequestException('Kode role sudah digunakan.');
                }
            }
            const role = await prisma.role.update({
                where: { id: existing.id },
                data: updateRoleDto,
            });
            return { message: 'Role berhasil diupdate.', data: new role_resource_1.RoleResource(role) };
        });
    }
    async remove(uuid) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.role.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Role tidak ditemukan.');
            }
            const usersWithRole = await prisma.userRole.count({
                where: { roleId: existing.id, deletedAt: null },
            });
            if (usersWithRole > 0) {
                throw new common_1.BadRequestException('Role masih digunakan oleh user.');
            }
            await prisma.role.update({
                where: { id: existing.id },
                data: { deletedAt: new Date() },
            });
            return { message: 'Role berhasil dihapus.', data: {} };
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map