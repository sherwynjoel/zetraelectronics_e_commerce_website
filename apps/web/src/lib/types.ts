// ─────────────────────────────────────────────
// Shared domain types — used across all frontend pages & components
// ─────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  category: string;
  image?: string | null;
  datasheet?: string | null;
  specs?: string | null;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  userId: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  trackingUrl?: string | null;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  shippingAddress?: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: User;
}

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  createdAt?: string;
  _count?: { orders: number };
}

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
}

export interface DashboardStats {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  recentOrders: Order[];
}
