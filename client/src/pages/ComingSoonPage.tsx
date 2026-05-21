import { Link, useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/promotions': '기획전',
  '/brands': '브랜드',
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const section = PAGE_TITLES[pathname] ?? '페이지';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl">
        🚧
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">준비중입니다</h1>
      <p className="mt-2 text-slate-600">
        <span className="font-semibold text-rose-600">{section}</span> 페이지는
        곧 오픈할 예정입니다.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        조금만 기다려 주세요. 다른 상품은 지금 둘러보실 수 있습니다.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/products"
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
        >
          상품 둘러보기
        </Link>
        <Link
          to="/"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          홈으로
        </Link>
      </div>
    </section>
  );
}
