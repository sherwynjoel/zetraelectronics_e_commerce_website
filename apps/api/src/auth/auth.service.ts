import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as https from 'https';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    private googlePublicKeysCache: { keys: Record<string, string>; expiresAt: number } | null = null;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailerService: MailerService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

            const verifyToken = crypto.randomBytes(32).toString('hex');

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
                emailVerifyToken: verifyToken,
                emailVerified: false,
            },
        });

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://zetraelectronics.com';
        const verifyLink = `${frontendUrl}/verify-email?token=${verifyToken}`;

        this.mailerService.sendMail({
            to: user.email,
            subject: 'Verify your Zetra Electronics email',
            template: 'verify-email',
            context: { name: user.name || 'Customer', verifyLink },
        }).catch(err => console.error('Verify email send failed:', err));

        return {
            message: 'Registration successful! Please check your email to verify your account.',
            user: { id: user.id, email: user.email, name: user.name }
        };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
        if (!user) throw new BadRequestException('Invalid or expired verification link');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, emailVerifyToken: null },
        });
        return { message: 'Email verified successfully. You can now log in.' };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        // Check lockout before doing anything else
        if (user?.lockoutUntil && new Date() < user.lockoutUntil) {
            const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
            throw new UnauthorizedException(`Account is temporarily locked. Try again in ${minutesLeft} minute(s).`);
        }

        const isMatch = user ? await bcrypt.compare(loginDto.password, user.password) : false;

        if (!user || !isMatch) {
            // Increment failed attempts and lock after 10
            if (user) {
                const attempts = user.failedLoginAttempts + 1;
                const lockoutUntil = attempts >= 10 ? new Date(Date.now() + 15 * 60 * 1000) : null;
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        failedLoginAttempts: attempts,
                        ...(lockoutUntil ? { lockoutUntil } : {}),
                    },
                });
            }
            throw new UnauthorizedException('Invalid credentials');
        }

        // Successful login — reset lockout counters
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockoutUntil: null },
        });

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }

    async googleLoginByEmail(email: string, name: string) {
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
            user = await this.prisma.user.create({
                data: { email, password: hashedPassword, name },
            });
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const jwtToken = this.jwtService.sign(payload);
        return {
            access_token: jwtToken,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }

    private fetchGooglePublicKeys(): Promise<Record<string, string>> {
        const now = Date.now();
        if (this.googlePublicKeysCache && this.googlePublicKeysCache.expiresAt > now) {
            return Promise.resolve(this.googlePublicKeysCache.keys);
        }
        return new Promise((resolve, reject) => {
            https.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const keys = JSON.parse(data);
                        // Cache for 1 hour
                        this.googlePublicKeysCache = { keys, expiresAt: now + 60 * 60 * 1000 };
                        resolve(keys);
                    } catch (e) {
                        reject(new Error('Failed to parse Google public keys'));
                    }
                });
                res.on('error', reject);
            }).on('error', reject);
        });
    }

    private verifyFirebaseJwt(idToken: string, publicKey: string, projectId: string): any {
        const parts = idToken.split('.');
        if (parts.length !== 3) throw new Error('Invalid token format');
        const [headerB64, payloadB64, sigB64] = parts;

        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(`${headerB64}.${payloadB64}`);
        const sig = Buffer.from(sigB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
        if (!verifier.verify(publicKey, sig)) throw new Error('Invalid signature');

        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) throw new Error('Token expired');
        if (payload.aud !== projectId) throw new Error('Invalid audience');
        if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Invalid issuer');
        return payload;
    }

    async googleLogin(idToken: string) {
        try {
            const projectId = 'zetraelectronics-c55c1';
            const publicKeys = await this.fetchGooglePublicKeys();

            const headerB64 = idToken.split('.')[0];
            const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
            const publicKey = publicKeys[header.kid];
            if (!publicKey) throw new Error('Unknown signing key');

            const payload = this.verifyFirebaseJwt(idToken, publicKey, projectId);
            const email: string = payload.email;
            const name: string = payload.name || email;
            if (!email) throw new Error('No email in token');

            let user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
                user = await this.prisma.user.create({ data: { email, password: hashedPassword, name } });
            }

            const jwtPayload = { sub: user.id, email: user.email, role: user.role };
            return {
                access_token: this.jwtService.sign(jwtPayload),
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
            };
        } catch (error) {
            console.error('Google token verification failed:', error.message);
            throw new UnauthorizedException('Invalid Google token');
        }
    }
    async updateProfile(userId: number, data: { name?: string; currentPassword?: string; newPassword?: string }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const updateData: Record<string, any> = {};

        if (data.name !== undefined && data.name.trim()) {
            updateData.name = data.name.trim();
        }

        if (data.newPassword) {
            if (!data.currentPassword) throw new BadRequestException('Current password is required');
            const isMatch = await bcrypt.compare(data.currentPassword, user.password);
            if (!isMatch) throw new UnauthorizedException('Current password is incorrect');
            if (data.newPassword.length < 8) throw new BadRequestException('New password must be at least 8 characters');
            updateData.password = await bcrypt.hash(data.newPassword, 10);
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('No changes provided');
        }

        await this.prisma.user.update({ where: { id: userId }, data: updateData });

        return { message: 'Profile updated successfully', name: updateData.name ?? user.name };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        // Always return success to prevent user enumeration
        if (!user) return { message: 'If that email exists, a reset link has been sent.' };

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.prisma.user.update({
            where: { email },
            data: { passwordResetToken: token, passwordResetExpiry: expiry },
        });

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://zetraelectronics.com';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Reset your Zetra Electronics password',
            template: 'password-reset',
            context: { name: user.name || 'Customer', resetLink },
        });

        return { message: 'If that email exists, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        if (!token || !newPassword) throw new BadRequestException('Token and new password are required');

        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpiry: { gt: new Date() },
            },
        });

        if (!user) throw new BadRequestException('Reset link is invalid or has expired');

        const hashed = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
        });

        return { message: 'Password updated successfully. You can now log in.' };
    }

    async findAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
