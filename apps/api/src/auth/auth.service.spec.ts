import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockJwt = { sign: jest.fn().mockReturnValue('signed_token') };
const mockConfig = { get: jest.fn().mockReturnValue(null) };
const mockMailer = { sendMail: jest.fn().mockResolvedValue(undefined) };

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: MailerService, useValue: mockMailer },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwt.sign.mockReturnValue('signed_token');
    mockMailer.sendMail.mockResolvedValue(undefined);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // register()
  // ──────────────────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('creates user and returns message without exposing password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1, email: 'a@b.com', name: 'Alice' });

      const result = await service.register({ email: 'a@b.com', password: 'secret123', name: 'Alice' });

      expect(result.user.email).toBe('a@b.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('hashes the password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1, email: 'a@b.com', name: 'Alice' });

      await service.register({ email: 'a@b.com', password: 'plaintext', name: 'Alice' });

      const storedPassword = mockPrisma.user.create.mock.calls[0][0].data.password;
      expect(storedPassword).not.toBe('plaintext');
      expect(await bcrypt.compare('plaintext', storedPassword)).toBe(true);
    });

    it('throws ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com' });
      await expect(service.register({ email: 'a@b.com', password: 'pw', name: 'Alice' })).rejects.toThrow(ConflictException);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // login()
  // ──────────────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns access_token and user for valid credentials', async () => {
      const pw = await hash('password123');
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', password: pw, role: 'CUSTOMER', name: 'Alice' });

      const result = await service.login({ email: 'a@b.com', password: 'password123' });

      expect(result.access_token).toBe('signed_token');
      expect(result.user.email).toBe('a@b.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const pw = await hash('correct');
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', password: pw, role: 'CUSTOMER', name: 'Alice' });

      await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'unknown@b.com', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });

    it('does not reveal whether email exists in error message', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      try {
        await service.login({ email: 'unknown@b.com', password: 'pw' });
      } catch (e: any) {
        expect(e.message).toBe('Invalid credentials');
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // updateProfile()
  // ──────────────────────────────────────────────────────────────────────────

  describe('updateProfile()', () => {
    it('updates name successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'Old', password: 'hash' });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.updateProfile(1, { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('throws NotFoundException for unknown user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.updateProfile(99, { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('requires currentPassword when changing password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'A', password: 'hash' });
      await expect(service.updateProfile(1, { newPassword: 'newpass123' })).rejects.toThrow(BadRequestException);
    });

    it('rejects incorrect currentPassword', async () => {
      const pw = await hash('correct');
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'A', password: pw });
      await expect(service.updateProfile(1, { currentPassword: 'wrong', newPassword: 'newpass123' })).rejects.toThrow(UnauthorizedException);
    });

    it('rejects new password shorter than 8 characters', async () => {
      const pw = await hash('correct');
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'A', password: pw });
      await expect(service.updateProfile(1, { currentPassword: 'correct', newPassword: 'short' })).rejects.toThrow(BadRequestException);
    });

    it('hashes the new password before storing', async () => {
      const pw = await hash('current');
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'A', password: pw });
      mockPrisma.user.update.mockResolvedValue({});

      await service.updateProfile(1, { currentPassword: 'current', newPassword: 'newpassword1' });

      const stored = mockPrisma.user.update.mock.calls[0][0].data.password;
      expect(await bcrypt.compare('newpassword1', stored)).toBe(true);
    });

    it('throws BadRequestException when no changes are provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'A', password: 'hash' });
      await expect(service.updateProfile(1, {})).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // forgotPassword()
  // ──────────────────────────────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('returns same message whether email exists or not (prevents enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword('noone@example.com');
      expect(result.message).toMatch(/If that email exists/);
    });

    it('sends reset email when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', name: 'Alice' });
      mockPrisma.user.update.mockResolvedValue({});

      await service.forgotPassword('a@b.com');

      expect(mockMailer.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@b.com', template: 'password-reset' }),
      );
    });

    it('stores a non-guessable token (64 hex chars)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', name: 'Alice' });
      mockPrisma.user.update.mockResolvedValue({});

      await service.forgotPassword('a@b.com');

      const token = mockPrisma.user.update.mock.calls[0][0].data.passwordResetToken;
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('sets expiry approximately 1 hour in the future', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', name: 'Alice' });
      mockPrisma.user.update.mockResolvedValue({});

      const before = Date.now();
      await service.forgotPassword('a@b.com');
      const after = Date.now();

      const expiry: Date = mockPrisma.user.update.mock.calls[0][0].data.passwordResetExpiry;
      const expiryMs = expiry.getTime();
      expect(expiryMs).toBeGreaterThanOrEqual(before + 3599000);
      expect(expiryMs).toBeLessThanOrEqual(after + 3601000);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // resetPassword()
  // ──────────────────────────────────────────────────────────────────────────

  describe('resetPassword()', () => {
    it('resets password for valid non-expired token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1, email: 'a@b.com' });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.resetPassword('valid_token', 'newPassword1');
      expect(result.message).toMatch(/Password updated/);
    });

    it('hashes the new password before storing', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1, email: 'a@b.com' });
      mockPrisma.user.update.mockResolvedValue({});

      await service.resetPassword('valid_token', 'newPassword1');

      const stored = mockPrisma.user.update.mock.calls[0][0].data.password;
      expect(await bcrypt.compare('newPassword1', stored)).toBe(true);
    });

    it('clears the token after successful reset', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 1, email: 'a@b.com' });
      mockPrisma.user.update.mockResolvedValue({});

      await service.resetPassword('valid_token', 'newPassword1');

      const updateData = mockPrisma.user.update.mock.calls[0][0].data;
      expect(updateData.passwordResetToken).toBeNull();
      expect(updateData.passwordResetExpiry).toBeNull();
    });

    it('throws BadRequestException for expired/invalid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.resetPassword('bad_token', 'newPassword1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when token is missing', async () => {
      await expect(service.resetPassword('', 'newPassword1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when new password is missing', async () => {
      await expect(service.resetPassword('token', '')).rejects.toThrow(BadRequestException);
    });
  });
});
