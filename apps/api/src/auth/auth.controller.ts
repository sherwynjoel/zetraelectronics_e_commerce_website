import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
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
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('google/firebase')
    googleLogin(@Body('token') token: string) {
        return this.authService.googleLogin(token);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('users')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAll() {
        return this.authService.findAllUsers();
    }
}
