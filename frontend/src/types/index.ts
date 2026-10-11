export interface User {
  id?: number;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  username: string;
  email: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemDto {
  id?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface OrderDto {
  id: number;
  userId: number;
  username: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}
