import { Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

@Injectable()
export class OrdersService {
  private razorpay: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async create(createOrderDto: any) {
    const userId = Number(createOrderDto.userId);
    const items = createOrderDto.items || [];
    const shippingAddress = createOrderDto.address || createOrderDto.shippingAddress || '';

    if (!userId || items.length === 0) {
      throw new BadRequestException('Invalid order data');
    }

    // Fetch tax/shipping settings
    const settings = await this.prisma.systemSetting.findMany();
    const s: Record<string, string> = settings.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
    const taxRate = parseFloat(s['GST_PERCENTAGE'] || '18') / 100;
    const freeShippingThreshold = parseFloat(s['FREE_SHIPPING_THRESHOLD'] || '0');
    const flatShippingFee = parseFloat(s['FLAT_SHIPPING_FEE'] || '0');

    // Validate stock and calculate total from DB prices (never trust frontend)
    let subtotal = 0;
    let shippingTotal = 0;
    const dbProducts: Record<number, any> = {};

    for (const item of items) {
      const productId = Number(item.productId || item.id);
      const qty = Number(item.quantity);
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new BadRequestException(`Product #${productId} no longer exists. Please clear your cart.`);
      if (product.stock < qty) throw new BadRequestException(`Only ${product.stock} unit(s) of "${product.name}" available.`);
      subtotal += product.price * qty;
      shippingTotal += product.shippingCost * qty;
      dbProducts[productId] = product;
    }

    let shipping = shippingTotal;
    if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
      shipping = 0;
    } else if (flatShippingFee > 0) {
      shipping = flatShippingFee;
    }
    const tax = (subtotal + shipping) * taxRate;
    const totalAmount = Math.round((subtotal + shipping + tax) * 100) / 100;

    try {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });

      const order = await this.prisma.$transaction(async (tx) => {
        // Re-check stock atomically inside transaction
        for (const item of items) {
          const productId = Number(item.productId || item.id);
          const qty = Number(item.quantity);
          const product = await tx.product.findUnique({ where: { id: productId } });
          if (!product) throw new BadRequestException(`Product #${productId} no longer exists.`);
          if (product.stock < qty) throw new BadRequestException(`Only ${product.stock} unit(s) of "${product.name}" available.`);
        }

        const created = await tx.order.create({
          data: {
            user: { connect: { id: userId } },
            total: totalAmount,
            shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
            status: 'PENDING',
            razorpayOrderId: razorpayOrder.id,
            items: {
              create: items.map((item: any) => {
                const productId = Number(item.productId || item.id);
                return {
                  product: { connect: { id: productId } },
                  quantity: Number(item.quantity),
                  price: dbProducts[productId].price, // always DB price
                };
              }),
            },
          },
        });

        for (const item of items) {
          await tx.product.update({
            where: { id: Number(item.productId || item.id) },
            data: { stock: { decrement: Number(item.quantity) } },
          });
        }

        return created;
      });

      // Fire low-stock alert in background after successful order
      const orderedProductIds = items.map((item: any) => Number(item.productId || item.id));
      this.checkAndAlertLowStock(orderedProductIds).catch((err) =>
        console.error('Low-stock alert failed:', err),
      );

      return order;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      console.error('Order Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to create order');
    }
  }

  async verifyPayment(razorpayOrderId: string, razorpay_payment_id: string, razorpay_signature: string) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const body = razorpayOrderId + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await this.prisma.order.updateMany({
        where: { razorpayOrderId: razorpayOrderId },
        data: { status: 'PAID', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
      });

      const order = await this.prisma.order.findFirst({
        where: { razorpayOrderId: razorpayOrderId },
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
          items: { include: { product: true } },
        },
      });
      if (order) {
        this.sendInvoiceEmails(order as any).catch((err) =>
          console.error('Invoice email failed:', err),
        );
      }

      return { success: true };
    } else {
      throw new UnauthorizedException('Invalid payment signature');
    }
  }

  async handleWebhook(rawBody: string, parsed: any, signature: string, timestamp?: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('Webhook secret is not configured');
    }

    // Reject replayed webhooks older than 5 minutes
    if (timestamp) {
      const ts = Number(timestamp);
      const ageSeconds = (Date.now() / 1000) - ts;
      if (isNaN(ts) || ageSeconds > 300 || ageSeconds < -60) {
        throw new UnauthorizedException('Webhook timestamp out of range');
      }
    }

    // Use raw body string for HMAC — Razorpay signs the exact bytes it sends
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const { order_id } = parsed?.payload?.payment?.entity ?? {};
    if (order_id) {
      await this.prisma.order.updateMany({
        where: { razorpayOrderId: order_id },
        data: { status: 'PAID' },
      });

      const order = await this.prisma.order.findFirst({
        where: { razorpayOrderId: order_id },
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
          items: { include: { product: true } },
        },
      });
      if (order) {
        this.sendInvoiceEmails(order as any).catch((err) =>
          console.error('Invoice email failed (webhook):', err),
        );
      }
    }
    return { received: true };
  }

  async cancelOrder(orderId: number, userId: number, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId && role !== 'ADMIN') {
      throw new UnauthorizedException('You can only cancel your own orders');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException(`Cannot cancel an order with status "${order.status}". Only PENDING orders can be cancelled.`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    return { message: 'Order cancelled successfully' };
  }

  async findAll(page: number = 1, limit: number = 50) {
    return this.prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId: Number(userId) },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, updateOrderDto: any) {
    const updated = await this.prisma.order.update({
      where: { id: Number(id) },
      data: updateOrderDto,
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        items: { include: { product: true } },
      },
    });

    if (updated.user?.email) {
      const status = updateOrderDto.status;
      if (status === 'SHIPPED') {
        this.sendStatusEmail(updated as any, 'SHIPPED').catch((err) =>
          console.error('Shipped email failed:', err),
        );
      } else if (status === 'DELIVERED') {
        this.sendStatusEmail(updated as any, 'DELIVERED').catch((err) =>
          console.error('Delivered email failed:', err),
        );
      } else if (status === 'CANCELLED') {
        this.sendStatusEmail(updated as any, 'CANCELLED').catch((err) =>
          console.error('Cancelled email failed:', err),
        );
      }
    }

    return updated;
  }

  private async sendStatusEmail(order: any, status: 'SHIPPED' | 'DELIVERED' | 'CANCELLED'): Promise<void> {
    const items = order.items.map((item: any) => ({
      productName: item.product?.name ?? `Product #${item.productId}`,
      quantity: item.quantity,
    }));
    const name = order.user.name || 'Valued Customer';

    const config: Record<string, { subject: string; template: string }> = {
      SHIPPED: {
        subject: `Your order #ORD-${order.id} has been shipped — Zetra Electronics`,
        template: 'order-shipped',
      },
      DELIVERED: {
        subject: `Your order #ORD-${order.id} has been delivered — Zetra Electronics`,
        template: 'order-delivered',
      },
      CANCELLED: {
        subject: `Your order #ORD-${order.id} has been cancelled — Zetra Electronics`,
        template: 'order-cancelled',
      },
    };

    await this.mailerService.sendMail({
      to: order.user.email,
      subject: config[status].subject,
      template: config[status].template,
      context: {
        name,
        orderId: order.id,
        trackingUrl: order.trackingUrl || null,
        items,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.order.delete({ where: { id: Number(id) } });
  }

  private async checkAndAlertLowStock(productIds: number[]): Promise<void> {
    const settings = await this.prisma.systemSetting.findMany();
    const s: Record<string, string> = settings.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
    const threshold = parseInt(s['LOW_STOCK_THRESHOLD'] || '5', 10);
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@zetraelectronics.com';

    const lowStockProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds }, stock: { lte: threshold } },
      select: { id: true, name: true, stock: true, category: true },
    });

    if (lowStockProducts.length === 0) return;

    const products = lowStockProducts.map((p) => ({
      ...p,
      stockLabel: p.stock === 0 ? `0 — OUT OF STOCK` : `${p.stock} unit${p.stock === 1 ? '' : 's'}`,
      isZero: p.stock === 0,
    }));

    await this.mailerService.sendMail({
      to: adminEmail,
      subject: `[Low Stock Alert] ${products.length} product(s) running low — Zetra Electronics`,
      template: 'low-stock-alert',
      context: { products, threshold },
    });
  }

  private async sendInvoiceEmails(order: any): Promise<void> {
    try {
      const pdfBuffer = await this.generateInvoice(order);
      const adminEmail =
        this.configService.get<string>('ADMIN_EMAIL') || 'admin@zetraelectronics.com';
      const customerName = order.user?.name || 'Valued Customer';
      const customerEmail = order.user?.email;

      const items = order.items.map((item: any) => ({
        productName: item.product?.name ?? `Product #${item.productId}`,
        quantity: item.quantity,
        price: Number(item.price).toFixed(2),
        lineTotal: (item.price * item.quantity).toFixed(2),
      }));

      const attachment = {
        filename: `invoice-ORD-${order.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      };

      if (customerEmail) {
        await this.mailerService.sendMail({
          to: customerEmail,
          subject: `Your Invoice for Order #ORD-${order.id} — Zetra Electronics`,
          template: 'order-confirmation',
          context: {
            name: customerName,
            orderId: order.id,
            items,
            total: Number(order.total).toFixed(2),
          },
          attachments: [attachment],
        });
      }

      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `[New Order] #ORD-${order.id} — ₹${Number(order.total).toFixed(2)} from ${customerName}`,
        template: 'admin-order-notification',
        context: {
          orderId: order.id,
          customerName,
          customerEmail: customerEmail || 'N/A',
          total: Number(order.total).toFixed(2),
          items,
          paymentId: order.razorpayPaymentId || 'N/A',
          orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
        attachments: [attachment],
      });
    } catch (error) {
      console.error('Failed to send invoice emails:', error);
    }
  }

  async generateInvoice(order: Awaited<ReturnType<typeof this.findOne>>) {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('Zetra Electronics', 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#555')
        .text('https://zetraelectronics.com', 50, 76);

      doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#ccc').stroke();

      // Invoice meta
      doc.fillColor('#000').fontSize(18).font('Helvetica-Bold').text('INVOICE', 50, 115);
      doc.fontSize(10).font('Helvetica')
        .text(`Invoice #: ORD-${order.id}`, 50, 142)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, 156)
        .text(`Status: ${order.status}`, 50, 170);

      // Shipping address
      doc.fontSize(11).font('Helvetica-Bold').text('Ship To:', 350, 142);
      const addr = (() => {
        try { return JSON.parse(order.shippingAddress || '{}'); } catch { return {}; }
      })();
      doc.fontSize(10).font('Helvetica')
        .text(addr.street || order.shippingAddress || 'N/A', 350, 158)
        .text([addr.city, addr.state].filter(Boolean).join(', '), 350, 172)
        .text(addr.zip || '', 350, 186);

      doc.moveTo(50, 210).lineTo(545, 210).strokeColor('#ccc').stroke();

      // Table header
      doc.rect(50, 220, 495, 20).fillColor('#f0f0f0').fill();
      doc.fillColor('#000').fontSize(10).font('Helvetica-Bold')
        .text('Item', 55, 225)
        .text('Qty', 370, 225, { width: 50, align: 'right' })
        .text('Unit Price', 425, 225, { width: 70, align: 'right' })
        .text('Total', 470, 225, { width: 75, align: 'right' });

      // Table rows
      let y = 250;
      doc.font('Helvetica').fontSize(10);
      for (const item of order.items) {
        const lineTotal = item.price * item.quantity;
        doc.fillColor('#000')
          .text(item.product?.name ?? `Product #${item.productId}`, 55, y, { width: 300 })
          .text(String(item.quantity), 370, y, { width: 50, align: 'right' })
          .text(`₹${item.price.toFixed(2)}`, 425, y, { width: 70, align: 'right' })
          .text(`₹${lineTotal.toFixed(2)}`, 470, y, { width: 75, align: 'right' });
        y += 20;
        doc.moveTo(50, y - 2).lineTo(545, y - 2).strokeColor('#eee').stroke();
      }

      // Totals
      y += 10;
      doc.moveTo(350, y).lineTo(545, y).strokeColor('#ccc').stroke();
      y += 8;
      doc.font('Helvetica-Bold').fontSize(12)
        .text('Total:', 350, y)
        .text(`₹${order.total.toFixed(2)}`, 470, y, { width: 75, align: 'right' });

      // Footer
      doc.fontSize(9).font('Helvetica').fillColor('#888')
        .text('Thank you for shopping with Zetra Electronics!', 50, 740, { align: 'center', width: 495 });

      doc.end();
    });
  }
}
