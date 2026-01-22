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
exports.MenuAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const menu_access_resource_1 = require("./resources/menu-access.resource");
let MenuAccessService = class MenuAccessService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByRole(roleUuid) {
        const role = await this.prisma.role.findFirst({ where: { uuid: roleUuid, deletedAt: null } });
        if (!role) {
            throw new common_1.NotFoundException('Role tidak ditemukan.');
        }
        const menuAccess = await this.prisma.menuAccess.findMany({
            where: { roleId: role.id, deletedAt: null },
            include: { menu: true },
            orderBy: { menu: { order: 'asc' } },
        });
        return { message: 'Success', data: menu_access_resource_1.MenuAccessResource.collection(menuAccess) };
    }
    async getAccessibleMenus(roleId) {
        const menuAccess = await this.prisma.menuAccess.findMany({
            where: { roleId, deletedAt: null },
            include: {
                menu: {
                    include: {
                        children: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        const accessibleMenuIds = menuAccess.map((ma) => ma.menuId);
        const rootMenus = await this.prisma.menu.findMany({
            where: {
                parentId: null,
                isActive: true,
                id: { in: accessibleMenuIds },
                deletedAt: null,
            },
            include: {
                children: {
                    where: {
                        isActive: true,
                        id: { in: accessibleMenuIds },
                        deletedAt: null,
                    },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
        return { message: 'Success', data: rootMenus };
    }
    async create(createMenuAccessDto) {
        return this.prisma.$transaction(async (prisma) => {
            const role = await prisma.role.findFirst({
                where: { uuid: createMenuAccessDto.roleUuid, deletedAt: null },
            });
            if (!role)
                throw new common_1.NotFoundException('Role tidak ditemukan');
            const menu = await prisma.menu.findFirst({
                where: { uuid: createMenuAccessDto.menuUuid, deletedAt: null },
            });
            if (!menu)
                throw new common_1.NotFoundException('Menu tidak ditemukan');
            const existing = await prisma.menuAccess.findFirst({
                where: {
                    roleId: role.id,
                    menuId: menu.id,
                    deletedAt: null,
                },
            });
            if (existing) {
                throw new common_1.BadRequestException('Menu access sudah ada.');
            }
            const menuAccess = await prisma.menuAccess.create({
                data: {
                    roleId: role.id,
                    menuId: menu.id,
                },
                include: { menu: true, role: true },
            });
            return { message: 'Menu access berhasil dibuat.', data: new menu_access_resource_1.MenuAccessResource(menuAccess) };
        });
    }
    async update(uuid, updateMenuAccessDto) {
        const existing = await this.prisma.menuAccess.findFirst({ where: { uuid, deletedAt: null } });
        if (!existing) {
            throw new common_1.NotFoundException('Menu access tidak ditemukan.');
        }
        if (updateMenuAccessDto.menuUuid) {
            const menu = await this.prisma.menu.findFirst({ where: { uuid: updateMenuAccessDto.menuUuid, deletedAt: null } });
            if (!menu)
                throw new common_1.NotFoundException('Menu tidak ditemukan');
            const menuAccess = await this.prisma.menuAccess.update({
                where: { id: existing.id },
                data: { menuId: menu.id },
                include: { menu: true, role: true },
            });
            return { message: 'Menu access berhasil diupdate.', data: new menu_access_resource_1.MenuAccessResource(menuAccess) };
        }
        return { message: 'Menu access berhasil diupdate.', data: new menu_access_resource_1.MenuAccessResource(existing) };
    }
    async bulkUpdate(bulkDto) {
        const { roleUuid, menuUuids } = bulkDto;
        return this.prisma.$transaction(async (prisma) => {
            const role = await prisma.role.findFirst({ where: { uuid: roleUuid, deletedAt: null } });
            if (!role) {
                throw new common_1.NotFoundException('Role tidak ditemukan.');
            }
            const menus = await prisma.menu.findMany({
                where: { uuid: { in: menuUuids }, deletedAt: null },
            });
            const menuIds = menus.map(m => m.id);
            await prisma.menuAccess.deleteMany({ where: { roleId: role.id } });
            const data = menuIds.map((menuId) => ({
                roleId: role.id,
                menuId,
            }));
            if (data.length > 0) {
                await prisma.menuAccess.createMany({ data });
            }
            return { message: 'Menu access berhasil diupdate.', data: {} };
        });
    }
    async remove(uuid) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.menuAccess.findFirst({ where: { uuid, deletedAt: null } });
            if (!existing) {
                throw new common_1.NotFoundException('Menu access tidak ditemukan.');
            }
            await prisma.menuAccess.delete({ where: { id: existing.id } });
            return { message: 'Menu access berhasil dihapus.', data: {} };
        });
    }
};
exports.MenuAccessService = MenuAccessService;
exports.MenuAccessService = MenuAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuAccessService);
//# sourceMappingURL=menu-access.service.js.map