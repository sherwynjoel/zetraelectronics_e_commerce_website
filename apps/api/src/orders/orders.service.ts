import { Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
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
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async create(createOrderDto: any) {
    const userId = Number(createOrderDto.userId);
    const items = createOrderDto.items || [];
    const totalAmount = Number(createOrderDto.totalAmount || createOrderDto.total || 0);
    const shippingAddress = createOrderDto.address || createOrderDto.shippingAddress || '';

    if (!userId || totalAmount <= 0 || items.length === 0) {
      throw new BadRequestException('Invalid order data');
    }

    // Validate stock and collect product data
    for (const item of items) {
      const productId = Number(item.productId || item.id);
      const qty = Number(item.quantity);
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new BadRequestException(`Product #${productId} no longer exists. Please clear your cart.`);
      }
      if (product.stock < qty) {
        throw new BadRequestException(`Only ${product.stock} unit(s) of "${product.name}" available.`);
      }
    }

    try {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });

      const order = await this.prisma.order.create({
        data: {
          user: { connect: { id: userId } },
          total: totalAmount,
          shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
          status: 'PENDING',
          razorpayOrderId: razorpayOrder.id,
          items: {
            create: items.map((item: any) => ({
              product: { connect: { id: Number(item.productId || item.id) } },
              quantity: Number(item.quantity),
              price: Number(item.price),
            })),
          },
        },
      });

      // Decrement stock for each item
      for (const item of items) {
        await this.prisma.product.update({
          where: { id: Number(item.productId || item.id) },
          data: { stock: { decrement: Number(item.quantity) } },
        });
      }

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
      return { success: true };
    } else {
      throw new UnauthorizedException('Invalid payment signature');
    }
  }

  async handleWebhook(body: any, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('Webhook secret is not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const { order_id } = body?.payload?.payment?.entity ?? {};
    if (order_id) {
      await this.prisma.order.updateMany({
        where: { razorpayOrderId: order_id },
        data: { status: 'PAID' },
      });
    }
    return { status: 'ok' };
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
    return this.prisma.order.update({
      where: { id: Number(id) },
      data: updateOrderDto,
    });
  }

  async remove(id: number) {
    return this.prisma.order.delete({ where: { id: Number(id) } });
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
