import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Available Prisma Models:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
  
  try {
    const orders = await prisma.order.findMany({ take: 1 });
    console.log('Order fields:', Object.keys(orders[0] || {}));
  } catch (err) {
    console.error('Order query failed:', err);
  }
}

main();
