import api from './client';
import type { CreateOrderItem, OrderDto, OrderStatus } from '../types';

export async function fetchOrders(): Promise<OrderDto[]> {
  const { data } = await api.get<OrderDto[]>('/orders');
  return data;
}

export async function fetchOrder(id: number): Promise<OrderDto> {
  const { data } = await api.get<OrderDto>(`/orders/${id}`);
  return data;
}

export async function createOrder(
  items: CreateOrderItem[],
): Promise<OrderDto> {
  const { data } = await api.post<OrderDto>('/orders', { items });
  return data;
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<OrderDto> {
  const { data } = await api.put<OrderDto>(`/orders/${id}/status`, {
    status,
  });
  return data;
}
