import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';
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
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // --- Header with Logo ---
      const logoPath = path.resolve(process.cwd(), '../web/public/logo.png');
      try {
        doc.image(logoPath, 50, 45, { width: 100 });
      } catch (e) {
        console.warn('Logo not found or could not be loaded for invoice:', logoPath);
      }

      // --- Document Title & Details ---
      doc.fillColor('#333333')
        .fontSize(24)
        .text('TAX INVOICE', 50, 50, { align: 'right' });

      doc.fontSize(10)
        .fillColor('#666666')
        .text(`Invoice No: #${order.id.toString().padStart(5, '0')}`, { align: 'right' })
        .text(`Date: ${order.createdAt.toLocaleDateString()}`, { align: 'right' })
        .text(`Payment: ${order.paymentMethod}`, { align: 'right' })
        .text(`Status: ${order.status}`, { align: 'right' })
        .moveDown();

      // --- Company Info ---
      doc.fillColor('#333333')
        .fontSize(14)
        .text('Zetra Electronics', 50, 110)
        .fontSize(10)
        .fillColor('#666666')
        .text(s.STORE_ADDRESS || 'Tech Street, India', 50, 126)
        .text(`Phone: ${s.STORE_PHONE || '+91 99999 99999'}`, 50, 140)
        .text(`Email: ${s.STORE_EMAIL || 'support@zetraelectronics.com'}`, 50, 154);

      if (s.GST_PERCENTAGE) {
        doc.text(`GST No: Pending`, 50, 168);
      }

      // --- Bill To ---
      doc.fillColor('#333333')
        .fontSize(12)
        .text('Billed To:', 350, 110, { underline: true });

      doc.fontSize(10)
        .fillColor('#666666')
        .text(order.user?.name || 'Customer Name', 350, 126)
        .text(order.user?.email || 'N/A', 350, 140)
        .moveDown(3);

      // --- Table Header ---
      const tableTop = 220;
      doc.fillColor('#ffffff')
        .rect(50, tableTop - 5, 500, 20)
        .fill('#333333');

      doc.fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('Item', 60, tableTop)
        .text('Qty', 320, tableTop, { width: 40, align: 'center' })
        .text('Unit Price', 380, tableTop, { width: 60, align: 'right' })
        .text('Total', 450, tableTop, { width: 90, align: 'right' });

      // --- Table Rows ---
      doc.font('Helvetica')
        .fillColor('#333333');
      let y = tableTop + 25;
      let subtotal = 0;

      order.items.forEach((item, i) => {
        const itemTotal = Number(item.price) * item.quantity;
        subtotal += itemTotal;

        doc.text(item.product.name.substring(0, 40), 60, y)
          .text(item.quantity.toString(), 320, y, { width: 40, align: 'center' })
          .text(`Rs ${Number(item.price).toFixed(2)}`, 380, y, { width: 60, align: 'right' })
          .text(`Rs ${itemTotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

        y += 20;

        // Add a line between items
        doc.strokeColor('#cccccc')
          .lineWidth(0.5)
          .moveTo(50, y - 5)
          .lineTo(550, y - 5)
          .stroke();
      });

      // --- Totals Section ---
      y += 15;
      doc.font('Helvetica-Bold');

      doc.text('Subtotal:', 380, y, { width: 60, align: 'right' })
        .text(`Rs ${subtotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      y += 20;

      const taxRate = s.GST_PERCENTAGE ? parseFloat(s.GST_PERCENTAGE) : 0;
      const taxAmount = Number(order.total) - subtotal; // Assuming total includes exactly shipping + tax

      if (taxRate > 0) {
        doc.font('Helvetica')
          .text(`Tax (${taxRate}%):`, 380, y, { width: 60, align: 'right' })
          .text(`Rs ${taxAmount.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
        y += 20;
      }

      // Draw final total line
      doc.strokeColor('#333333')
        .lineWidth(2)
        .moveTo(380, y - 5)
        .lineTo(540, y - 5)
        .stroke();

      doc.font('Helvetica-Bold')
        .fontSize(14)
        .text('Grand Total:', 320, y, { width: 120, align: 'right' })
        .text(`Rs ${Number(order.total).toFixed(2)}`, 450, y, { width: 90, align: 'right' });

      // --- Footer Section ---
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#999999')
        .text('Thank you for shopping with Zetra Electronics!', 50, 700, { align: 'center' });

      doc.end();
    });
  }
}
