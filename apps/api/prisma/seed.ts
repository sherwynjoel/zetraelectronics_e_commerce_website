import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminEmail = 'admin@techuc.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created Admin User: ${adminEmail} / admin123`);
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // delete existing products to avoid duplicates if running multiple times
  // await prisma.product.deleteMany();

  const products = [
    {
      name: "UltraBook Pro X1",
      description: "The ultimate productivity machine with a 4K display, i9 processor, and 32GB RAM. Perfect for creative professionals.",
      price: 1999.99,
      stock: 50,
      category: "Laptops",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        processor: "Intel Core i9",
        ram: "32GB",
        storage: "1TB SSD",
        display: "15.6 inch 4K OLED"
      }),
      shippingCost: 25.00
    },
    {
      name: "Smartphone Z Fold",
      description: "Experience the future with a foldable display. 5G ready, triple camera system, and all-day battery life.",
      price: 1499.00,
      stock: 30,
      category: "Smartphones",
      image: "https://images.unsplash.com/photo-1598327773202-e00f1522231c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        screen: "7.6 inch Foldable AMOLED",
        camera: "108MP Main",
        battery: "4500mAh",
        network: "5G"
      }),
      shippingCost: 15.00
    },
    {
      name: "NoiseCanceller 3000 Headphones",
      description: "Immerse yourself in music with industry-leading noise cancellation. 30-hour battery life and premium comfort.",
      price: 349.50,
      stock: 100,
      category: "Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        type: "Over-ear",
        connectivity: "Bluetooth 5.2",
        batteryLife: "30 hours",
        features: "Active Noise Cancellation"
      }),
      shippingCost: 10.00
    },
    {
      name: "Gaming Monitor 144Hz",
      description: "Gain the competitive edge with a 144Hz refresh rate, 1ms response time, and G-Sync compatibility.",
      price: 499.00,
      stock: 40,
      category: "Monitors",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        size: "27 inch",
        resolution: "1440p",
        refreshRate: "144Hz",
        panel: "IPS"
      }),
      shippingCost: 30.00
    },
    {
      name: "Smart Watch Series 7",
      description: "Track your fitness, monitor your health, and stay connected. Always-on Retina display and water resistant.",
      price: 399.00,
      stock: 75,
      category: "Wearables",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        size: "44mm",
        sensors: "Heart Rate, Blood Oxygen",
        waterResistance: "WR50",
        connectivity: "GPS + Cellular"
      }),
      shippingCost: 8.00
    },
    {
      name: "Wireless Mechanical Keyboard",
      description: "Tactile mechanical switches with customizable RGB lighting. Connects to up to 3 devices simultaneously.",
      price: 129.99,
      stock: 60,
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b91add1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        switchType: "Brown Tactile",
        layout: "75%",
        connectivity: "Bluetooth / 2.4GHz / Wired",
        battery: "4000mAh"
      }),
      shippingCost: 12.00
    },
    {
      name: "4K Action Camera",
      description: "Capture your adventures in stunning 4K. Waterproof without a case and features HyperSmooth stabilization.",
      price: 299.00,
      stock: 45,
      category: "Cameras",
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        resolution: "4K 60fps",
        waterproof: "10m",
        stabilization: "HyperSmooth 3.0",
        screen: "Front & Rear Touch"
      }),
      shippingCost: 10.00
    },
    {
      name: "Tablet Pro 12.9",
      description: "Your next computer is not a computer. Powerful M1 chip, XDR display, and 5G connectivity.",
      price: 1099.00,
      stock: 25,
      category: "Tablets",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: JSON.stringify({
        chip: "M1",
        display: "Liquid Retina XDR",
        storage: "256GB",
        connectivity: "Wi-Fi 6 + 5G"
      }),
      shippingCost: 15.00
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ Added ${products.length} products to the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
