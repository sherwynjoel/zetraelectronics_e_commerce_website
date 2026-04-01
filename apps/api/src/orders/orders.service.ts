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

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
      calculatedTotal += Number(product.price) * item.quantity;
      if (product.shippingCost) {
        calculatedShipping += Number(product.shippingCost) * item.quantity;
      }
    }

    const shippingSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'FREE_SHIPPING_THRESHOLD' } });
    const freeShippingThreshold = shippingSetting ? parseFloat(shippingSetting.value) : 0;

    if (freeShippingThreshold > 0 && calculatedTotal >= freeShippingThreshold) {
      calculatedShipping = 0;
    }

    const subtotalBeforeShipping = calculatedTotal; // pure product subtotal
    calculatedTotal += calculatedShipping;

    const gstSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'GST_PERCENTAGE' } });
    const gstRate = gstSetting ? parseFloat(gstSetting.value) / 100 : 0.18;

    const taxAmount = calculatedTotal * gstRate;

    // Apply Tax
    calculatedTotal = calculatedTotal * (1 + gstRate);

    // 2. Create Order Transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          total: calculatedTotal,
          userId: userId || 1,
          status: 'PENDING',
          paymentMethod: (createOrderDto.paymentMethod || 'RAZORPAY').toUpperCase(),
          shippingAddress: createOrderDto.address ? JSON.stringify(createOrderDto.address) : null,
          shippingCost: calculatedShipping,
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
        subject: `Zetra Electronics: Order #${order.id} Confirmed`,
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

  findAll(page = 1, limit = 50) {
    const safePage = page < 1 ? 1 : page;
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    return this.prisma.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
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
      data: {
        status: updateOrderDto.status,
        trackingUrl: updateOrderDto.trackingUrl,
      },
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

      // ═══════════════════════════════════════════════════
      // HEADER — Logo occupies its OWN row, nothing beside it
      // ═══════════════════════════════════════════════════
      const logoPath = path.resolve(process.cwd(), '../web/public/logo.png');
      let logoBottomY = 50; // fallback if no logo
      try {
        // Render logo at fixed width; PDFKit will scale height proportionally.
        // We MEASURE height by checking where the cursor lands after render.
        doc.image(logoPath, 50, 30, { width: 50 });
        // Assume logo is roughly square-ish; give it 60px guaranteed clearance
        logoBottomY = 100;
      } catch (e) {
        console.warn('Logo not found:', logoPath);
      }

      // ── Right column: TAX INVOICE title (aligned to its own column, above company info) ──
      doc.fillColor('#111111')
        .font('Helvetica-Bold')
        .fontSize(26)
        .text('TAX INVOICE', 300, 30, { width: 250, align: 'right' });

      // ── Right column: Invoice meta ──
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#555555')
        .text(`Invoice No: #${order.id.toString().padStart(5, '0')}`, 300, 60, { width: 250, align: 'right' })
        .text(`Date: ${order.createdAt.toLocaleDateString()}`, 300, 73, { width: 250, align: 'right' })
        .text(`Payment: ${order.paymentMethod}`, 300, 86, { width: 250, align: 'right' })
        .text(`Status: ${order.status}`, 300, 99, { width: 250, align: 'right' });

      // ── Divider below header row ──
      const divider1Y = Math.max(logoBottomY, 115);
      doc.strokeColor('#dddddd').lineWidth(1).moveTo(50, divider1Y).lineTo(550, divider1Y).stroke();

      // ── Left: Company Info ──
      const infoY = divider1Y + 12;
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(12)
        .text('Zetra Electronics', 50, infoY);
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text(s.STORE_ADDRESS || 'Tech Street, India', 50, infoY + 16)
        .text(`Phone: ${s.STORE_PHONE || '+91 99999 99999'}`, 50, infoY + 29)
        .text(`Email: ${s.STORE_EMAIL || 'support@zetraelectronics.com'}`, 50, infoY + 42)
        .text('GST No: Pending', 50, infoY + 55);

      // ── Right: Billed To (same row as company info, RIGHT column) ──
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(10)
        .text('Billed To:', 330, infoY);
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text(order.user?.name || 'Customer', 330, infoY + 16)
        .text(order.user?.email || 'N/A', 330, infoY + 29);
      if (order.shippingAddress) {
        try {
          const addr = JSON.parse(order.shippingAddress as string);
          if (addr.street) doc.text(addr.street, 330, infoY + 42);
          if (addr.city) doc.text(`${addr.city}${addr.zip ? ' - ' + addr.zip : ''}`, 330, infoY + 55);
        } catch { }
      }

      // ── Second divider ──
      const divider2Y = infoY + 75;
      doc.strokeColor('#dddddd').lineWidth(1).moveTo(50, divider2Y).lineTo(550, divider2Y).stroke();

      // ── Table ──
      const tableTop = divider2Y + 14;
      doc.rect(50, tableTop - 4, 500, 22).fill('#222222');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
        .text('Item', 60, tableTop)
        .text('Qty', 320, tableTop, { width: 40, align: 'center' })
        .text('Unit Price', 370, tableTop, { width: 70, align: 'right' })
        .text('Total', 450, tableTop, { width: 90, align: 'right' });

      // ── Table Rows ──
      doc.font('Helvetica').fillColor('#333333').fontSize(9);
      let y = tableTop + 26;
      let subtotal = 0;

      order.items.forEach((item) => {
        const itemTotal = Number(item.price) * item.quantity;
        subtotal += itemTotal;
        doc.text(item.product.name.substring(0, 45), 60, y)
          .text(item.quantity.toString(), 320, y, { width: 40, align: 'center' })
          .text(`Rs ${Number(item.price).toFixed(2)}`, 370, y, { width: 70, align: 'right' })
          .text(`Rs ${itemTotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
        y += 20;
        doc.strokeColor('#eeeeee').lineWidth(0.5)
          .moveTo(50, y - 4).lineTo(550, y - 4).stroke();
      });

      // ── Totals block ──
      y += 15;
      const taxRate = s.GST_PERCENTAGE ? parseFloat(s.GST_PERCENTAGE) : 18;

      // Correct shipping: Use stored value
      const shipping = Number(order.shippingCost || 0);
      const taxAmount = (subtotal + shipping) * (taxRate / 100);
      const grandTotal = subtotal + shipping + taxAmount;

      const totalsX = 350;
      doc.font('Helvetica').fontSize(9).fillColor('#333333')
        .text('Subtotal:', totalsX, y, { width: 90, align: 'right' })
        .text(`Rs ${subtotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      y += 18;

      doc.text('Shipping:', totalsX, y, { width: 90, align: 'right' })
        .text(shipping === 0 ? 'FREE' : `Rs ${shipping.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      y += 18;

      doc.text(`GST (${taxRate}%):`, totalsX, y, { width: 90, align: 'right' })
        .text(`Rs ${taxAmount.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      y += 18;

      // Final line
      doc.strokeColor('#333333').lineWidth(1.5)
        .moveTo(totalsX, y - 4).lineTo(545, y - 4).stroke();

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#111111')
        .text('Grand Total:', totalsX, y, { width: 90, align: 'right' })
        .text(`Rs ${grandTotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

      // ── Footer ──
      doc.fontSize(9).font('Helvetica').fillColor('#aaaaaa')
        .text('Thank you for shopping with Zetra Electronics!', 50, 710, { align: 'center' });

      doc.end();
    });
  }
}
