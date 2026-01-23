import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const firstNames = [
  'Budi', 'Siti', 'Agus', 'Lani', 'Eko', 'Dewi', 'Rudi', 'Maya', 'Iwan', 'Sari',
  'Andi', 'Rina', 'Doni', 'Siska', 'Tono', 'Ani', 'Heri', 'Mira', 'Joko', 'Yanti',
  'Ahmad', 'Nur', 'Sri', 'Wahyu', 'Putu', 'Made', 'Nyoman', 'Ketut', 'Gede', 'Luh',
  'Aris', 'Dian', 'Fajar', 'Gita', 'Hana', 'Indra', 'Jaya', 'Kadek', 'Lestari', 'Mulyono',
  'Ningsih', 'Oki', 'Prabowo', 'Qori', 'Ratna', 'Samsul', 'Tri', 'Utami', 'Vina', 'Wawan'
];

const lastNames = [
  'Santoso', 'Wijaya', 'Saputra', 'Lestari', 'Pratama', 'Kusuma', 'Hidayat', 'Putri', 'Sari', 'Susanto',
  'Gunawan', 'Setiawan', 'Nugroho', 'Wulandari', 'Purnama', 'Rahayu', 'Suherman', 'Anggraini', 'Budiman', 'Utomo',
  'Siregar', 'Nasution', 'Batubara', 'Pane', 'Hasibuan', 'Ginting', 'Sembiring', 'Tarigan', 'Sinaga', 'Simanjuntak',
  'Tanjung', 'Chaniago', 'Piliang', 'Sani', 'Malik', 'Basri', 'Harahap', 'Lubis', 'Pasaribu', 'Ritonga',
  'Alatas', 'Assegaf', 'Baabud', 'Alhabsyi', 'Alaydrus', 'Alkaff', 'Bin Smith', 'Syihab', 'Alhaddad', 'Almadi'
];

async function main() {
  console.log('Generating 50 random user accounts...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Get available roles except OWNER
  const roles = await prisma.role.findMany({
    where: {
      code: {
        in: ['MANAGER', 'CASHIER', 'KITCHEN', 'WAITER']
      }
    }
  });

  if (roles.length === 0) {
    console.error('No roles found in database. Please run the main seed first.');
    return;
  }

  const usersCount = 50;
  
  for (let i = 0; i < usersCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}${Math.floor(100 + Math.random() * 900)}${i}`;
    const email = `${username}@example.com`;
    
    // Pick a random role
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    try {
      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
          isActive: true,
          verifiedAt: new Date(),
          createdBy: 'Seeder',
          updatedBy: 'Seeder',
        }
      });

      // Assign role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: randomRole.id,
          createdBy: 'Seeder',
          updatedBy: 'Seeder',
        }
      });

      console.log(`[${i+1}/50] Created user: ${fullName} (${username}) with role: ${randomRole.code}`);
    } catch (error) {
      console.error(`Failed to create user ${username}:`, error.message);
    }
  }

  console.log('Successfully generated 50 random users!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
