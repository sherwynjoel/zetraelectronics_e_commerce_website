import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  create(createProductDto: CreateProductDto) {
    // Cast to any to avoid strict type checks on DTO vs Prisma Input for now
    return this.prisma.product.create({ data: createProductDto as any });
  }

  findAll(category?: string, minPrice?: number, maxPrice?: number, search?: string) {
    const where: any = {};
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }
    return this.prisma.product.findMany({ where });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto as any
    });
  }

  async remove(id: number) {
    try {
      // Check if product is referenced in orders (soft-fail if needed)
      return await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error?.code === 'P2003') { // Prisma foreign key constraint failed
        throw new BadRequestException(
          'Cannot delete product because it is part of existing orders. Please delete or archive the associated orders first.'
        );
      }
      throw new InternalServerErrorException('Error deleting product.');
    }
  }
}
