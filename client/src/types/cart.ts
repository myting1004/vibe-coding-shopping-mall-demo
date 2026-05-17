import type { Product } from './product';

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}
