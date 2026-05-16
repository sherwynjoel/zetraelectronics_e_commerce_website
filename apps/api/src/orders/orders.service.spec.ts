import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

// Mock Razorpay before the service constructor runs
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: { create: jest.fn() },
  }));
});

const mockPrisma = {
  systemSetting: { findMany: jest.fn() },
  product: { findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]), update: jest.fn() },
  order: { updateMany: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  orderItem: {},
  $transaction: jest.fn(),
};

const mockConfig = { get: jest.fn() };
const mockMailer = { sendMail: jest.fn() };

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: MailerService, useValue: mockMailer },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();

    // Default: Razorpay constructor gets key_id/secret
    mockConfig.get.mockImplementation((key: string) => {
      if (key === 'RAZORPAY_KEY_ID') return 'test_key';
      if (key === 'RAZORPAY_KEY_SECRET') return 'test_secret';
      if (key === 'RAZORPAY_WEBHOOK_SECRET') return 'webhook_secret';
      return null;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Price calculation
  // ──────────────────────────────────────────────────────────────────────────

  describe('create() — price calculation', () => {
    const baseSettings = [
      { key: 'GST_PERCENTAGE', value: '18' },
      { key: 'FREE_SHIPPING_THRESHOLD', value: '0' },
      { key: 'FLAT_SHIPPING_FEE', value: '0' },
      { key: 'LOW_STOCK_THRESHOLD', value: '5' },
    ];

    const makeProduct = (id: number, price: number, stock: number, shippingCost = 0) => ({
      id, name: `Product ${id}`, price, stock, shippingCost,
    });

    function makeTx(product: any, onOrderCreate?: (data: any) => any) {
      return {
        product: {
          findUnique: jest.fn().mockResolvedValue(product),
          update: jest.fn().mockResolvedValue(product),
        },
        order: {
          create: jest.fn().mockImplementation(({ data }) => {
            const result = { id: 1, total: data.total, razorpayOrderId: 'rz_1', status: 'PENDING' };
            if (onOrderCreate) onOrderCreate(data);
            return result;
          }),
        },
      };
    }

    function setupRazorpay() {
      (service as any).razorpay = { orders: { create: jest.fn().mockResolvedValue({ id: 'rz_1' }) } };
    }

    it('rejects empty items', async () => {
      await expect(service.create({ userId: 1, items: [] })).rejects.toThrow(BadRequestException);
    });

    it('rejects missing userId', async () => {
      await expect(service.create({ userId: 0, items: [{ productId: 1, quantity: 1 }] })).rejects.toThrow(BadRequestException);
    });

    it('calculates total = subtotal + per-item shipping + 18% GST', async () => {
      mockPrisma.systemSetting.findMany.mockResolvedValue(baseSettings);
      const product = makeProduct(1, 100, 10, 20);
      mockPrisma.product.findUnique.mockResolvedValue(product);
      setupRazorpay();

      let capturedTotal = 0;
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(makeTx(product, (d) => { capturedTotal = d.total; })));

      await service.create({ userId: 1, items: [{ productId: 1, quantity: 2 }] });

      // subtotal=200, shipping=40, tax=(200+40)*0.18=43.2, total=283.2
      expect(capturedTotal).toBeCloseTo(283.2, 1);
    });

    it('applies flat shipping fee when no per-item shipping', async () => {
      mockPrisma.systemSetting.findMany.mockResolvedValue([
        { key: 'GST_PERCENTAGE', value: '0' },
        { key: 'FREE_SHIPPING_THRESHOLD', value: '0' },
        { key: 'FLAT_SHIPPING_FEE', value: '50' },
        { key: 'LOW_STOCK_THRESHOLD', value: '5' },
      ]);
      const product = makeProduct(1, 100, 10, 0);
      mockPrisma.product.findUnique.mockResolvedValue(product);
      setupRazorpay();

      let capturedTotal = 0;
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(makeTx(product, (d) => { capturedTotal = d.total; })));

      await service.create({ userId: 1, items: [{ productId: 1, quantity: 1 }] });

      // subtotal=100, flat shipping=50, GST=0 → total=150
      expect(capturedTotal).toBeCloseTo(150, 1);
    });

    it('waives shipping when subtotal meets free-shipping threshold', async () => {
      mockPrisma.systemSetting.findMany.mockResolvedValue([
        { key: 'GST_PERCENTAGE', value: '0' },
        { key: 'FREE_SHIPPING_THRESHOLD', value: '500' },
        { key: 'FLAT_SHIPPING_FEE', value: '100' },
        { key: 'LOW_STOCK_THRESHOLD', value: '5' },
      ]);
      const product = makeProduct(1, 600, 10, 50);
      mockPrisma.product.findUnique.mockResolvedValue(product);
      setupRazorpay();

      let capturedTotal = 0;
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(makeTx(product, (d) => { capturedTotal = d.total; })));

      await service.create({ userId: 1, items: [{ productId: 1, quantity: 1 }] });

      // subtotal=600 >= 500, shipping waived → total=600
      expect(capturedTotal).toBeCloseTo(600, 1);
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      mockPrisma.systemSetting.findMany.mockResolvedValue(baseSettings);
      const product = makeProduct(1, 100, 2, 0);
      mockPrisma.product.findUnique.mockResolvedValue(product);
      (service as any).razorpay = { orders: { create: jest.fn() } };

      await expect(
        service.create({ userId: 1, items: [{ productId: 1, quantity: 5 }] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for non-existent product', async () => {
      mockPrisma.systemSetting.findMany.mockResolvedValue(baseSettings);
      mockPrisma.product.findUnique.mockResolvedValue(null);
      (service as any).razorpay = { orders: { create: jest.fn() } };

      await expect(
        service.create({ userId: 1, items: [{ productId: 999, quantity: 1 }] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Payment signature verification
  // ──────────────────────────────────────────────────────────────────────────

  describe('verifyPayment()', () => {
    const KEY_SECRET = 'test_secret';
    const ORDER_ID = 'order_abc123';
    const PAYMENT_ID = 'pay_xyz789';

    function makeSignature(orderId: string, paymentId: string, secret: string) {
      return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    }

    beforeEach(() => {
      mockPrisma.order.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 1, razorpayOrderId: ORDER_ID,
        user: { id: 1, email: 'test@example.com', name: 'Test', role: 'CUSTOMER' },
        items: [],
      });
      mockMailer.sendMail.mockResolvedValue(undefined);
    });

    it('succeeds with valid signature and marks order PAID', async () => {
      const sig = makeSignature(ORDER_ID, PAYMENT_ID, KEY_SECRET);
      const result = await service.verifyPayment(ORDER_ID, PAYMENT_ID, sig);
      expect(result).toEqual({ success: true });
      expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'PAID' }) }),
      );
    });

    it('throws UnauthorizedException for wrong signature', async () => {
      await expect(
        service.verifyPayment(ORDER_ID, PAYMENT_ID, 'wrong_signature'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when signature uses wrong secret', async () => {
      const sig = makeSignature(ORDER_ID, PAYMENT_ID, 'wrong_secret');
      await expect(service.verifyPayment(ORDER_ID, PAYMENT_ID, sig)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when order ID is tampered', async () => {
      const sig = makeSignature('tampered_order', PAYMENT_ID, KEY_SECRET);
      await expect(service.verifyPayment(ORDER_ID, PAYMENT_ID, sig)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when payment ID is tampered', async () => {
      const sig = makeSignature(ORDER_ID, 'tampered_payment', KEY_SECRET);
      await expect(service.verifyPayment(ORDER_ID, PAYMENT_ID, sig)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Webhook replay protection
  // ──────────────────────────────────────────────────────────────────────────

  describe('handleWebhook() — replay protection', () => {
    const SECRET = 'webhook_secret';
    const body = { payload: { payment: { entity: { order_id: 'rz_order_1' } } } };

    function makeSignature(payload: object, secret: string) {
      return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    }

    beforeEach(() => {
      mockPrisma.order.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.order.findFirst.mockResolvedValue(null);
    });

    it('accepts webhook with valid timestamp within 5 minutes', async () => {
      const ts = Math.floor(Date.now() / 1000 - 60).toString(); // 1 minute ago
      const sig = makeSignature(body, SECRET);
      const result = await service.handleWebhook(body, sig, ts);
      expect(result).toEqual({ status: 'ok' });
    });

    it('rejects webhook with timestamp older than 5 minutes', async () => {
      const ts = Math.floor(Date.now() / 1000 - 400).toString(); // 400s ago
      const sig = makeSignature(body, SECRET);
      await expect(service.handleWebhook(body, sig, ts)).rejects.toThrow(UnauthorizedException);
    });

    it('rejects webhook with future timestamp more than 60s ahead', async () => {
      const ts = Math.floor(Date.now() / 1000 + 120).toString(); // 2 min future
      const sig = makeSignature(body, SECRET);
      await expect(service.handleWebhook(body, sig, ts)).rejects.toThrow(UnauthorizedException);
    });

    it('rejects webhook with invalid (NaN) timestamp', async () => {
      const sig = makeSignature(body, SECRET);
      await expect(service.handleWebhook(body, sig, 'not_a_number')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects webhook with wrong signature', async () => {
      const ts = Math.floor(Date.now() / 1000).toString();
      await expect(service.handleWebhook(body, 'bad_sig', ts)).rejects.toThrow(UnauthorizedException);
    });

    it('throws InternalServerErrorException when webhook secret is not configured', async () => {
      mockConfig.get.mockReturnValue(null);
      (service as any).razorpay = { orders: { create: jest.fn() } };

      // Recreate service without webhook secret
      const module = await Test.createTestingModule({
        providers: [
          OrdersService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: ConfigService, useValue: { get: () => null } },
          { provide: MailerService, useValue: mockMailer },
        ],
      }).compile();
      const svc = module.get<OrdersService>(OrdersService);

      await expect(svc.handleWebhook(body, 'sig', '1234')).rejects.toThrow(InternalServerErrorException);
    });

    it('processes valid webhook without timestamp (optional field)', async () => {
      const sig = makeSignature(body, SECRET);
      const result = await service.handleWebhook(body, sig);
      expect(result).toEqual({ status: 'ok' });
    });
  });
});
