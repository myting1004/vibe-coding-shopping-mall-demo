import { apiClient } from '@/lib/apiClient';
import type { CreateProductInput, Product } from '@/types/product';

interface ListResponse {
  data: Product[];
}

interface ItemResponse {
  data: Product;
}

export async function fetchProducts(params?: {
  category?: string;
  q?: string;
}): Promise<Product[]> {
  const res = await apiClient.get<ListResponse>('/products', { params });
  return res.data.data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await apiClient.get<ItemResponse>(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const res = await apiClient.post<ItemResponse>('/products', input);
  return res.data.data;
}
