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

  // ========================================
  // Create menus for Cafe POS
  // ========================================

  // 1. Dashboard
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

  // 2. Master Data (Parent)
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

  // 2.1 Users
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

  // 2.2 Roles
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

  // 2.3 Menus
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

  // 3. Product Management (Parent)
  const productManagementMenu = await prisma.menu.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: 'Produk',
      icon: 'Package',
      order: 3,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 3.1 Categories
  const categoriesMenu = await prisma.menu.upsert({
    where: { id: 7 },
    update: {
      path: '/admin/product-management/categories',
    },
    create: {
      name: 'Kategori',
      path: '/admin/product-management/categories',
      icon: 'FolderTree',
      parentId: productManagementMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 3.2 Products
  const productsMenu = await prisma.menu.upsert({
    where: { id: 8 },
    update: {
      path: '/admin/product-management/products',
    },
    create: {
      name: 'Produk',
      path: '/admin/product-management/products',
      icon: 'Coffee',
      parentId: productManagementMenu.id,
      order: 2,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 4. Table Management (Parent)
  const tableManagementMenu = await prisma.menu.upsert({
    where: { id: 9 },
    update: {},
    create: {
      name: 'Meja',
      icon: 'Armchair',
      order: 4,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 4.1 Tables
  const tablesMenu = await prisma.menu.upsert({
    where: { id: 10 },
    update: {
      path: '/admin/table-management/tables',
    },
    create: {
      name: 'Daftar Meja',
      path: '/admin/table-management/tables',
      icon: 'LayoutGrid',
      parentId: tableManagementMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 5. Customer Management (Parent)
  const customerManagementMenu = await prisma.menu.upsert({
    where: { id: 11 },
    update: {},
    create: {
      name: 'Pelanggan',
      icon: 'UserCheck',
      order: 5,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 5.1 Customers
  const customersMenu = await prisma.menu.upsert({
    where: { id: 12 },
    update: {
      path: '/admin/customer-management/customers',
    },
    create: {
      name: 'Daftar Pelanggan',
      path: '/admin/customer-management/customers',
      icon: 'Users',
      parentId: customerManagementMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 6. Discount Management (Parent)
  const discountManagementMenu = await prisma.menu.upsert({
    where: { id: 13 },
    update: {},
    create: {
      name: 'Diskon',
      icon: 'Percent',
      order: 6,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 6.1 Discounts
  const discountsMenu = await prisma.menu.upsert({
    where: { id: 14 },
    update: {
      path: '/admin/discount-management/discounts',
    },
    create: {
      name: 'Daftar Diskon',
      path: '/admin/discount-management/discounts',
      icon: 'Tag',
      parentId: discountManagementMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 7. Order Management (Parent)
  const orderManagementMenu = await prisma.menu.upsert({
    where: { id: 15 },
    update: {},
    create: {
      name: 'Pesanan',
      icon: 'ClipboardList',
      order: 7,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 7.1 Orders
  const ordersMenu = await prisma.menu.upsert({
    where: { id: 16 },
    update: {
      path: '/admin/order-management/orders',
    },
    create: {
      name: 'Daftar Pesanan',
      path: '/admin/order-management/orders',
      icon: 'Receipt',
      parentId: orderManagementMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 8. Transaction Management (Parent)
  const transactionManagementMenu = await prisma.menu.upsert({
    where: { id: 17 },
    update: {},
    create: {
      name: 'Transaksi',
      icon: 'Wallet',
      order: 8,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // 8.1 Transactions
  const transactionsMenu = await prisma.menu.upsert({
    where: { id: 18 },
    update: {
      path: '/admin/transaction-management/transactions',
    },
    create: {
      name: 'Riwayat Transaksi',
      path: '/admin/transaction-management/transactions',
      icon: 'CreditCard',
      parentId: transactionManagementMenu.id,
      order: 1,
      createdBy: 'System',
      updatedBy: 'System',
    },
  });

  // ========================================
  // Create menu access for owner (full access)
  // ========================================
  const allMenus = [
    dashboardMenu,
    masterMenu,
    usersMenu,
    rolesMenu,
    menusMenu,
    productManagementMenu,
    categoriesMenu,
    productsMenu,
    tableManagementMenu,
    tablesMenu,
    customerManagementMenu,
    customersMenu,
    discountManagementMenu,
    discountsMenu,
    orderManagementMenu,
    ordersMenu,
    transactionManagementMenu,
    transactionsMenu,
  ];

  for (const menu of allMenus) {
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

  // Give Manager access to POS features (except Master Data)
  const managerMenus = [
    productManagementMenu,
    categoriesMenu,
    productsMenu,
    tableManagementMenu,
    tablesMenu,
    customerManagementMenu,
    customersMenu,
    discountManagementMenu,
    discountsMenu,
    orderManagementMenu,
    ordersMenu,
    transactionManagementMenu,
    transactionsMenu,
  ];

  for (const menu of managerMenus) {
    await prisma.menuAccess.upsert({
      where: {
        roleId_menuId: {
          roleId: managerRole.id,
          menuId: menu.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        menuId: menu.id,
        createdBy: 'System',
        updatedBy: 'System',
      },
    });
  }

  // Give Cashier access to Orders and Transactions
  const cashierMenus = [
    orderManagementMenu,
    ordersMenu,
    transactionManagementMenu,
    transactionsMenu,
    customerManagementMenu,
    customersMenu,
  ];

  for (const menu of cashierMenus) {
    await prisma.menuAccess.upsert({
      where: {
        roleId_menuId: {
          roleId: cashierRole.id,
          menuId: menu.id,
        },
      },
      update: {},
      create: {
        roleId: cashierRole.id,
        menuId: menu.id,
        createdBy: 'System',
        updatedBy: 'System',
      },
    });
  }

  // Give Kitchen access to Orders only
  const kitchenMenus = [orderManagementMenu, ordersMenu];

  for (const menu of kitchenMenus) {
    await prisma.menuAccess.upsert({
      where: {
        roleId_menuId: {
          roleId: kitchenRole.id,
          menuId: menu.id,
        },
      },
      update: {},
      create: {
        roleId: kitchenRole.id,
        menuId: menu.id,
        createdBy: 'System',
        updatedBy: 'System',
      },
    });
  }

  // Give Waiter access to Orders and Tables
  const waiterMenus = [
    orderManagementMenu,
    ordersMenu,
    tableManagementMenu,
    tablesMenu,
  ];

  for (const menu of waiterMenus) {
    await prisma.menuAccess.upsert({
      where: {
        roleId_menuId: {
          roleId: waiterRole.id,
          menuId: menu.id,
        },
      },
      update: {},
      create: {
        roleId: waiterRole.id,
        menuId: menu.id,
        createdBy: 'System',
        updatedBy: 'System',
      },
    });
  }

  console.log('Database seeded successfully for Cafe POS!');
  console.log('Owner has access to all menus.');
  console.log('Manager has access to all POS features (except Master Data).');
  console.log('Cashier has access to Orders, Transactions, and Customers.');
  console.log('Kitchen has access to Orders only.');
  console.log('Waiter has access to Orders and Tables.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

