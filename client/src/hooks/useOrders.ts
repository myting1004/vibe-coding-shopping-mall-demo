import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOrder } from '@/api/orders';
import { CART_QUERY_KEY } from '@/hooks/useCart';
import type { CreateOrderInput } from '@/types/order';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      // 서버에서 cart.clear() 했으므로 클라이언트 캐시도 무효화.
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}
