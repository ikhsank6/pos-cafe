import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settingsCount = await prisma.taxSetting.count();
  console.log('Settings count:', settingsCount);
  
  if (settingsCount === 0) {
    console.log('Seeding default settings...');
    await prisma.taxSetting.createMany({
      data: [
        { key: 'tax_enabled', value: 'false' },
        { key: 'tax_rate', value: '0' },
      ],
    });
  }

  const menus = await prisma.menu.findMany({
    where: { path: '/admin/settings' }
  });
  
  if (menus.length === 0) {
    console.log('Adding Settings menu...');
    // Find a parent or just add to root
    await prisma.menu.create({
      data: {
        name: 'Pengaturan Pajak',
        path: '/admin/settings',
        icon: 'Percent',
        order: 100,
        isActive: true,
      }
    });
  } else {
    // Update existing menu name
    await prisma.menu.updateMany({
        where: { path: '/admin/settings' },
        data: { name: 'Pengaturan Pajak', icon: 'Percent' }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
