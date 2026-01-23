"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function check() {
    const users = await prisma.user.findMany({
        where: { email: 'admin@example.com' },
        include: {
            userRoles: {
                include: { role: true }
            }
        }
    });
    console.log('--- ADMIN USERS ---');
    console.dir(users, { depth: null });
    const roles = await prisma.role.findMany();
    console.log('--- ALL ROLES ---');
    console.dir(roles, { depth: null });
}
check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-db.js.map