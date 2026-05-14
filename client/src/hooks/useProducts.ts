import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api/products';

export function useProducts(params?: { category?: string; q?: string }) {
  return useQuery({
    queryKey: ['products', params ?? {}],
    queryFn: () => fetchProducts(params),
  });
}
