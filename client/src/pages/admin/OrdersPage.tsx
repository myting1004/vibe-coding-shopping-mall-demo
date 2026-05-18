import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';

import {
  useCancelOrder,
  useOrders,
  useUpdateOrderStatus,
} from '@/hooks/useOrders';
import type { Order, OrderStatus, PaymentMethod } from '@/types/order';

const PAGE_SIZE = 20;

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '결제대기' },
  { value: 'paid', label: '결제완료' },
  { value: 'preparing', label: '상품준비' },
  { value: 'shipped', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '취소' },
];

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

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: '카드',
  bank_transfer: '계좌이체',
  virtual_account: '가상계좌',
};

// admin 은 워크플로 순서와 상관없이 모든 상태(취소 제외)로 자유롭게 변경 가능.
// 취소는 환불 로직이 수반되므로 별도 cancelOrder 엔드포인트로 분리되어 select 에서는 제외.
const ADMIN_ASSIGNABLE_STATUSES: Exclude<OrderStatus, 'cancelled'>[] = [
  'pending',
  'paid',
  'preparing',
  'shipped',
  'delivered',
];

// 상태별 카운트는 status 필터를 걸지 않은 같은 페이지 데이터로만 산출하면 정확하지 않으므로
// 전체 KPI 는 서버 응답의 pagination.total 만 사용하고, 그 외에는 현재 페이지 기준 카운트만 보조 표시한다.
// 단순화를 위해 status 별 KPI 는 각각의 status 로 별도 호출하지 않고 — 현재 필터링 결과만 보여준다.

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = (searchParams.get('status') ?? 'all') as
    | OrderStatus
    | 'all';
  const pageParam = Math.max(
    1,
    Number.parseInt(searchParams.get('page') ?? '1', 10) || 1
  );
  const keywordParam = searchParams.get('q') ?? '';
  const [keywordDraft, setKeywordDraft] = useState(keywordParam);

  const { data, isLoading, isError, refetch, isFetching } = useOrders({
    page: pageParam,
    limit: PAGE_SIZE,
    status: statusParam === 'all' ? undefined : statusParam,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  // 클라이언트 측 키워드 필터 (서버는 키워드 검색 미지원이라 현재 페이지 안에서만 동작).
  const filteredItems = useMemo(() => {
    const q = keywordParam.trim().toLowerCase();
    if (!q) return items;
    return items.filter((o) => {
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.shippingAddress.recipient.toLowerCase().includes(q) ||
        o.items.some((it) =>
          it.productSnapshot.name.toLowerCase().includes(q)
        )
      );
    });
  }, [items, keywordParam]);

  // KPI — 현재 페이지에 한정된 합계 + 서버 total.
  const kpis = useMemo(() => {
    const totalAmount = items.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidCount = items.filter((o) => o.status === 'paid').length;
    const shippingCount = items.filter(
      (o) => o.status === 'preparing' || o.status === 'shipped'
    ).length;
    const cancelledCount = items.filter(
      (o) => o.status === 'cancelled'
    ).length;
    return { totalAmount, paidCount, shippingCount, cancelledCount };
  }, [items]);

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

  function applyKeyword(value: string) {
    const next = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) {
      next.set('q', trimmed);
    } else {
      next.delete('q');
    }
    next.delete('page');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">주문 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            모든 주문을 조회하고 배송 상태를 변경하세요
            {pagination && (
              <>
                {' · '}
                총{' '}
                <span className="font-semibold text-slate-700">
                  {pagination.total.toLocaleString()}건
                </span>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshIcon spinning={isFetching} />
          새로고침
        </button>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="조회된 주문"
          value={`${pagination?.total.toLocaleString() ?? '0'}건`}
          accent="rose"
        />
        <KpiCard
          label="현재 페이지 결제완료"
          value={`${kpis.paidCount}건`}
          accent="emerald"
        />
        <KpiCard
          label="현재 페이지 배송"
          value={`${kpis.shippingCount}건`}
          accent="sky"
        />
        <KpiCard
          label="현재 페이지 합계"
          value={`${kpis.totalAmount.toLocaleString()}원`}
          accent="slate"
        />
      </section>

      {/* 필터 + 검색 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyKeyword(keywordDraft);
          }}
          className="relative flex-1"
        >
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={keywordDraft}
            onChange={(e) => setKeywordDraft(e.target.value)}
            placeholder="주문번호 · 수령인 · 상품명으로 검색 (현재 페이지)"
            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          {keywordParam && (
            <button
              type="button"
              onClick={() => {
                setKeywordDraft('');
                applyKeyword('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
              aria-label="검색어 지우기"
            >
              <CloseIcon />
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const active = f.value === statusParam;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatus(f.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 테이블 */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">주문번호 · 일시</th>
                <th className="px-4 py-3">상품</th>
                <th className="px-4 py-3">수령인</th>
                <th className="px-4 py-3">결제수단</th>
                <th className="px-4 py-3 text-right">결제금액</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="w-32 px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 ${isFetching ? 'opacity-60' : ''}`}>
              {isLoading ? (
                <SkeletonRows />
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-rose-600">
                    주문 목록을 불러오지 못했습니다.
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="ml-2 underline"
                    >
                      다시 시도
                    </button>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-slate-400">
                    {keywordParam || statusParam !== 'all'
                      ? '조건에 맞는 주문이 없습니다'
                      : '아직 주문이 없습니다'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((order) => (
                  <OrderRow key={order._id} order={order} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

/* ───── KPI Card ───── */

const ACCENT_BG: Record<'rose' | 'emerald' | 'sky' | 'slate', string> = {
  rose: 'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  sky: 'bg-sky-50 text-sky-600',
  slate: 'bg-slate-100 text-slate-600',
};

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'rose' | 'emerald' | 'sky' | 'slate';
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_BG[accent]}`}
        >
          <DotIcon />
        </span>
      </div>
      <div className="mt-2 text-xl font-bold text-slate-900">{value}</div>
    </article>
  );
}

/* ───── Order Row ───── */

function OrderRow({ order }: { order: Order }) {
  const updateMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rowError, setRowError] = useState('');

  const firstName = order.items[0]?.productSnapshot.name ?? '';
  const summaryName =
    order.items.length > 1
      ? `${firstName} 외 ${order.items.length - 1}건`
      : firstName || '주문 상품';
  const totalQty = order.items.reduce((sum, it) => sum + it.quantity, 0);

  // 취소 상태에서는 운영 정책상 다시 활성화하지 않도록 select 를 잠근다.
  // (그 외 상태끼리는 admin 이 자유롭게 앞/뒤로 변경 가능)
  const canChangeStatus = order.status !== 'cancelled';
  const statusCandidates = ADMIN_ASSIGNABLE_STATUSES.filter(
    (s) => s !== order.status
  );
  const canCancel =
    order.status === 'pending' ||
    order.status === 'paid' ||
    order.status === 'preparing';

  async function handleChangeStatus(next: Exclude<OrderStatus, 'cancelled'>) {
    if (next === order.status) return;
    setRowError('');
    try {
      await updateMutation.mutateAsync({ id: order._id, status: next });
    } catch (err) {
      setRowError(extractErrorMessage(err, '상태 변경에 실패했습니다.'));
    }
  }

  async function handleCancel() {
    setRowError('');
    try {
      await cancelMutation.mutateAsync({
        id: order._id,
        reason: cancelReason.trim() || undefined,
      });
      setCancelOpen(false);
      setCancelReason('');
    } catch (err) {
      setRowError(extractErrorMessage(err, '주문 취소에 실패했습니다.'));
    }
  }

  const pending = updateMutation.isPending || cancelMutation.isPending;

  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-4 py-3 align-top">
          <div className="font-mono text-xs font-semibold text-slate-900">
            {order.orderNumber}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {formatDate(order.createdAt)}
          </div>
        </td>
        <td className="px-4 py-3 align-top">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-300">
              {order.items[0]?.productSnapshot.imageUrl ? (
                <img
                  src={order.items[0].productSnapshot.imageUrl}
                  alt={order.items[0].productSnapshot.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon />
              )}
            </span>
            <div className="min-w-0">
              <div className="line-clamp-1 max-w-[18rem] text-sm font-medium text-slate-900">
                {summaryName}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                총 {totalQty}개
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 align-top text-slate-700">
          <div className="text-sm font-medium">
            {order.shippingAddress.recipient}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {order.shippingAddress.phone}
          </div>
        </td>
        <td className="px-4 py-3 align-top text-slate-600">
          {PAYMENT_METHOD_LABEL[order.payment.method]}
        </td>
        <td className="px-4 py-3 align-top text-right">
          <div className="text-sm font-semibold text-slate-900">
            {order.totalAmount.toLocaleString()}원
          </div>
          {order.shippingFee > 0 && (
            <div className="mt-0.5 text-[11px] text-slate-400">
              배송비 {order.shippingFee.toLocaleString()}원
            </div>
          )}
        </td>
        <td className="px-4 py-3 align-top text-center">
          <StatusBadge status={order.status} />
          {canChangeStatus && (
            <div className="mt-2">
              <StatusChangeSelect
                current={order.status}
                candidates={statusCandidates}
                onChange={handleChangeStatus}
                disabled={pending}
              />
            </div>
          )}
        </td>
        <td className="px-4 py-3 align-top text-right">
          <div className="flex flex-col items-end gap-1">
            <Link
              to={`/orders/${order._id}`}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              상세
            </Link>
            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                취소
              </button>
            )}
          </div>
        </td>
      </tr>

      {(rowError || cancelOpen) && (
        <tr className="bg-slate-50/60">
          <td colSpan={7} className="px-4 py-3">
            {rowError && (
              <div className="mb-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {rowError}
              </div>
            )}
            {cancelOpen && (
              <div className="rounded-md border border-rose-200 bg-white p-3">
                <div className="text-xs font-semibold text-rose-800">
                  주문 {order.orderNumber} 을(를) 취소하시겠어요?
                </div>
                <p className="mt-0.5 text-[11px] text-rose-700">
                  결제가 완료된 상태라면 결제 환불이 함께 처리됩니다.
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                  placeholder="취소 사유 (선택)"
                  className="mt-2 w-full resize-none rounded-md border border-rose-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCancelOpen(false);
                      setCancelReason('');
                    }}
                    disabled={cancelMutation.isPending}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    돌아가기
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? '처리 중…' : '취소 확정'}
                  </button>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/* ───── Status Badge / Select ───── */

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function StatusChangeSelect({
  current,
  candidates,
  onChange,
  disabled,
}: {
  current: OrderStatus;
  candidates: Exclude<OrderStatus, 'cancelled'>[];
  onChange: (next: Exclude<OrderStatus, 'cancelled'>) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value=""
      onChange={(e) => {
        const value = e.target.value as Exclude<OrderStatus, 'cancelled'>;
        if (value) onChange(value);
      }}
      disabled={disabled}
      className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:opacity-50"
      aria-label={`${STATUS_LABEL[current]} 상태 변경`}
    >
      <option value="">상태 변경…</option>
      {candidates.map((c) => (
        <option key={c} value={c}>
          {STATUS_LABEL[c]}
        </option>
      ))}
    </select>
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
  onChange: (page: number) => void;
}) {
  const pages = useMemo(
    () => buildPageWindow(page, totalPages),
    [page, totalPages]
  );

  return (
    <nav
      aria-label="페이지 이동"
      className="flex items-center justify-center gap-1 border-t border-slate-200 bg-white px-4 py-3"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="이전 페이지"
      >
        <ChevronLeftIcon />
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
            aria-current={p === page ? 'page' : undefined}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold transition ${
              p === page
                ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="다음 페이지"
      >
        <ChevronRightIcon />
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

/* ───── Skeleton ───── */

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx}>
          <td colSpan={7} className="px-4 py-3">
            <div className="h-12 animate-pulse rounded-md bg-slate-100" />
          </td>
        </tr>
      ))}
    </>
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

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)
      ?.message;
    if (msg) return msg;
  }
  return fallback;
}

/* ───── Icons ───── */

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
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
      className={spinning ? 'animate-spin' : undefined}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
      <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}
