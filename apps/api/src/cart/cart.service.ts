import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {}

    async getCart(userId: number) {
        const items = await this.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    select: { id: true, name: true, price: true, image: true, stock: true, shippingCost: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return items;
    }

    async upsertItem(userId: number, productId: number, quantity: number) {
        if (quantity <= 0) {
            await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
            return { removed: true };
        }
        return this.prisma.cartItem.upsert({
            where: { userId_productId: { userId, productId } },
            update: { quantity },
            create: { userId, productId, quantity },
        });
    }

    async removeItem(userId: number, productId: number) {
        await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
        return { removed: true };
    }

    async clearCart(userId: number) {
        await this.prisma.cartItem.deleteMany({ where: { userId } });
        return { cleared: true };
    }

    // Merge a list of local items into the backend cart (add if not present, take max quantity)
    async syncCart(userId: number, items: { productId: number; quantity: number }[]) {
        for (const item of items) {
            if (item.quantity <= 0) continue;
            await this.prisma.cartItem.upsert({
                where: { userId_productId: { userId, productId: item.productId } },
                update: { quantity: item.quantity },
                create: { userId, productId: item.productId, quantity: item.quantity },
            });
        }
        return this.getCart(userId);
    }
}
