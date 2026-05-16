import { Controller, Post, Patch, Body, Get, UseGuards, HttpCode, HttpStatus, BadRequestException, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('google/firebase')
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    googleLogin(@Body('token') token: string) {
        return this.authService.googleLogin(token);
    }

    @Post('register')
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    updateProfile(@Request() req: any, @Body() body: { name?: string; currentPassword?: string; newPassword?: string }) {
        return this.authService.updateProfile(req.user.userId, body);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ strict: { limit: 3, ttl: 60000 } })
    forgotPassword(@Body('email') email: string) {
        if (!email) throw new BadRequestException('Email is required');
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
        return this.authService.resetPassword(token, newPassword);
    }

    @Get('users')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAll() {
        return this.authService.findAllUsers();
    }
}
