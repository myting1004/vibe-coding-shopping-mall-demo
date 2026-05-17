import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '@/api/products';

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id as string),
    enabled: Boolean(id),
  });
}
