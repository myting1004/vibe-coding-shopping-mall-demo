import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCartItem,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '@/api/cart';
import { useAuth } from '@/providers/AuthProvider';
import type { Cart } from '@/types/cart';

export const CART_QUERY_KEY = ['cart'] as const;

// 인증된 사용자에게만 cart 를 fetch. 비회원은 빈 상태로 두어 nav 배지에 0 표시.
export function useCart() {
  const { isAuthenticated, isInitializing } = useAuth();
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    enabled: isAuthenticated && !isInitializing,
    staleTime: 1000 * 30,
  });
}

function useSetCartOnSuccess() {
  const queryClient = useQueryClient();
  return (cart: Cart) => queryClient.setQueryData(CART_QUERY_KEY, cart);
}

export function useAddCartItem() {
  const onSuccess = useSetCartOnSuccess();
  return useMutation({
    mutationFn: ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => addCartItem(productId, quantity),
    onSuccess,
  });
}

export function useUpdateCartItem() {
  const onSuccess = useSetCartOnSuccess();
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateCartItem(productId, quantity),
    onSuccess,
  });
}

export function useRemoveCartItem() {
  const onSuccess = useSetCartOnSuccess();
  return useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      removeCartItem(productId),
    onSuccess,
  });
}

export function useClearCart() {
  const onSuccess = useSetCartOnSuccess();
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess,
  });
}
