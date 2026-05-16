import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    getCart(@Request() req: any) {
        return this.cartService.getCart(req.user.userId);
    }

    @Post()
    upsertItem(@Request() req: any, @Body() body: { productId: number; quantity: number }) {
        return this.cartService.upsertItem(req.user.userId, body.productId, body.quantity);
    }

    @Post('sync')
    syncCart(@Request() req: any, @Body() body: { items: { productId: number; quantity: number }[] }) {
        return this.cartService.syncCart(req.user.userId, body.items || []);
    }

    @Delete('clear')
    clearCart(@Request() req: any) {
        return this.cartService.clearCart(req.user.userId);
    }

    @Delete(':productId')
    removeItem(@Request() req: any, @Param('productId', ParseIntPipe) productId: number) {
        return this.cartService.removeItem(req.user.userId, productId);
    }
}
