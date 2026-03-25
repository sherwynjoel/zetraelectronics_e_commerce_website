import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Admin User ──────────────────────────────────────────────
  const adminEmail = 'admin@zetraelectronics.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { email: adminEmail, password: hashedPassword, name: 'Super Admin', role: 'ADMIN' },
    });
    console.log(`✅ Created Admin: ${adminEmail} / admin123`);
  } else {
    console.log('ℹ️  Admin already exists.');
  }

  // ── System Settings ─────────────────────────────────────────
  const settings = [
    { key: 'GST_PERCENTAGE', value: '18' },
    { key: 'FREE_SHIPPING_THRESHOLD', value: '999' },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log('✅ System settings upserted');

  // ── Skip if products already exist ──────────────────────────
  const existingCount = await prisma.product.count();
  if (existingCount > 0) {
    console.log(`ℹ️  ${existingCount} products already exist — skipping product seed.`);
    return;
  }

  // ── Products ─────────────────────────────────────────────────
  const products = [
    // Development Boards
    {
      name: 'Arduino Uno R3',
      description: 'The classic microcontroller board based on ATmega328P. Perfect for beginners and prototyping projects.',
      price: 649,
      stock: 120,
      category: 'Development Boards',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      specs: JSON.stringify({ microcontroller: 'ATmega328P', voltage: '5V', pins: '14 digital', flash: '32KB' }),
      shippingCost: 49,
    },
    {
      name: 'Raspberry Pi 5 (4GB)',
      description: 'The latest Raspberry Pi single-board computer with 4GB RAM. Ideal for IoT, AI, and embedded projects.',
      price: 5999,
      stock: 35,
      category: 'Development Boards',
      image: 'https://images.unsplash.com/photo-1563452965085-2e77e5bf2607?w=800&q=80',
      specs: JSON.stringify({ cpu: 'Cortex-A76 2.4GHz', ram: '4GB LPDDR4X', storage: 'MicroSD', usb: 'USB 3.0 x2' }),
      shippingCost: 99,
    },
    {
      name: 'ESP32 DevKit V1',
      description: 'Dual-core Wi-Fi & Bluetooth chip. Ideal for IoT projects. Includes built-in antenna and 38 GPIO pins.',
      price: 349,
      stock: 200,
      category: 'Development Boards',
      image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&q=80',
      specs: JSON.stringify({ cpu: 'Xtensa LX6 240MHz', wifi: '802.11 b/g/n', bluetooth: 'BT 4.2 + BLE', gpio: '38 pins' }),
      shippingCost: 39,
    },
    {
      name: 'NodeMCU ESP8266',
      description: 'Low-cost Wi-Fi microchip with full TCP/IP stack and MCU capability. Compatible with Arduino IDE.',
      price: 199,
      stock: 300,
      category: 'Development Boards',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      specs: JSON.stringify({ cpu: 'L106 80MHz', wifi: '802.11 b/g/n', flash: '4MB', pins: '11 digital' }),
      shippingCost: 29,
    },
    // Sensors
    {
      name: 'DHT22 Temperature & Humidity Sensor',
      description: 'High-precision digital temperature and humidity sensor. Operating range: -40 to 80°C, 0-100% RH.',
      price: 189,
      stock: 250,
      category: 'Sensors',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
      specs: JSON.stringify({ tempRange: '-40 to 80°C', humidity: '0-100% RH', accuracy: '±0.5°C', interface: 'Digital' }),
      shippingCost: 29,
    },
    {
      name: 'HC-SR04 Ultrasonic Sensor',
      description: 'Non-contact distance measurement sensor. Range: 2cm to 400cm with ±3mm accuracy.',
      price: 99,
      stock: 400,
      category: 'Sensors',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
      specs: JSON.stringify({ range: '2cm - 400cm', accuracy: '±3mm', voltage: '5V DC', frequency: '40kHz' }),
      shippingCost: 19,
    },
    {
      name: 'MPU-6050 Gyroscope + Accelerometer',
      description: '6-axis motion tracker with gyroscope and accelerometer. Communicates via I2C. Perfect for drones and robotics.',
      price: 149,
      stock: 180,
      category: 'Sensors',
      image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80',
      specs: JSON.stringify({ axes: '6-axis', interface: 'I2C', range: '±2g to ±16g', voltage: '3.3V - 5V' }),
      shippingCost: 19,
    },
    // Robotics
    {
      name: 'MG996R Servo Motor',
      description: 'High-torque metal gear servo motor. 11kg.cm torque. Ideal for robotic arms and RC models.',
      price: 279,
      stock: 150,
      category: 'Robotics',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      specs: JSON.stringify({ torque: '11kg.cm', speed: '0.17s/60°', voltage: '4.8-7.2V', weight: '55g' }),
      shippingCost: 39,
    },
    {
      name: 'L298N Motor Driver Module',
      description: 'Dual H-Bridge motor driver. Supports 2 DC motors or 1 stepper motor. Up to 2A per channel.',
      price: 129,
      stock: 220,
      category: 'Robotics',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      specs: JSON.stringify({ channels: '2', currentPerChannel: '2A', voltage: '5V-35V', control: 'PWM' }),
      shippingCost: 25,
    },
    {
      name: 'Robotic Arm Kit (4 DOF)',
      description: 'Complete 4 degrees of freedom robotic arm kit with servo motors. Includes assembly guide and controller board.',
      price: 2499,
      stock: 30,
      category: 'Robotics',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      specs: JSON.stringify({ dof: '4', servos: '4x SG90', reach: '30cm', payload: '150g' }),
      shippingCost: 149,
    },
    // IoT & Wireless
    {
      name: 'LoRa SX1278 Module',
      description: 'Long-range 433MHz LoRa transceiver module. Range up to 10km in open areas. Ideal for IoT networks.',
      price: 449,
      stock: 90,
      category: 'IoT & Wireless',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      specs: JSON.stringify({ frequency: '433MHz', range: '10km', interface: 'SPI', power: '14dBm' }),
      shippingCost: 49,
    },
    {
      name: 'NRF24L01 Wireless Transceiver',
      description: '2.4GHz wireless transceiver module for short-range communications. Low power consumption with 6 data pipes.',
      price: 129,
      stock: 350,
      category: 'IoT & Wireless',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      specs: JSON.stringify({ frequency: '2.4GHz', range: '100m', dataRate: '2Mbps', interface: 'SPI' }),
      shippingCost: 25,
    },
    {
      name: 'SIM800L GSM Module',
      description: 'Quad-band GSM/GPRS module with SMS, voice call, and data support. Compact size for embedded systems.',
      price: 599,
      stock: 60,
      category: 'IoT & Wireless',
      image: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=800&q=80',
      specs: JSON.stringify({ bands: 'GSM 850/900/1800/1900', interface: 'UART', voltage: '3.7-4.2V', sms: 'Yes' }),
      shippingCost: 59,
    },
    // Tools
    {
      name: 'Soldering Iron Station 60W',
      description: 'Temperature-controlled soldering station with digital display. Range: 200-480°C. Includes 5 tips.',
      price: 1299,
      stock: 45,
      category: 'Tools',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
      specs: JSON.stringify({ power: '60W', tempRange: '200-480°C', display: 'LED Digital', tips: '5 included' }),
      shippingCost: 99,
    },
    {
      name: 'Digital Multimeter DT-830B',
      description: 'Compact digital multimeter for measuring voltage, current, and resistance. Auto-range with LCD display.',
      price: 349,
      stock: 120,
      category: 'Tools',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
      specs: JSON.stringify({ voltage: 'DC/AC 0-600V', current: '0-10A', resistance: '0-2MΩ', display: '3.5 digit LCD' }),
      shippingCost: 49,
    },
    {
      name: 'Jumper Wire Kit (120pcs)',
      description: 'Premium quality 120-piece jumper wire kit. Includes M-M, M-F, and F-F connectors in 10 colors.',
      price: 149,
      stock: 500,
      category: 'Tools',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80',
      specs: JSON.stringify({ quantity: '120 pcs', types: 'M-M, M-F, F-F', length: '20cm', colors: '10' }),
      shippingCost: 19,
    },
    // Components
    {
      name: 'Capacitor Kit (400 pcs)',
      description: 'Assorted electrolytic capacitor kit. Values from 1μF to 1000μF. 400 pieces across 16 values.',
      price: 249,
      stock: 200,
      category: 'Components',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      specs: JSON.stringify({ quantity: '400 pcs', values: '16 types (1μF-1000μF)', voltage: '25V', type: 'Electrolytic' }),
      shippingCost: 29,
    },
    {
      name: 'Resistor Kit (860 pcs)',
      description: '860-piece metal film resistor kit. 1% tolerance, 1/4W. 86 values from 1Ω to 10MΩ.',
      price: 199,
      stock: 300,
      category: 'Components',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      specs: JSON.stringify({ quantity: '860 pcs', values: '86 types', tolerance: '1%', power: '1/4W (0.25W)' }),
      shippingCost: 25,
    },
    {
      name: 'Breadboard 830 Point',
      description: 'Solderless breadboard with 830 tie-points. Multiple power rails. Ideal for circuit prototyping.',
      price: 119,
      stock: 600,
      category: 'Components',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      specs: JSON.stringify({ tiePoints: '830', powerRails: '4', size: '16.5 x 5.5 cm', type: 'Solderless' }),
      shippingCost: 19,
    },
  ];

  let created = 0;
  for (const product of products) {
    await prisma.product.create({ data: product });
    created++;
  }

  console.log(`✅ Seeded ${created} products successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
