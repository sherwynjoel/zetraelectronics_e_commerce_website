import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Admin User
  await prisma.user.upsert({
    where: { email: 'admin@zetraelectronics.com' },
    update: {},
    create: {
      email: 'admin@zetraelectronics.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // 2. Create Categories
  const categories = ['Electronics', 'Accessories', 'Components'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description: `High quality ${name}` },
    });
  }

  console.log('✅ Admin User Created: admin@zetraelectronics.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
