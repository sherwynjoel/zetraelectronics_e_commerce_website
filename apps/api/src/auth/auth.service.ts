import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
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
