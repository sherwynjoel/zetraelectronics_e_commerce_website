import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string }) {
    try {
      return await this.prisma.category.create({ data });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Category name already exists.');
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new BadRequestException('Category not found');

    const productCount = await this.prisma.product.count({
      where: { category: category.name },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete "${category.name}" — ${productCount} product(s) are assigned to it. Reassign them first.`,
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
