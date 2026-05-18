import { apiClient } from '@/lib/apiClient';
import type {
  CreateOrderInput,
  ListOrdersParams,
  Order,
  OrderListPagination,
  OrderListResult,
} from '@/types/order';

interface OrderResponse {
  data: Order;
}

interface OrderListResponse {
  data: Order[];
  pagination: OrderListPagination;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const res = await apiClient.post<OrderResponse>('/orders', input);
  return res.data.data;
}

export async function fetchOrders(
  params: ListOrdersParams = {}
): Promise<OrderListResult> {
  const res = await apiClient.get<OrderListResponse>('/orders', { params });
  return { items: res.data.data, pagination: res.data.pagination };
}

export async function fetchOrder(id: string): Promise<Order> {
  const res = await apiClient.get<OrderResponse>(`/orders/${id}`);
  return res.data.data;
}

export async function cancelOrder(id: string, reason?: string): Promise<Order> {
  const res = await apiClient.post<OrderResponse>(`/orders/${id}/cancel`, {
    reason,
  });
  return res.data.data;
}
