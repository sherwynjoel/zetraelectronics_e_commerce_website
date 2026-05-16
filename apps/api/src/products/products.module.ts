import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, CloudinaryService],
})
export class ProductsModule { }
