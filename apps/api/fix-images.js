const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImages() {
  console.log('🔧 Fixing broken product images...');

  // Fix Smartphone Z Fold image
  await prisma.product.updateMany({
    where: { name: 'Smartphone Z Fold' },
    data: {
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    },
  });
  console.log('✅ Fixed Smartphone Z Fold image');

  // Fix Wireless Mechanical Keyboard image
  await prisma.product.updateMany({
    where: { name: 'Wireless Mechanical Keyboard' },
    data: {
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
    },
  });
  console.log('✅ Fixed Wireless Mechanical Keyboard image');

  console.log('🎉 All images fixed!');
  await prisma.$disconnect();
}

fixImages().catch(e => { console.error(e); process.exit(1); });
