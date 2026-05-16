export interface Product {
  _id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  stock?: number;
}
