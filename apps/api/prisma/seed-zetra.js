const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@zetraelectronics.com';
    const plainPassword = 'Zetra@13122024';

    // Check if the user already exists
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Zetra Admin',
                role: 'ADMIN',
            },
        });
        console.log(`✅ Created Admin User: ${adminEmail}`);
    } else {
        // If the user exists, update their role to ADMIN and update their password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                password: hashedPassword,
                role: 'ADMIN',
            }
        });
        console.log(`✅ Updated existing user to Admin: ${adminEmail}`);
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
