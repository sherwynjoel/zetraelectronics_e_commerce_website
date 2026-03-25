const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emailToDelete = 'admin@zetraelectronics.com';

    const existingAdmin = await prisma.user.findUnique({ where: { email: emailToDelete } });

    if (existingAdmin) {
        // First delete any order items associated with this user's orders
        await prisma.orderItem.deleteMany({
            where: {
                order: {
                    userId: existingAdmin.id
                }
            }
        });

        // Then delete the user's orders
        await prisma.order.deleteMany({
            where: {
                userId: existingAdmin.id
            }
        });

        // Finally, delete the user
        await prisma.user.delete({
            where: { email: emailToDelete }
        });
        console.log(`✅ Successfully deleted user and related records: ${emailToDelete}`);
    } else {
        console.log(`ℹ️ User ${emailToDelete} not found in the database.`);
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
