import { Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';

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

    // 🕵️ Check if all products exist before creating order
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: Number(item.productId || item.id) }
      });
      if (!product) {
        throw new BadRequestException(\`Product #\${item.productId || item.id} no longer exists. Please clear your cart.\`);
      }
    }

    try {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: \`receipt_\${Date.now()}\`,
      });

      return this.prisma.order.create({
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
    } catch (error: any) {
      console.error('Order Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to create order');
    }
  }

  async verifyPayment(orderId: any, razorpay_payment_id: string, razorpay_signature: string) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const body = orderId + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await this.prisma.order.updateMany({
        where: { razorpayOrderId: orderId.toString() },
        data: { status: 'PAID' },
      });
      return { success: true };
    } else {
      throw new UnauthorizedException('Invalid payment signature');
    }
  }

  async handleWebhook(body: any, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || 'your_webhook_secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature === signature) {
      const { order_id } = body.payload.payment.entity;
      await this.prisma.order.updateMany({
        where: { razorpayOrderId: order_id },
        data: { status: 'PAID' },
      });
      return { status: 'ok' };
    }
  }

  async findAll(page: number = 1, limit: number = 50) {
    return this.prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { user: true, items: { include: { product: true } } },
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
      include: { user: true, items: { include: { product: true } } },
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

  async generateInvoice(id: number) {
    const order = await this.findOne(id);
    return Buffer.from(\`Invoice for Order #\${order.id}\`);
  }
}
