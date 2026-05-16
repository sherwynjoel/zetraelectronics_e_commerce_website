/**
 * One-time migration script: SQLite → PostgreSQL
 * Run with: npx ts-node prisma/migrate-sqlite-to-pg.ts
 */
import { PrismaClient as SqliteClient } from '@prisma/client';
import { Pool } from 'pg';

const sqlite = new SqliteClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } },
});

const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('Starting SQLite → PostgreSQL migration...');

  // Users
  const users = await sqlite.user.findMany();
  console.log(`Migrating ${users.length} users...`);
  for (const u of users) {
    await pg.query(
      `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt", "passwordResetToken", "passwordResetExpiry")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.email, u.password, u.name, u.role, u.createdAt, u.updatedAt, u.passwordResetToken, u.passwordResetExpiry]
    );
  }

  // Categories
  const cats = await sqlite.category.findMany();
  console.log(`Migrating ${cats.length} categories...`);
  for (const c of cats) {
    await pg.query(
      `INSERT INTO "Category" (id, name, description, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.name, c.description, c.createdAt, c.updatedAt]
    );
  }

  // Products
  const products = await sqlite.product.findMany();
  console.log(`Migrating ${products.length} products...`);
  for (const p of products) {
    await pg.query(
      `INSERT INTO "Product" (id, name, description, price, stock, category, image, datasheet, specs, "shippingCost", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.description, p.price, p.stock, p.category, p.image, p.datasheet, p.specs, p.shippingCost, p.createdAt, p.updatedAt]
    );
  }

  // System Settings
  const settings = await sqlite.systemSetting.findMany();
  console.log(`Migrating ${settings.length} settings...`);
  for (const s of settings) {
    await pg.query(
      `INSERT INTO "SystemSetting" (key, value, description) VALUES ($1,$2,$3) ON CONFLICT (key) DO NOTHING`,
      [s.key, s.value, s.description]
    );
  }

  // Orders
  const orders = await sqlite.order.findMany();
  console.log(`Migrating ${orders.length} orders...`);
  for (const o of orders) {
    await pg.query(
      `INSERT INTO "Order" (id, "userId", status, "trackingUrl", total, "paymentMethod", "shippingAddress", "shippingCost", "razorpayOrderId", "razorpayPaymentId", "razorpaySignature", "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
      [o.id, o.userId, o.status, o.trackingUrl, o.total, o.paymentMethod, o.shippingAddress, o.shippingCost, o.razorpayOrderId, o.razorpayPaymentId, o.razorpaySignature, o.createdAt]
    );
  }

  // Order Items
  const items = await sqlite.orderItem.findMany();
  console.log(`Migrating ${items.length} order items...`);
  for (const i of items) {
    await pg.query(
      `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [i.id, i.orderId, i.productId, i.quantity, i.price]
    );
  }

  // Reset sequences so new inserts get correct IDs
  for (const table of ['User', 'Category', 'Product', 'Order', 'OrderItem']) {
    await pg.query(`SELECT setval('"${table}_id_seq"', (SELECT MAX(id) FROM "${table}"), true)`);
  }

  console.log('Migration complete.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await sqlite.$disconnect();
    await pg.end();
  });
