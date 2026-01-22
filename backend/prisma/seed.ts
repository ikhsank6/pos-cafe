import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Create roles for Cafe POS
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

  // Create admin/owner user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Upsert admin user
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

  // Check if UserRole exists, if not create it
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

  // Create menus for Cafe POS
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

  // Create menu access for owner (full access)
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

  // Create dashboard access for other roles
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
