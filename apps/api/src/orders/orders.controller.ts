import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // Override userId with the one from JWT
    createOrderDto.userId = req.user.userId;
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findAllByUser(@Request() req, @Param('userId') userId: string) {
    const requestedId = Number(userId);
    const tokenUserId = Number(req.user.userId);

    // Check if user is accessing their own data or is admin
    if (requestedId !== tokenUserId && !req.user.role?.includes('ADMIN')) {
      throw new ForbiddenException('You can only view your own orders');
    }
    try {
      return await this.ordersService.findAllByUser(requestedId);
    } catch (error) {
      console.error('findAllByUser error:', error);
      return [];
    }
  }

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const order = await this.ordersService.findOne(+id);
    if (!order) throw new ForbiddenException('Order not found');

    // Check ownership
    if (order.userId !== req.user.userId && !req.user.role?.includes('ADMIN')) {
      throw new ForbiddenException('You can only download your own invoices');
    }

    const buffer = await this.ordersService.generateInvoice(+id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=invoice-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    const order = await this.ordersService.findOne(+id);
    if (order && order.userId !== req.user.userId && !req.user.role?.includes('ADMIN')) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
