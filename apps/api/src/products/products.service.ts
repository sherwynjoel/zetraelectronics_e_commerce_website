import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        category: createProductDto.category,
        image: createProductDto.image,
        datasheet: createProductDto.datasheet,
        specs: createProductDto.specs,
        shippingCost: createProductDto.shippingCost ?? 0,
      },
    });
  }

  findAll(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    search?: string,
    page = 1,
    limit = 50,
  ) {
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

    const safePage = page < 1 ? 1 : page;
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    try {
      // First, delete related OrderItems to avoid foreign key constraint errors
      await this.prisma.orderItem.deleteMany({
        where: { productId: id },
      });
      // Then, delete the product itself
      return await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting product.');
    }
  }
}
