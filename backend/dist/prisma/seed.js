"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    const ownerRole = await prisma.role.upsert({
        where: { code: 'OWNER' },
        update: {},
        create: {
            name: 'Owner',
            code: 'OWNER',
            description: 'Pemilik cafe dengan akses penuh',
            isActive: true,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const managerRole = await prisma.role.upsert({
        where: { code: 'MANAGER' },
        update: {},
        create: {
            name: 'Manager',
            code: 'MANAGER',
            description: 'Manager yang mengelola operasional cafe',
            isActive: true,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const cashierRole = await prisma.role.upsert({
        where: { code: 'CASHIER' },
        update: {},
        create: {
            name: 'Cashier',
            code: 'CASHIER',
            description: 'Kasir yang melayani pembayaran',
            isActive: true,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const kitchenRole = await prisma.role.upsert({
        where: { code: 'KITCHEN' },
        update: {},
        create: {
            name: 'Kitchen',
            code: 'KITCHEN',
            description: 'Staff dapur yang menyiapkan pesanan',
            isActive: true,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const waiterRole = await prisma.role.upsert({
        where: { code: 'WAITER' },
        update: {},
        create: {
            name: 'Waiter',
            code: 'WAITER',
            description: 'Pelayan yang melayani customer',
            isActive: true,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {
            username: 'admin',
            fullName: 'Administrator',
            isActive: true,
            verifiedAt: new Date(),
            updatedBy: 'System',
        },
        create: {
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            fullName: 'Administrator',
            isActive: true,
            verifiedAt: new Date(),
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const existingUserRole = await prisma.userRole.findFirst({
        where: {
            userId: adminUser.id,
            roleId: ownerRole.id,
            deletedAt: null,
        },
    });
    if (!existingUserRole) {
        await prisma.userRole.create({
            data: {
                userId: adminUser.id,
                roleId: ownerRole.id,
                createdBy: 'System',
                updatedBy: 'System',
            },
        });
    }
    const dashboardMenu = await prisma.menu.upsert({
        where: { id: 1 },
        update: {
            path: '/admin/dashboard',
        },
        create: {
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: 'LayoutDashboard',
            order: 1,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const masterMenu = await prisma.menu.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Master Data',
            icon: 'Database',
            order: 2,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const usersMenu = await prisma.menu.upsert({
        where: { id: 3 },
        update: {
            path: '/admin/master-data/users',
        },
        create: {
            name: 'Users',
            path: '/admin/master-data/users',
            icon: 'Users',
            parentId: masterMenu.id,
            order: 1,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const rolesMenu = await prisma.menu.upsert({
        where: { id: 4 },
        update: {
            path: '/admin/master-data/roles',
        },
        create: {
            name: 'Roles',
            path: '/admin/master-data/roles',
            icon: 'Shield',
            parentId: masterMenu.id,
            order: 2,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const menusMenu = await prisma.menu.upsert({
        where: { id: 5 },
        update: {
            path: '/admin/master-data/menus',
        },
        create: {
            name: 'Menus',
            path: '/admin/master-data/menus',
            icon: 'Menu',
            parentId: masterMenu.id,
            order: 3,
            createdBy: 'System',
            updatedBy: 'System',
        },
    });
    const menus = [
        dashboardMenu,
        masterMenu,
        usersMenu,
        rolesMenu,
        menusMenu,
    ];
    for (const menu of menus) {
        await prisma.menuAccess.upsert({
            where: {
                roleId_menuId: {
                    roleId: ownerRole.id,
                    menuId: menu.id,
                },
            },
            update: {},
            create: {
                roleId: ownerRole.id,
                menuId: menu.id,
                createdBy: 'System',
                updatedBy: 'System',
            },
        });
    }
    const otherRoles = [managerRole, cashierRole, kitchenRole, waiterRole];
    for (const role of otherRoles) {
        await prisma.menuAccess.upsert({
            where: {
                roleId_menuId: {
                    roleId: role.id,
                    menuId: dashboardMenu.id,
                },
            },
            update: {},
            create: {
                roleId: role.id,
                menuId: dashboardMenu.id,
                createdBy: 'System',
                updatedBy: 'System',
            },
        });
    }
    console.log('Database seeded successfully for Cafe POS!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map