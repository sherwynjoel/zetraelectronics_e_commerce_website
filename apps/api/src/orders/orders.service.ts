import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
const PDFDocument = require('pdfkit');

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const { items, total, userId } = createOrderDto;

    // 1. Validate Stock & Calculate Real Total (Security)
    let calculatedTotal = 0;
    let calculatedShipping = 0;

    // We need to fetch products to check stock and price
    for (const item of items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new BadRequestException(`Product ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
      calculatedTotal += Number(product.price) * item.quantity;
      // Add Shipping Cost
      // @ts-ignore
      if (product.shippingCost) {
        // @ts-ignore
        calculatedShipping += Number(product.shippingCost) * item.quantity;
      }
    }

    // Check Free Shipping Threshold
    // @ts-ignore
    const shippingSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'FREE_SHIPPING_THRESHOLD' } });
    const freeShippingThreshold = shippingSetting ? parseFloat(shippingSetting.value) : 0;

    if (freeShippingThreshold > 0 && calculatedTotal >= freeShippingThreshold) {
      calculatedShipping = 0;
    }

    calculatedTotal += calculatedShipping;

    // Apply GST from Settings
    // @ts-ignore
    const gstSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'GST_PERCENTAGE' } });
    const gstRate = gstSetting ? parseFloat(gstSetting.value) / 100 : 0.18;

    // Apply Tax
    calculatedTotal = calculatedTotal * (1 + gstRate);

    // 2. Create Order Transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          total: calculatedTotal,
          userId: userId || 1, // Default user
          status: 'PENDING',
          paymentMethod: createOrderDto.paymentMethod || 'COD',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { items: { include: { product: true } }, user: true }
      });

      // Update Stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return order;
    });

    // 3. Send Email Notification
    try {
      const invoiceBuffer = await this.generateInvoice(order.id);

      await this.mailerService.sendMail({
        to: order.user?.email || 'customer@example.com',
        subject: `ElectroStore: Order #${order.id} Confirmed`,
        template: 'order-confirmation',
        context: {
          name: order.user?.name || 'Customer',
          orderId: order.id,
          total: order.total,
          items: order.items.map(i => ({
            productName: i.product.name,
            quantity: i.quantity,
            price: i.price
          }))
        },
        attachments: [
          {
            filename: `invoice-${order.id}.pdf`,
            content: invoiceBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
    } catch (e) {
      console.error("Failed to send email", e);
    }

    return order;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findAllByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { user: true, items: { include: { product: true } } }
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto as any
    });
  }

  remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }

  async generateInvoice(orderId: number): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) throw new NotFoundException(`Order #${orderId} not found`);

    const settings = await this.prisma.systemSetting.findMany();
    const s: any = settings.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});

    return new Promise((resolve) => {
      // @ts-ignore
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // --- Header ---
      doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(20).text('Tech uc', { align: 'left' });
      doc.fontSize(10).text(s.STORE_ADDRESS || 'Tech Store Address', { align: 'left' });
      doc.text(`Phone: ${s.STORE_PHONE || 'N/A'}`);
      doc.text(`Email: ${s.STORE_EMAIL || 'N/A'}`);
      if (s.GST_PERCENTAGE) doc.text(`GST Rate: ${s.GST_PERCENTAGE}%`);
      doc.moveDown();

      // --- Bill To ---
      doc.fontSize(12).text('Bill To:', { underline: true });
      doc.fontSize(10).text(order.user.name);
      doc.text(order.user.email);

      doc.moveDown();
      doc.text(`Order ID: #${order.id}`);
      doc.text(`Payment: ${order.paymentMethod}`);
      doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      // --- Table Header ---
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('#', 50, tableTop);
      doc.text('Item', 100, tableTop);
      doc.text('Qty', 300, tableTop);
      doc.text('Price', 350, tableTop);
      doc.text('Total', 450, tableTop);
      doc.moveDown();
      doc.font('Helvetica');

      let y = doc.y;

      // --- Table Rows ---
      let subtotal = 0;
      order.items.forEach((item, i) => {
        const itemTotal = Number(item.price) * item.quantity;
        subtotal += itemTotal;

        doc.text((i + 1).toString(), 50, y);
        doc.text(item.product.name.substring(0, 35), 100, y);
        doc.text(item.quantity.toString(), 300, y);
        doc.text(Number(item.price).toFixed(2), 350, y);
        doc.text(itemTotal.toFixed(2), 450, y);
        y += 20;
      });

      doc.moveDown();
      const lineY = y + 10;
      doc.moveTo(50, lineY).lineTo(550, lineY).stroke();

      // --- Totals ---
      y = lineY + 15;
      doc.font('Helvetica-Bold');

      doc.text('Subtotal:', 350, y);
      doc.text(subtotal.toFixed(2), 450, y);
      y += 20;

      doc.text('Total:', 300, y);
      doc.text(Number(order.total).toFixed(2), 450, y);

      doc.end();
    });
  }
}
