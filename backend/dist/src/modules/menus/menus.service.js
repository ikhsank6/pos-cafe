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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const menu_resource_1 = require("./resources/menu.resource");
let MenusService = class MenusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const whereCondition = { deletedAt: null };
        if (query) {
            whereCondition.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { path: { contains: query, mode: 'insensitive' } },
            ];
        }
        const menus = await this.prisma.menu.findMany({
            where: whereCondition,
            include: {
                parent: true,
                children: {
                    where: { deletedAt: null },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
        const sortedMenus = [];
        const rootMenus = menus.filter((m) => !m.parentId);
        const childMenuMap = new Map();
        for (const menu of menus) {
            if (menu.parentId) {
                if (!childMenuMap.has(menu.parentId)) {
                    childMenuMap.set(menu.parentId, []);
                }
                childMenuMap.get(menu.parentId).push(menu);
            }
        }
        for (const parent of rootMenus) {
            sortedMenus.push(parent);
            const children = childMenuMap.get(parent.id) || [];
            children.sort((a, b) => a.order - b.order);
            for (const child of children) {
                sortedMenus.push(child);
            }
        }
        return { message: 'Success', data: menu_resource_1.MenuResource.collection(sortedMenus) };
    }
    async getTree() {
        const menus = await this.prisma.menu.findMany({
            where: { parentId: null, deletedAt: null },
            include: {
                children: {
                    where: { deletedAt: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            where: { deletedAt: null },
                            orderBy: { order: 'asc' },
                            include: {
                                children: {
                                    where: { deletedAt: null },
                                    orderBy: { order: 'asc' },
                                }
                            }
                        }
                    }
                },
            },
            orderBy: { order: 'asc' },
        });
        return { message: 'Success', data: menu_resource_1.MenuResource.collection(menus) };
    }
    async findOne(uuid) {
        const menu = await this.prisma.menu.findFirst({
            where: { uuid, deletedAt: null },
            include: {
                children: { where: { deletedAt: null } },
                parent: true,
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException('Menu tidak ditemukan.');
        }
        return { message: 'Success', data: new menu_resource_1.MenuResource(menu) };
    }
    async create(createMenuDto) {
        return this.prisma.$transaction(async (prisma) => {
            if (createMenuDto.parentUuid) {
                const parent = await prisma.menu.findFirst({
                    where: { uuid: createMenuDto.parentUuid, deletedAt: null },
                });
                if (!parent) {
                    throw new common_1.BadRequestException('Parent menu tidak ditemukan.');
                }
                const { parentUuid, ...dataWithoutParentUuid } = createMenuDto;
                const menu = await prisma.menu.create({
                    data: {
                        ...dataWithoutParentUuid,
                        parentId: parent.id,
                    },
                    include: { parent: true },
                });
                return { message: 'Menu berhasil dibuat.', data: new menu_resource_1.MenuResource(menu) };
            }
            const { parentUuid, ...data } = createMenuDto;
            const menu = await prisma.menu.create({
                data: data,
                include: { parent: true },
            });
            return { message: 'Menu berhasil dibuat.', data: new menu_resource_1.MenuResource(menu) };
        });
    }
    async update(uuid, updateMenuDto) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.menu.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Menu tidak ditemukan.');
            }
            let parentId = undefined;
            if (updateMenuDto.parentUuid !== undefined) {
                if (updateMenuDto.parentUuid === null) {
                    parentId = null;
                }
                else if (updateMenuDto.parentUuid === uuid) {
                    throw new common_1.BadRequestException('Menu tidak bisa menjadi parent sendiri.');
                }
                else {
                    const parent = await prisma.menu.findFirst({
                        where: { uuid: updateMenuDto.parentUuid, deletedAt: null },
                    });
                    if (!parent) {
                        throw new common_1.BadRequestException('Parent menu tidak ditemukan.');
                    }
                    parentId = parent.id;
                }
            }
            const { parentUuid, ...dataWithoutParentUuid } = updateMenuDto;
            const menu = await prisma.menu.update({
                where: { id: existing.id },
                data: {
                    ...dataWithoutParentUuid,
                    ...(parentId !== undefined && { parentId }),
                },
                include: { parent: true },
            });
            return { message: 'Menu berhasil diupdate.', data: new menu_resource_1.MenuResource(menu) };
        });
    }
    async remove(uuid) {
        return this.prisma.$transaction(async (prisma) => {
            const existing = await prisma.menu.findFirst({
                where: { uuid, deletedAt: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Menu tidak ditemukan.');
            }
            const children = await prisma.menu.count({
                where: { parentId: existing.id, deletedAt: null },
            });
            if (children > 0) {
                throw new common_1.BadRequestException('Menu masih memiliki child menu.');
            }
            await prisma.menu.update({
                where: { id: existing.id },
                data: { deletedAt: new Date() },
            });
            return { message: 'Menu berhasil dihapus.', data: {} };
        });
    }
    async reorder(reorderMenusDto) {
        return this.prisma.$transaction(async (prisma) => {
            const results = [];
            const { items } = reorderMenusDto;
            for (const item of items) {
                const menu = await prisma.menu.findFirst({
                    where: { uuid: item.uuid, deletedAt: null },
                });
                if (!menu) {
                    throw new common_1.NotFoundException(`Menu dengan UUID ${item.uuid} tidak ditemukan.`);
                }
                let parentId = undefined;
                if (item.parentUuid !== undefined) {
                    if (item.parentUuid === null) {
                        parentId = null;
                    }
                    else if (item.parentUuid === item.uuid) {
                        throw new common_1.BadRequestException(`Menu ${item.uuid} tidak bisa menjadi parent sendiri.`);
                    }
                    else {
                        const parent = await prisma.menu.findFirst({
                            where: { uuid: item.parentUuid, deletedAt: null },
                        });
                        if (!parent) {
                            throw new common_1.BadRequestException(`Parent menu ${item.parentUuid} tidak ditemukan.`);
                        }
                        parentId = parent.id;
                    }
                }
                const updatedMenu = await prisma.menu.update({
                    where: { id: menu.id },
                    data: {
                        order: item.order,
                        ...(parentId !== undefined && { parentId }),
                    },
                });
                results.push(updatedMenu);
            }
            return { message: 'Menu berhasil di-reorder.', data: menu_resource_1.MenuResource.collection(results) };
        });
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map