import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
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

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
            },
        });

        return {
            message: 'User registered successfully',
            user: { id: user.id, email: user.email, name: user.name }
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }


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

    async googleLogin(token: string) {
        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: 'zetraelectronics-c55c1'
            });
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const email = decodedToken.email;

            if (!email) {
                throw new UnauthorizedException('Google token did not contain an email');
            }

            let user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                const generatedPassword = Math.random().toString(36).slice(-8) + 'A1!';
                const hashedPassword = await bcrypt.hash(generatedPassword, 10);
                user = await this.prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        name: decodedToken.name || 'Google User',
                    },
                });
            }

            const payload = { sub: user.id, email: user.email, role: user.role };
            const jwtToken = this.jwtService.sign(payload);

            return {
                access_token: jwtToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            };
        } catch (error) {
            console.error('Firebase Auth Error:', error);
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
