import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

// 내부 헬퍼 — populate 된 cart 를 반환해 클라이언트가 상품 정보까지 한 번에 받게 한다.
async function loadPopulatedCart(userId) {
  const cart = await Cart.findOrCreateByUser(userId);
  await cart.populate('items.product');
  return cart;
}

function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
}

// GET /api/cart
export async function getCart(req, res, next) {
  try {
    const cart = await loadPopulatedCart(req.user.id);
    res.json({ data: cart });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/items   { productId, quantity? }
export async function addCartItem(req, res, next) {
  try {
    const { productId } = req.body;
    const quantity = parsePositiveInt(req.body.quantity, 1);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID 입니다.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    const cart = await Cart.findOrCreateByUser(req.user.id);
    cart.addItem(productId, quantity);
    await cart.save();
    await cart.populate('items.product');

    res.status(201).json({ data: cart });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/cart/items/:productId   { quantity }
export async function updateCartItem(req, res, next) {
  try {
    const { productId } = req.params;
    const quantity = Number.parseInt(req.body.quantity, 10);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID 입니다.' });
    }
    if (!Number.isFinite(quantity)) {
      return res.status(400).json({ message: 'quantity 가 필요합니다.' });
    }

    const cart = await Cart.findOrCreateByUser(req.user.id);
    const updated = cart.updateItemQuantity(productId, quantity);
    if (!updated) {
      return res
        .status(404)
        .json({ message: '장바구니에서 해당 상품을 찾을 수 없습니다.' });
    }
    await cart.save();
    await cart.populate('items.product');

    res.json({ data: cart });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/items/:productId
export async function removeCartItem(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: '유효하지 않은 상품 ID 입니다.' });
    }

    const cart = await Cart.findOrCreateByUser(req.user.id);
    const removed = cart.removeItem(productId);
    if (!removed) {
      return res
        .status(404)
        .json({ message: '장바구니에서 해당 상품을 찾을 수 없습니다.' });
    }
    await cart.save();
    await cart.populate('items.product');

    res.json({ data: cart });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart
export async function clearCart(req, res, next) {
  try {
    const cart = await Cart.findOrCreateByUser(req.user.id);
    cart.clear();
    await cart.save();
    res.json({ data: cart });
  } catch (err) {
    next(err);
  }
}
