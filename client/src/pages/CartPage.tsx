import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/useCart';
import type { CartItem } from '@/types/cart';

export default function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();

  const subtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cart]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        장바구니를 불러오는 중입니다…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
        장바구니 정보를 불러올 수 없습니다.
        <button
          type="button"
          onClick={() => refetch()}
          className="ml-2 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <article className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            장바구니
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            담긴 상품 {items.length}종 · 총 {cart?.totalQuantity ?? 0}개
          </p>
        </div>
        {items.length > 0 && <ClearCartButton />}
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-3">
            {items.map((item) => (
              <CartItemRow key={item._id} item={item} />
            ))}
          </ul>

          <OrderSummary subtotal={subtotal} count={cart?.totalQuantity ?? 0} />
        </div>
      )}
    </article>
  );
}

/* ───── Item Row ───── */

function CartItemRow({ item }: { item: CartItem }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;
  const busy = update.isPending || remove.isPending;

  return (
    <li className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Link
        to={`/products/${product._id}`}
        className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
            no image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              {product.sku}
            </div>
            <Link
              to={`/products/${product._id}`}
              className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-rose-600"
            >
              {product.name}
            </Link>
            <div className="mt-1 text-xs text-slate-500">{product.category}</div>
          </div>
          <button
            type="button"
            onClick={() =>
              remove.mutate({ productId: product._id })
            }
            disabled={busy}
            className="text-xs text-slate-400 hover:text-rose-600 disabled:opacity-50"
          >
            제거
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex items-center rounded-lg border border-slate-200">
            <button
              type="button"
              aria-label="수량 감소"
              disabled={busy || quantity <= 1}
              onClick={() =>
                update.mutate({
                  productId: product._id,
                  quantity: Math.max(1, quantity - 1),
                })
              }
              className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              −
            </button>
            <div className="w-10 text-center text-sm font-semibold text-slate-900">
              {quantity}
            </div>
            <button
              type="button"
              aria-label="수량 증가"
              disabled={busy}
              onClick={() =>
                update.mutate({
                  productId: product._id,
                  quantity: quantity + 1,
                })
              }
              className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-slate-900">
              {lineTotal.toLocaleString()}원
            </div>
            <div className="text-xs text-slate-400">
              개당 {product.price.toLocaleString()}원
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ───── Order Summary ───── */

function OrderSummary({
  subtotal,
  count,
}: {
  subtotal: number;
  count: number;
}) {
  const navigate = useNavigate();

  return (
    <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-base font-bold text-slate-900">주문 요약</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>상품 금액 ({count}개)</dt>
          <dd>{subtotal.toLocaleString()}원</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>배송비</dt>
          <dd className="text-rose-500">무료</dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-700">
          결제 예상 금액
        </span>
        <span className="text-xl font-extrabold text-rose-600">
          {subtotal.toLocaleString()}원
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate('/checkout')}
        className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-50"
        disabled={count === 0}
      >
        주문하기
      </button>
      <Link
        to="/products"
        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        쇼핑 계속하기
      </Link>
    </aside>
  );
}

/* ───── Clear All Button ───── */

function ClearCartButton() {
  const clear = useClearCart();
  return (
    <button
      type="button"
      onClick={() => clear.mutate()}
      disabled={clear.isPending}
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
    >
      {clear.isPending ? '비우는 중…' : '장바구니 비우기'}
    </button>
  );
}

/* ───── Empty State ───── */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">
        장바구니가 비어 있습니다
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        마음에 드는 상품을 담아 보세요.
      </p>
      <Link
        to="/products"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
      >
        상품 둘러보기
      </Link>
    </div>
  );
}
