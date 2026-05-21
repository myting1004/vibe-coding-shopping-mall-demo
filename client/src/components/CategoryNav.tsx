import { Link, useSearchParams } from 'react-router-dom';
import { HOME_CATEGORIES } from '@/lib/categories';

export default function CategoryNav() {
  const [searchParams] = useSearchParams();
  const activeKey = searchParams.get('category') || 'all';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
        {HOME_CATEGORIES.map((c) => {
          const isActive = activeKey === c.key;
          const to =
            c.key === 'all' ? '/products' : `/products?category=${c.key}`;

          return (
            <Link
              key={c.key}
              to={to}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition ${
                isActive
                  ? 'bg-rose-50 ring-1 ring-rose-200'
                  : 'hover:bg-rose-50'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                  isActive ? 'bg-rose-100' : 'bg-slate-100'
                }`}
              >
                {c.icon}
              </span>
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-rose-700' : 'text-slate-700'
                }`}
              >
                {c.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
