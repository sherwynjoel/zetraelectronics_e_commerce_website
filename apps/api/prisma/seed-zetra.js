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

    // Create a Test Customer for Razorpay Review/Testing
    const customerEmail = 'test@zetra.com';
    const customerPassword = 'Zetra@Test123';
    const existingCustomer = await prisma.user.findUnique({ where: { email: customerEmail } });

    if (!existingCustomer) {
        const hashedCustomerPassword = await bcrypt.hash(customerPassword, 10);
        await prisma.user.create({
            data: {
                email: customerEmail,
                password: hashedCustomerPassword,
                name: 'Test Customer',
                role: 'USER',
            },
        });
        console.log(`✅ Created Test Customer: ${customerEmail}`);
    } else {
        const hashedCustomerPassword = await bcrypt.hash(customerPassword, 10);
        await prisma.user.update({
            where: { email: customerEmail },
            data: {
                password: hashedCustomerPassword,
                role: 'USER',
            }
        });
        console.log(`✅ Reset Test Customer credentials: ${customerEmail}`);
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
