import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
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

        // --- 2FA OTP LOGIC FOR ADMINS ---
        if (user.role === 'ADMIN') {
            if (!loginDto.otpCode) {
                // Generate and send OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiry = new Date();
                expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes expiry

                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { otpCode: otp, otpExpiry: expiry }
                });

                try {
                    await this.mailerService.sendMail({
                        to: user.email,
                        subject: 'Zetra Admin Panel - Security PIN',
                        text: `Your Admin Panel login code is: ${otp}\nThis code will expire in 10 minutes.`,
                    });
                } catch (e) {
                    console.error("Failed to send OTP email", e);
                }

                return { requires2FA: true, message: "OTP sent to your email." };
            } else {
                // Verify provided OTP
                if (user.otpCode !== loginDto.otpCode) {
                    throw new UnauthorizedException('Invalid OTP code');
                }
                if (!user.otpExpiry || user.otpExpiry < new Date()) {
                    throw new UnauthorizedException('OTP has expired');
                }

                // OTP Valid, clear it
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { otpCode: null, otpExpiry: null }
                });
            }
        }
        // --------------------------------

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
