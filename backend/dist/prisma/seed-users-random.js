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
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        try {
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
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: randomRole.id,
                    createdBy: 'Seeder',
                    updatedBy: 'Seeder',
                }
            });
            console.log(`[${i + 1}/50] Created user: ${fullName} (${username}) with role: ${randomRole.code}`);
        }
        catch (error) {
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
//# sourceMappingURL=seed-users-random.js.map