import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface KpiCard {
  label: string;
  value: string;
  delta: ReactNode;
  icon: ReactNode;
}

const kpis: KpiCard[] = [
  {
    label: '오늘 주문',
    value: '24',
    delta: <DeltaUp>12% 전일 대비</DeltaUp>,
    icon: <CartGlyph />,
  },
  {
    label: '오늘 매출',
    value: '15,420,000원',
    delta: <DeltaUp>8.5% 전일 대비</DeltaUp>,
    icon: <DollarGlyph />,
  },
  {
    label: '신규 주문',
    value: '8',
    delta: <span className="text-xs text-slate-500">처리 필요</span>,
    icon: <BellGlyph />,
  },
  {
    label: '총 회원',
    value: '1,234',
    delta: <span className="text-xs text-slate-500">이번 주 +5명</span>,
    icon: <UsersGlyph />,
  },
];

const activities: { dot: string; title: string; time: string }[] = [
  { dot: 'bg-emerald-500', title: '새 사용자가 가입했습니다', time: '5분 전' },
  { dot: 'bg-sky-500', title: '주문 #2024031 (10만원 이상) 들어옴', time: '18분 전' },
  {
    dot: 'bg-amber-500',
    title: '스탠바이미 2 Max 재고가 부족합니다',
    time: '1시간 전',
  },
  { dot: 'bg-emerald-500', title: '신규 회원 가입', time: '1시간 전' },
  { dot: 'bg-rose-500', title: '주문 취소 요청', time: '2시간 전' },
];

interface PopularProduct {
  rank: number;
  name: string;
  sku: string;
  thumbBg: string;
  sales: number;
  revenue: string;
}

const popularProducts: PopularProduct[] = [
  {
    rank: 1,
    name: '스탠바이미 2 Max',
    sku: '20279411-A',
    thumbBg: 'bg-slate-100',
    sales: 50,
    revenue: '79,500,000원',
  },
  {
    rank: 2,
    name: 'OLED evo AI TV 65인치',
    sku: 'OL7372UNA',
    thumbBg: 'bg-slate-100',
    sales: 42,
    revenue: '188,580,000원',
  },
  {
    rank: 3,
    name: '그램 Pro AI 16인치',
    sku: 'LG7913-AGBL',
    thumbBg: 'bg-slate-100',
    sales: 34,
    revenue: '67,650,000원',
  },
  {
    rank: 4,
    name: '코드제로 청소기 오브제',
    sku: '90T0AHA',
    thumbBg: 'bg-slate-100',
    sales: 26,
    revenue: '595,400원',
  },
  {
    rank: 5,
    name: '청견 AI 에어컨 2in1',
    sku: 'FQ20S6AKI2',
    thumbBg: 'bg-slate-100',
    sales: 18,
    revenue: '53,820,000원',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
          <p className="mt-1 text-sm text-slate-500">
            오늘의 쇼핑몰 현황을 확인하세요
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
        >
          <PlusGlyph />
          상품 등록
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">
                {kpi.label}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                {kpi.icon}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">
              {kpi.value}
            </div>
            <div className="mt-2">{kpi.delta}</div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">최근 주문</h2>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-slate-400">아직 주문이 없습니다</p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">최근 활동</h2>
          <ul className="mt-4 space-y-3">
            {activities.map((a, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`}
                  />
                  <span className="text-slate-700">{a.title}</span>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{a.time}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">인기 상품</h2>
          <Link
            to="/admin/products"
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                <th className="py-2 pr-4">순위</th>
                <th className="py-2 pr-4">상품</th>
                <th className="py-2 pr-4 text-right">판매수</th>
                <th className="py-2 pr-4 text-right">매출</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularProducts.map((p) => (
                <tr key={p.rank}>
                  <td className="py-3 pr-4">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                      {p.rank}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${p.thumbBg} text-slate-300`}
                      >
                        <ImageGlyph />
                      </span>
                      <div>
                        <div className="font-medium text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-700">
                    {p.sales}개
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-slate-900">
                    {p.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DeltaUp({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
      {children}
    </span>
  );
}

function PlusGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CartGlyph() {
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
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function DollarGlyph() {
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
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BellGlyph() {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UsersGlyph() {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ImageGlyph() {
  return (
    <svg
      width="20"
      height="20"
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
