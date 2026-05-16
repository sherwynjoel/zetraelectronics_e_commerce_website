import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res, BadRequestException, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import * as express from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() createOrderDto: any) {
    createOrderDto.userId = req.user.userId;
    return this.ordersService.create(createOrderDto);
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  verifyPayment(@Body() body: any) {
    const { orderId, razorpay_payment_id, razorpay_signature } = body;
    if (!orderId || !razorpay_payment_id || !razorpay_signature) {
      throw new BadRequestException('Missing payment verification details');
    }
    return this.ordersService.verifyPayment(orderId.toString(), razorpay_payment_id, razorpay_signature);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any, @Res() res: express.Response) {
    const signature = res.req.headers['x-razorpay-signature'] as string;
    return this.ordersService.handleWebhook(body, signature);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.ordersService.findAll(Number(page), Number(limit));
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findAllByUser(@Param('userId') userId: string) {
    const id = Number(userId);
    if (isNaN(id)) throw new BadRequestException('Invalid user ID');
    return await this.ordersService.findAllByUser(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  async generateInvoice(@Param('id') id: string, @Res() res: express.Response) {
    const buffer = await this.ordersService.generateInvoice(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
