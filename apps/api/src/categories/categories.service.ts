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

  remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}
