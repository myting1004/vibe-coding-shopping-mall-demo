import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { fetchOrder } from '@/api/orders';
import type { PaymentMethod } from '@/types/order';

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: '신용/체크카드',
  bank_transfer: '실시간 계좌이체',
  virtual_account: '가상계좌',
};

export default function OrderCompletePage() {
  const { orderId } = useParams<{ orderId: string }>();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: Boolean(orderId),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        주문 정보를 불러오는 중입니다…
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
        주문 정보를 찾을 수 없습니다.
        <Link to="/products" className="ml-2 underline">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  const { shippingAddress } = order;

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          주문이 완료되었습니다
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          주문번호{' '}
          <span className="font-mono font-semibold text-slate-700">
            {order.orderNumber}
          </span>
        </p>
        <div className="mt-6 inline-flex items-baseline gap-2">
          <span className="text-xs text-slate-500">결제 금액</span>
          <span className="text-2xl font-extrabold text-rose-600">
            {order.totalAmount.toLocaleString()}원
          </span>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">주문 상품</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item._id} className="flex gap-3 py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {item.productSnapshot.imageUrl ? (
                  <img
                    src={item.productSnapshot.imageUrl}
                    alt={item.productSnapshot.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    no image
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="line-clamp-1 text-sm font-medium text-slate-900">
                    {item.productSnapshot.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    수량 {item.quantity}개
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {item.lineTotal.toLocaleString()}원
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">배송 정보</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[100px_1fr]">
          <dt className="text-slate-500">받는 사람</dt>
          <dd className="text-slate-900">{shippingAddress.recipient}</dd>
          <dt className="text-slate-500">연락처</dt>
          <dd className="text-slate-900">{shippingAddress.phone}</dd>
          <dt className="text-slate-500">주소</dt>
          <dd className="text-slate-900">
            [{shippingAddress.zipCode}] {shippingAddress.address1}
            {shippingAddress.address2 && ` ${shippingAddress.address2}`}
          </dd>
          {shippingAddress.memo && (
            <>
              <dt className="text-slate-500">배송 메모</dt>
              <dd className="text-slate-900">{shippingAddress.memo}</dd>
            </>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">결제 정보</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[100px_1fr]">
          <dt className="text-slate-500">결제 수단</dt>
          <dd className="text-slate-900">
            {PAYMENT_METHOD_LABEL[order.payment.method]}
          </dd>
          <dt className="text-slate-500">상품 금액</dt>
          <dd className="text-slate-900">
            {order.subtotal.toLocaleString()}원
          </dd>
          <dt className="text-slate-500">배송비</dt>
          <dd className="text-slate-900">
            {order.shippingFee === 0
              ? '무료'
              : `${order.shippingFee.toLocaleString()}원`}
          </dd>
          {order.discount > 0 && (
            <>
              <dt className="text-slate-500">할인</dt>
              <dd className="text-rose-600">
                -{order.discount.toLocaleString()}원
              </dd>
            </>
          )}
          <dt className="text-slate-500 font-semibold">총 결제 금액</dt>
          <dd className="text-base font-bold text-rose-600">
            {order.totalAmount.toLocaleString()}원
          </dd>
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/orders"
          className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
        >
          주문 내역 보기
        </Link>
        <Link
          to="/products"
          className="flex-1 rounded-lg bg-rose-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
        >
          쇼핑 계속하기
        </Link>
        <Link
          to="/"
          className="basis-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex-1 sm:basis-auto"
        >
          홈으로
        </Link>
      </div>
    </article>
  );
}
