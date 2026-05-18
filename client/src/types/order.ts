export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'card' | 'bank_transfer' | 'virtual_account';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  _id: string;
  product: string;
  productSnapshot: {
    sku: string;
    name: string;
    imageUrl: string;
    price: number;
  };
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddress {
  recipient: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string;
  memo: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
  changedBy: string | null;
  note: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt: string | null;
    impUid: string | null;
    merchantUid: string | null;
    paidAmount: number | null;
  };
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  cancelledAt: string | null;
  cancelReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  // PortOne 결제건 식별자 — 서버가 이 값으로 PortOne 에 결제 검증을 호출.
  impUid: string;
  merchantUid: string;
  shippingAddress: Omit<ShippingAddress, 'address2' | 'memo'> &
    Partial<Pick<ShippingAddress, 'address2' | 'memo'>>;
  payment: { method: PaymentMethod };
  shippingFee?: number;
  discount?: number;
}

export interface OrderListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderListResult {
  items: Order[];
  pagination: OrderListPagination;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
