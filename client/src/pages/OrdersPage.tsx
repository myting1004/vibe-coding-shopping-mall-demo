import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useOrders } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types/order';

const STATUS_FILTERS: {
  value: OrderStatus | 'all';
  label: string;
}[] = [
  { value: 'all', label: '전체' },
  { value: 'paid', label: '결제완료' },
  { value: 'preparing', label: '상품준비' },
  { value: 'shipped', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '취소' },
];

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = (searchParams.get('status') ?? 'all') as
    | OrderStatus
    | 'all';
  const pageParam = Math.max(
    1,
    Number.parseInt(searchParams.get('page') ?? '1', 10) || 1
  );

  const { data, isLoading, isError, refetch, isFetching } = useOrders({
    page: pageParam,
    limit: PAGE_SIZE,
    status: statusParam === 'all' ? undefined : statusParam,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  function setStatus(value: OrderStatus | 'all') {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('status');
    } else {
      next.set('status', value);
    }
    next.delete('page');
    setSearchParams(next, { replace: true });
  }

  function setPage(page: number) {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(page));
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <article className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            주문 내역
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            지금까지의 주문을 확인하고 상세 내역을 살펴보세요
          </p>
        </div>
        {pagination && (
          <span className="hidden text-xs text-slate-400 sm:block">
            총 {pagination.total.toLocaleString()}건
          </span>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = f.value === statusParam;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
          주문 내역을 불러오지 못했습니다.
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-2 underline"
          >
            다시 시도
          </button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState filtered={statusParam !== 'all'} />
      ) : (
        <ul className={`space-y-3 ${isFetching ? 'opacity-60' : ''}`}>
          {items.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </ul>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={setPage}
        />
      )}
    </article>
  );
}

/* ───── Order Card ───── */

function OrderCard({ order }: { order: Order }) {
  const previewItems = order.items.slice(0, 3);
  const remaining = order.items.length - previewItems.length;
  const firstName = order.items[0]?.productSnapshot.name ?? '';
  const summaryName =
    order.items.length > 1
      ? `${firstName} 외 ${order.items.length - 1}건`
      : firstName;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">{formatDate(order.createdAt)}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono font-semibold text-slate-700">
            {order.orderNumber}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex -space-x-3">
          {previewItems.map((item) => (
            <div
              key={item._id}
              className="h-14 w-14 overflow-hidden rounded-lg border-2 border-white bg-slate-100 shadow-sm"
            >
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
          ))}
          {remaining > 0 && (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-white bg-slate-900/80 text-xs font-bold text-white shadow-sm">
              +{remaining}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-sm font-semibold text-slate-900">
            {summaryName || '주문 상품'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            총 수량 {totalQuantity(order)}개
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-extrabold text-rose-600">
            {order.totalAmount.toLocaleString()}원
          </div>
          <div className="text-[11px] text-slate-400">결제 금액</div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          상세 보기
        </Link>
      </div>
    </li>
  );
}

function totalQuantity(order: Order) {
  return order.items.reduce((sum, it) => sum + it.quantity, 0);
}

/* ───── Status Badge ───── */

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '결제대기',
  paid: '결제완료',
  preparing: '상품준비',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
};

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-slate-100 text-slate-600 ring-slate-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  preparing: 'bg-amber-50 text-amber-700 ring-amber-200',
  shipped: 'bg-sky-50 text-sky-700 ring-sky-200',
  delivered: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ───── Pagination ───── */

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  const pages = useMemo(() => buildPageWindow(page, totalPages), [
    page,
    totalPages,
  ]);

  return (
    <nav className="flex items-center justify-center gap-1 pt-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        이전
      </button>
      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`gap-${idx}`} className="px-2 text-xs text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`min-w-8 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
              p === page
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  );
}

function buildPageWindow(page: number, totalPages: number): (number | '…')[] {
  // 양 끝 1·N + 현재 ±1 만 노출, 중간은 ellipsis 로 압축.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const window = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(window)
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | '…')[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}

/* ───── Skeleton / Empty ───── */

function ListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <li
          key={idx}
          className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </ul>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
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
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">
        {filtered ? '해당 조건의 주문이 없습니다' : '아직 주문 내역이 없습니다'}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {filtered
          ? '다른 상태의 주문을 확인해 보세요.'
          : '마음에 드는 상품을 골라 첫 주문을 시작해 보세요.'}
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

/* ───── Utils ───── */

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}
