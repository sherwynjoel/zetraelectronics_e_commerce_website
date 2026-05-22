import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; parentId?: number }) {
    try {
      return await this.prisma.category.create({
        data: {
          name: data.name,
          description: data.description,
          ...(data.parentId ? { parent: { connect: { id: data.parentId } } } : {}),
        },
        include: { parent: { select: { id: true, name: true } }, children: true },
      });
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
      include: {
        parent: { select: { id: true, name: true } },
        children: { orderBy: { name: 'asc' }, select: { id: true, name: true, description: true, parentId: true } },
      },
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category) throw new BadRequestException('Category not found');

    if (category.children.length > 0) {
      throw new BadRequestException(
        `Cannot delete "${category.name}" — it has ${category.children.length} subcategory(ies). Delete them first.`,
      );
    }

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
