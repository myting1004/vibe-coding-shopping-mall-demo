import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // 주문 시점 스냅샷 — Product 가 변경되어도 이 값은 불변.
    productSnapshot: {
      sku: { type: String, required: true },
      name: { type: String, required: true },
      imageUrl: { type: String, default: '' },
      price: { type: Number, required: true, min: 0 },
    },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    recipient: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    address1: { type: String, required: true, trim: true },
    address2: { type: String, default: '', trim: true },
    memo: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    note: { type: String, default: '' },
  },
  { _id: false }
);

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
];

export const PAYMENT_METHODS = ['card', 'bank_transfer', 'virtual_account'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const orderSchema = new mongoose.Schema(
  {
    // YYYYMMDD-XXXXXX (예: 20260517-A1B2C3)
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: '주문 항목이 비어 있습니다.',
      },
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    shippingAddress: { type: shippingAddressSchema, required: true },

    payment: {
      method: {
        type: String,
        enum: PAYMENT_METHODS,
        required: true,
      },
      status: {
        type: String,
        enum: PAYMENT_STATUSES,
        default: 'pending',
      },
      paidAt: { type: Date, default: null },
      // PortOne(iamport) 결제건 식별자 — 중복 결제 방지용 unique sparse.
      impUid: { type: String, default: null, unique: true, sparse: true },
      // 가맹점측 주문번호 (클라이언트가 생성해 IMP.request_pay 에 넘긴 값).
      merchantUid: { type: String, default: null },
      // PortOne 응답에서 받은 실제 결제 금액 (검증 통과 시 저장).
      paidAmount: { type: Number, default: null },
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },

    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// 상태 변경 시 statusHistory 에 자동으로 한 줄 push.
orderSchema.methods.changeStatus = function changeStatus(
  nextStatus,
  { changedBy = null, note = '' } = {}
) {
  this.status = nextStatus;
  this.statusHistory.push({
    status: nextStatus,
    changedAt: new Date(),
    changedBy,
    note,
  });
  return this;
};

export const Order = mongoose.model('Order', orderSchema);
