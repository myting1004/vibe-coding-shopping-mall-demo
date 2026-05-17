import { apiClient } from '@/lib/apiClient';
import type { Cart } from '@/types/cart';

interface CartResponse {
  data: Cart;
}

export async function fetchCart(): Promise<Cart> {
  const res = await apiClient.get<CartResponse>('/cart');
  return res.data.data;
}

export async function addCartItem(
  productId: string,
  quantity = 1
): Promise<Cart> {
  const res = await apiClient.post<CartResponse>('/cart/items', {
    productId,
    quantity,
  });
  return res.data.data;
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<Cart> {
  const res = await apiClient.patch<CartResponse>(`/cart/items/${productId}`, {
    quantity,
  });
  return res.data.data;
}

export async function removeCartItem(productId: string): Promise<Cart> {
  const res = await apiClient.delete<CartResponse>(`/cart/items/${productId}`);
  return res.data.data;
}

export async function clearCart(): Promise<Cart> {
  const res = await apiClient.delete<CartResponse>('/cart');
  return res.data.data;
}
