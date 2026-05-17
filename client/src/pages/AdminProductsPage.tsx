import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useProducts } from '@/hooks/useProducts';
import { CATEGORIES } from '@/lib/categories';
import { deriveListPrice } from '@/lib/productDerive';
import type { Product } from '@/types/product';

type CategoryFilter = 'all' | string;

const FILTER_CATEGORY_KEYS: string[] = [
  'tv',
  'laptop',
  'refrigerator',
  'washer',
  'aircon',
  'home',
];

const FILTER_CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  ...FILTER_CATEGORY_KEYS.map((key) => {
    const def = CATEGORIES.find((c) => c.key === key);
    return { key, label: def?.label ?? key };
  }),
];

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const queryParam =
    category === 'all' ? undefined : { category };
  const { data: products, isLoading } = useProducts(queryParam);

  const filtered = useMemo(() => {
    const list = products ?? [];
    const q = keyword.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [category, keyword]);

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">상품 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            총 {filtered.length}개의 상품
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
        >
          <PlusIcon />
          상품 등록
        </Link>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="상품명 또는 SKU로 검색..."
            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTER_CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-left text-xs font-medium text-slate-500">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                    aria-label="전체 선택"
                  />
                </th>
                <th className="px-4 py-3">상품</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3 text-right">정가</th>
                <th className="px-4 py-3 text-right">판매가</th>
                <th className="px-4 py-3 text-right">할인율</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                    상품을 불러오는 중입니다…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                    조건에 맞는 상품이 없습니다
                  </td>
                </tr>
              ) : (
                pageItems.map((p) => <ProductRow key={p._id} product={p} />)
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <Pagination
            total={filtered.length}
            page={safePage}
            totalPages={totalPages}
            pageStart={pageStart}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const { listPrice, discountPercent } = useMemo(
    () => deriveListPrice(product),
    [product]
  );
  const inStock = product.stock > 0;
  const categoryLabel =
    CATEGORIES.find((c) => c.key === product.category)?.label ??
    product.category;

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
          aria-label={`${product.name} 선택`}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-300">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon />
            )}
          </span>
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-900">
              {product.name}
            </div>
            <div className="truncate text-xs text-slate-400">{product.sku}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">{categoryLabel}</td>
      <td className="px-4 py-3 text-right text-slate-400 line-through">
        {listPrice.toLocaleString()}원
      </td>
      <td className="px-4 py-3 text-right font-semibold text-slate-900">
        {product.price.toLocaleString()}원
      </td>
      <td className="px-4 py-3 text-right font-semibold text-rose-600">
        {discountPercent}%
      </td>
      <td className="px-4 py-3 text-center">
        {inStock ? (
          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
            판매중
          </span>
        ) : (
          <span className="inline-flex rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
            품절
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="더보기"
        >
          <MoreIcon />
        </button>
      </td>
    </tr>
  );
}

function Pagination({
  total,
  page,
  totalPages,
  pageStart,
  pageSize,
  onChange,
}: {
  total: number;
  page: number;
  totalPages: number;
  pageStart: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const from = pageStart + 1;
  const to = Math.min(pageStart + pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-slate-500">
        총 <span className="font-semibold text-slate-700">{total}</span>개 중{' '}
        <span className="font-semibold text-slate-700">
          {from}-{to}
        </span>
        번
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="이전 페이지"
        >
          <ChevronLeftIcon />
        </button>

        {pages.map((p) => {
          const active = p === page;
          return (
            <button
              type="button"
              key={p}
              onClick={() => onChange(p)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold transition ${
                active
                  ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="다음 페이지"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </nav>
  );
}

function PlusIcon() {
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

function MoreIcon() {
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
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
