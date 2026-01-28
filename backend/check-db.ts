import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const tableExists = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tax_settings')`;
    console.log('tax_settings table exists:', tableExists);
    
    const settings = await prisma.taxSetting.findMany();
    console.log('Settings in DB:', settings);
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
