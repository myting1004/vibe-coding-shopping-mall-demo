import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  cancelOrder,
  createOrder,
  fetchOrder,
  fetchOrders,
} from '@/api/orders';
import { CART_QUERY_KEY } from '@/hooks/useCart';
import type { CreateOrderInput, ListOrdersParams } from '@/types/order';

export const ORDERS_QUERY_KEY = ['orders'] as const;

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      // 서버에서 cart.clear() 했으므로 클라이언트 캐시도 무효화.
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useOrders(params: ListOrdersParams = {}) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'list', params],
    queryFn: () => fetchOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelOrder(id, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(
        [...ORDERS_QUERY_KEY, 'detail', order._id],
        order
      );
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
