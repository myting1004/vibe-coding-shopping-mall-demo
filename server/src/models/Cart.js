import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

// 장바구니에 담긴 상품 총 수량 (개별 아이템 quantity 합계).
// 가격 총합은 Product 가격이 필요하므로 controller 에서 populate 후 계산.
cartSchema.virtual('totalQuantity').get(function totalQuantity() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

cartSchema.methods.findItem = function findItem(productId) {
  return this.items.find((item) => item.product.toString() === String(productId));
};

cartSchema.methods.addItem = function addItem(productId, quantity = 1) {
  const existing = this.findItem(productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }
  return this;
};

cartSchema.methods.updateItemQuantity = function updateItemQuantity(
  productId,
  quantity
) {
  const item = this.findItem(productId);
  if (!item) return null;
  if (quantity <= 0) {
    this.items.pull({ _id: item._id });
    return this;
  }
  item.quantity = quantity;
  return this;
};

cartSchema.methods.removeItem = function removeItem(productId) {
  const item = this.findItem(productId);
  if (!item) return null;
  this.items.pull({ _id: item._id });
  return this;
};

cartSchema.methods.clear = function clear() {
  this.items = [];
  return this;
};

cartSchema.statics.findOrCreateByUser = async function findOrCreateByUser(userId) {
  let cart = await this.findOne({ user: userId });
  if (!cart) {
    cart = await this.create({ user: userId, items: [] });
  }
  return cart;
};

export const Cart = mongoose.model('Cart', cartSchema);
