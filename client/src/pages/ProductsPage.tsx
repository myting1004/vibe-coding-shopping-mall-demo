import { Link, useSearchParams } from 'react-router-dom';
import CategoryNav from '@/components/CategoryNav';
import DiscountPrice from '@/components/DiscountPrice';
import { useProducts } from '@/hooks/useProducts';
import { HOME_CATEGORIES } from '@/lib/categories';
import type { Product } from '@/types/product';

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square w-full bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            no image
          </div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <div className="text-xs text-slate-500">
          {HOME_CATEGORIES.find((c) => c.key === product.category)?.label ??
            product.category}
        </div>
        <div className="font-semibold text-slate-900">{product.name}</div>
        <DiscountPrice price={product.price} />
        <div className="text-xs text-slate-500">재고 {product.stock}</div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categoryKey = searchParams.get('category') || 'all';
  const categoryLabel =
    HOME_CATEGORIES.find((c) => c.key === categoryKey)?.label ?? '전체';

  const queryParam =
    categoryKey === 'all' ? undefined : { category: categoryKey };

  const { data, isLoading, isError, error, refetch, isFetching } =
    useProducts(queryParam);

  return (
    <section className="space-y-4">
      <CategoryNav />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {categoryKey === 'all' ? '전체 상품' : categoryLabel}
          </h1>
          <p className="text-sm text-slate-500">
            {categoryKey === 'all'
              ? '모든 카테고리의 상품을 둘러보세요.'
              : `${categoryLabel} 카테고리 상품입니다.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {isFetching ? '불러오는 중…' : '새로고침'}
        </button>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          상품을 불러오는 중입니다…
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          API 호출 실패: {(error as Error).message}
          <div className="mt-1 text-xs text-red-500">
            서버가 떠 있는지 확인하세요 — <code>cd server && npm run dev</code>
          </div>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {categoryKey === 'all'
            ? '등록된 상품이 없습니다.'
            : `${categoryLabel} 카테고리에 등록된 상품이 없습니다.`}
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
