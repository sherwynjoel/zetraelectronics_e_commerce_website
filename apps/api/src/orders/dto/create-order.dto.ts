export class CreateOrderItemDto {
    productId: number;
    quantity: number;
    price: number;
}

export class CreateOrderDto {
    items: CreateOrderItemDto[];
    total: number;
    userId?: number;
    // Shipping details would go here in a real app
    address?: {
        street: string;
        city: string;
        zip: string;
    }
    paymentMethod?: string;
}
