import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';

import { useCancelOrder, useOrder } from '@/hooks/useOrders';
import { StatusBadge } from '@/pages/OrdersPage';
import type { OrderStatus, PaymentMethod } from '@/types/order';

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: '신용/체크카드',
  bank_transfer: '실시간 계좌이체',
  virtual_account: '가상계좌',
};

const STATUS_TITLE: Record<OrderStatus, string> = {
  pending: '결제를 기다리고 있어요',
  paid: '결제가 완료되었습니다',
  preparing: '상품을 준비하고 있어요',
  shipped: '상품이 배송 중입니다',
  delivered: '배송이 완료되었습니다',
  cancelled: '취소된 주문입니다',
};

const STATUS_DESC: Record<OrderStatus, string> = {
  pending: '결제가 완료되면 자동으로 상태가 갱신됩니다.',
  paid: '판매자가 곧 상품 준비를 시작할 예정입니다.',
  preparing: '판매자가 상품을 포장하고 있어요.',
  shipped: '받는 분께 도착할 때까지 잠시만 기다려 주세요.',
  delivered: '상품을 안전하게 받으셨길 바랍니다.',
  cancelled: '결제 금액이 있다면 취소·환불 처리가 진행됩니다.',
};

const CANCELLABLE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  'pending',
  'paid',
  'preparing',
]);

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useOrder(orderId);

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
        <Link to="/orders" className="ml-2 underline">
          주문 내역으로
        </Link>
      </div>
    );
  }

  const { shippingAddress } = order;
  const isCancelled = order.status === 'cancelled';

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav className="text-xs text-slate-500">
        <Link to="/orders" className="inline-flex items-center gap-1 hover:text-slate-900">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          주문 내역
        </Link>
      </nav>

      <header
        className={`rounded-2xl border p-6 shadow-sm ${
          isCancelled
            ? 'border-rose-200 bg-rose-50/40'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">주문번호</span>
              <span className="font-mono font-semibold text-slate-700">
                {order.orderNumber}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-900">
              {STATUS_TITLE[order.status]}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {STATUS_DESC[order.status]}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">결제 금액</span>
          <span className="text-xl font-extrabold text-rose-600">
            {order.totalAmount.toLocaleString()}원
          </span>
        </div>
      </header>

      <StatusTimeline order={order} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">주문 상품</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item._id} className="flex gap-3 py-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
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
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    {item.productSnapshot.sku}
                  </div>
                  <div className="line-clamp-1 text-sm font-medium text-slate-900">
                    {item.productSnapshot.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    개당 {item.productSnapshot.price.toLocaleString()}원 · 수량 {item.quantity}개
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

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">배송 정보</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Field label="받는 사람" value={shippingAddress.recipient} />
            <Field label="연락처" value={shippingAddress.phone} />
            <Field
              label="주소"
              value={`[${shippingAddress.zipCode}] ${shippingAddress.address1}${
                shippingAddress.address2 ? ` ${shippingAddress.address2}` : ''
              }`}
            />
            {shippingAddress.memo && (
              <Field label="배송 메모" value={shippingAddress.memo} />
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">결제 정보</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Field
              label="결제 수단"
              value={PAYMENT_METHOD_LABEL[order.payment.method]}
            />
            <Field
              label="상품 금액"
              value={`${order.subtotal.toLocaleString()}원`}
            />
            <Field
              label="배송비"
              value={
                order.shippingFee === 0
                  ? '무료'
                  : `${order.shippingFee.toLocaleString()}원`
              }
            />
            {order.discount > 0 && (
              <Field
                label="할인"
                value={`-${order.discount.toLocaleString()}원`}
                tone="rose"
              />
            )}
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-2">
              <dt className="text-sm font-semibold text-slate-700">총 결제 금액</dt>
              <dd className="text-base font-extrabold text-rose-600">
                {order.totalAmount.toLocaleString()}원
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {isCancelled && order.cancelReason && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 text-sm text-rose-800">
          <div className="font-semibold">취소 사유</div>
          <p className="mt-1 whitespace-pre-wrap text-rose-700">
            {order.cancelReason}
          </p>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/orders"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          주문 내역으로
        </Link>
        <Link
          to="/products"
          className="flex-1 rounded-lg bg-rose-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
        >
          쇼핑 계속하기
        </Link>
        {CANCELLABLE_STATUSES.has(order.status) && (
          <CancelOrderButton orderId={order._id} />
        )}
      </div>
    </article>
  );
}

/* ───── Status Timeline ───── */

const TIMELINE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'paid', label: '결제완료' },
  { key: 'preparing', label: '상품준비' },
  { key: 'shipped', label: '배송중' },
  { key: 'delivered', label: '배송완료' },
];

function StatusTimeline({
  order,
}: {
  order: { status: OrderStatus };
}) {
  if (order.status === 'cancelled' || order.status === 'pending') return null;

  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === order.status);
  if (currentIdx < 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">진행 상황</h2>
      <ol className="mt-4 grid grid-cols-4 gap-2">
        {TIMELINE_STEPS.map((step, idx) => {
          const reached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <li
              key={step.key}
              className="relative flex flex-col items-center text-center"
            >
              {idx > 0 && (
                <span
                  className={`absolute right-1/2 top-3 h-0.5 w-full -z-0 ${
                    reached ? 'bg-rose-500' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  reached
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-500'
                } ${isCurrent ? 'ring-4 ring-rose-100' : ''}`}
              >
                {idx + 1}
              </span>
              <span
                className={`mt-2 text-[11px] font-semibold ${
                  reached ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ───── Cancel Button (with confirm) ───── */

function CancelOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const cancelMutation = useCancelOrder();

  async function handleConfirm() {
    setErrorMsg('');
    try {
      await cancelMutation.mutateAsync({
        id: orderId,
        reason: reason.trim() || undefined,
      });
      setOpen(false);
      setReason('');
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message
        : undefined;
      setErrorMsg(msg ?? '주문 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 rounded-lg border border-rose-200 bg-white px-4 py-3 text-center text-sm font-medium text-rose-700 hover:bg-rose-50"
      >
        주문 취소
      </button>
    );
  }

  return (
    <div className="basis-full rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
      <div className="text-sm font-semibold text-rose-800">
        주문을 취소하시겠어요?
      </div>
      <p className="mt-1 text-xs text-rose-700">
        취소 사유를 입력하면 판매자가 빠르게 확인할 수 있습니다.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="취소 사유 (선택)"
        className="mt-2 w-full resize-none rounded-md border border-rose-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
      />
      {errorMsg && (
        <p className="mt-2 text-xs font-medium text-rose-700">{errorMsg}</p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason('');
            setErrorMsg('');
          }}
          disabled={cancelMutation.isPending}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          돌아가기
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={cancelMutation.isPending}
          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
        >
          {cancelMutation.isPending ? '처리 중…' : '취소 확정'}
        </button>
      </div>
    </div>
  );
}

/* ───── Misc ───── */

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'rose';
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd
        className={`text-right ${
          tone === 'rose' ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
