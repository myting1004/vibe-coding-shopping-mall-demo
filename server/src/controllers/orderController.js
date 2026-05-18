import mongoose from 'mongoose';
import { Order, PAYMENT_METHODS } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { getPayment, cancelPayment } from '../services/iamport.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SHIPPING_REQUIRED_FIELDS = ['recipient', 'phone', 'zipCode', 'address1'];
const ORDER_NUMBER_RETRY = 5;
// 주문 취소 가능 상태 — 출고 이후엔 별도 반품/환불 흐름이 필요해 거부.
const CANCELLABLE_STATUSES = new Set(['pending', 'paid', 'preparing']);

function parsePositiveInt(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

function randomCode(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 헷갈리는 0/O, 1/I 제외
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function todayPrefix() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// YYYYMMDD-XXXXXX 형식 + unique 충돌 시 재시도.
async function generateUniqueOrderNumber() {
  const prefix = todayPrefix();
  for (let i = 0; i < ORDER_NUMBER_RETRY; i += 1) {
    const candidate = `${prefix}-${randomCode(6)}`;
    const exists = await Order.exists({ orderNumber: candidate });
    if (!exists) return candidate;
  }
  throw new Error('주문번호 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
}

function validateShippingAddress(input) {
  if (!input || typeof input !== 'object') {
    return '배송지 정보가 필요합니다.';
  }
  for (const field of SHIPPING_REQUIRED_FIELDS) {
    const v = input[field];
    if (typeof v !== 'string' || v.trim().length === 0) {
      return `배송지 ${field} 가 필요합니다.`;
    }
  }
  return null;
}

function pickShippingAddress(input) {
  return {
    recipient: input.recipient.trim(),
    phone: input.phone.trim(),
    zipCode: input.zipCode.trim(),
    address1: input.address1.trim(),
    address2: typeof input.address2 === 'string' ? input.address2.trim() : '',
    memo: typeof input.memo === 'string' ? input.memo.trim() : '',
  };
}

// PortOne 검증 실패 시 즉시 환불 시도 — 실패는 로그만 남기고 원래 에러로 응답.
// V2 API 는 paymentId(= V1 merchant_uid) 로 환불 호출.
async function safeCancel(merchantUid, reason) {
  try {
    await cancelPayment(merchantUid, reason);
  } catch (err) {
    console.error('[order] PortOne 환불 실패', { merchantUid, reason, err: err.message });
  }
}

// POST /api/orders
// body: {
//   impUid, merchantUid,                     // PortOne 결제건 식별자 (필수)
//   shippingAddress, payment: { method },    // 주문 메타
//   shippingFee?, discount?
// }
export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { impUid, merchantUid, shippingAddress, payment } = req.body ?? {};

    // 0) PortOne 결제건 식별자 필수.
    if (typeof impUid !== 'string' || !impUid.trim()) {
      return res.status(400).json({ message: 'impUid 가 필요합니다.' });
    }
    if (typeof merchantUid !== 'string' || !merchantUid.trim()) {
      return res.status(400).json({ message: 'merchantUid 가 필요합니다.' });
    }

    // 1) 중복 결제 방지 — 같은 impUid 로 이미 만든 주문이 있으면 그것을 그대로 반환 (멱등).
    //    클라이언트 콜백이 두 번 호출되는 경우(네트워크 재시도 등) 안전 보장.
    const existing = await Order.findOne({ 'payment.impUid': impUid });
    if (existing) {
      // 본인 주문일 때만 노출.
      if (existing.user.toString() !== userId) {
        return res.status(409).json({
          message: '이미 처리된 결제 건입니다.',
          code: 'DUPLICATE_PAYMENT',
        });
      }
      return res.status(200).json({ data: existing, idempotent: true });
    }

    // 2) 배송지·결제수단 검증.
    const addressErr = validateShippingAddress(shippingAddress);
    if (addressErr) {
      await safeCancel(merchantUid, '주문 검증 실패: 배송지 누락');
      return res.status(400).json({ message: addressErr });
    }

    const method = payment?.method;
    if (!PAYMENT_METHODS.includes(method)) {
      await safeCancel(merchantUid, '주문 검증 실패: 결제수단 오류');
      return res.status(400).json({
        message: `결제 수단이 올바르지 않습니다. (${PAYMENT_METHODS.join(', ')})`,
      });
    }

    const shippingFee = Math.max(0, Number(req.body.shippingFee) || 0);
    const discount = Math.max(0, Number(req.body.discount) || 0);

    // 3) 장바구니 로드 + 상품 populate.
    const cart = await Cart.findOrCreateByUser(userId);
    await cart.populate('items.product');

    if (cart.items.length === 0) {
      await safeCancel(merchantUid, '주문 검증 실패: 장바구니 비어있음');
      return res.status(400).json({ message: '장바구니가 비어 있습니다.' });
    }

    // 4) 재고 검증 — 부족한 상품을 모두 모아서 한 번에 응답.
    const insufficient = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        insufficient.push({
          productId: null,
          name: '(삭제된 상품)',
          requested: item.quantity,
          stock: 0,
        });
        continue;
      }
      if (product.stock < item.quantity) {
        insufficient.push({
          productId: product._id.toString(),
          name: product.name,
          requested: item.quantity,
          stock: product.stock,
        });
      }
    }
    if (insufficient.length > 0) {
      await safeCancel(merchantUid, '주문 검증 실패: 재고 부족');
      return res.status(409).json({
        message: '재고가 부족한 상품이 있습니다.',
        code: 'OUT_OF_STOCK',
        items: insufficient,
      });
    }

    // 5) 스냅샷 + lineTotal 계산 (서버에서 재계산, 클라이언트 입력 신뢰 X).
    const items = cart.items.map((item) => {
      const p = item.product;
      const lineTotal = p.price * item.quantity;
      return {
        product: p._id,
        productSnapshot: {
          sku: p.sku,
          name: p.name,
          imageUrl: p.imageUrl ?? '',
          price: p.price,
        },
        quantity: item.quantity,
        lineTotal,
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const totalAmount = Math.max(0, subtotal + shippingFee - discount);

    // 6) PortOne 결제 검증 — 실제 결제 정보 조회 + 금액/상태/식별자 일치 확인.
    //    V2 API 는 paymentId(= V1 의 merchant_uid) 로 결제건을 식별하므로
    //    조회 path 에는 merchantUid 를 넘김.
    const portonePayment = await getPayment(merchantUid);

    if (portonePayment.status !== 'paid') {
      // 결제가 완료되지 않은 상태(ready/failed/cancelled) — 주문 생성 거부.
      // 결제가 아직 진행 중이면 환불 호출은 의미 없으니 cancel 만 시도 (실패 무시).
      await safeCancel(merchantUid, `결제 미완료 상태(${portonePayment.status})`);
      return res.status(400).json({
        message: `결제가 완료되지 않았습니다. (상태: ${portonePayment.status})`,
        code: 'PAYMENT_NOT_PAID',
      });
    }

    if (portonePayment.amount !== totalAmount) {
      // 금액 위변조 의심 — 즉시 환불 후 거부.
      await safeCancel(merchantUid, '결제 금액 불일치');
      return res.status(400).json({
        message: '결제 금액이 주문 금액과 일치하지 않습니다.',
        code: 'AMOUNT_MISMATCH',
        expected: totalAmount,
        actual: portonePayment.amount,
      });
    }

    if (portonePayment.merchant_uid !== merchantUid) {
      // 주문 식별자 불일치 — 다른 주문의 결제건을 끌어다 쓴 경우.
      await safeCancel(merchantUid, 'merchant_uid 불일치');
      return res.status(400).json({
        message: '주문 정보가 일치하지 않습니다.',
        code: 'MERCHANT_UID_MISMATCH',
      });
    }

    // 7) 주문번호 생성 + 주문 저장.
    const orderNumber = await generateUniqueOrderNumber();
    const now = new Date();
    const paidAt = portonePayment.paid_at
      ? new Date(portonePayment.paid_at * 1000)
      : now;

    const order = await Order.create({
      orderNumber,
      user: userId,
      items,
      subtotal,
      shippingFee,
      discount,
      totalAmount,
      shippingAddress: pickShippingAddress(shippingAddress),
      payment: {
        method,
        status: 'paid',
        paidAt,
        impUid,
        merchantUid,
        paidAmount: portonePayment.amount,
      },
      status: 'paid',
      statusHistory: [
        { status: 'pending', changedAt: now, changedBy: userId, note: '주문 생성' },
        { status: 'paid', changedAt: now, changedBy: userId, note: 'PortOne 결제 검증 완료' },
      ],
    });

    // 8) 장바구니 비우기.
    cart.clear();
    await cart.save();

    return res.status(201).json({ data: order });
  } catch (err) {
    return next(err);
  }
}

// GET /api/orders?page=1&limit=20&status=paid
// 일반 사용자: 본인 주문만, admin: 전체 (?userId 로 필터 가능)
export async function listOrders(req, res, next) {
  try {
    const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);

    const filter = {};
    if (req.user.user_type === 'admin') {
      if (req.query.userId && mongoose.isValidObjectId(req.query.userId)) {
        filter.user = req.query.userId;
      }
    } else {
      filter.user = req.user.id;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/orders/:id
export async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: '유효하지 않은 주문 ID 입니다.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }

    // 본인 주문이거나 admin 만 조회 가능.
    if (
      req.user.user_type !== 'admin' &&
      order.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    return res.json({ data: order });
  } catch (err) {
    return next(err);
  }
}

// POST /api/orders/:id/cancel  { reason? }
export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: '유효하지 않은 주문 ID 입니다.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }

    if (
      req.user.user_type !== 'admin' &&
      order.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    if (!CANCELLABLE_STATUSES.has(order.status)) {
      return res.status(409).json({
        message: `현재 상태(${order.status})에서는 주문을 취소할 수 없습니다.`,
        code: 'NOT_CANCELLABLE',
      });
    }

    const reason =
      typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';

    order.cancelledAt = new Date();
    order.cancelReason = reason;
    // 결제가 완료된 상태였다면 환불 처리.
    if (order.payment?.status === 'paid') {
      order.payment.status = 'refunded';
    }
    order.changeStatus('cancelled', {
      changedBy: req.user.id,
      note: reason || '주문 취소',
    });

    await order.save();
    return res.json({ data: order });
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/orders/:id/status   { status, note? }   — admin 전용
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: '유효하지 않은 주문 ID 입니다.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }

    const { status, note } = req.body ?? {};
    if (!status) {
      return res.status(400).json({ message: 'status 가 필요합니다.' });
    }

    // 취소는 cancel 엔드포인트를 통해 처리 (환불 로직 수반).
    if (status === 'cancelled') {
      return res.status(400).json({
        message: '취소는 /orders/:id/cancel 엔드포인트를 사용하세요.',
      });
    }

    order.changeStatus(status, {
      changedBy: req.user.id,
      note: typeof note === 'string' ? note : '',
    });

    await order.save();
    return res.json({ data: order });
  } catch (err) {
    return next(err);
  }
}
