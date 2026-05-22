import { Link } from 'react-router-dom';
import { HOME_CATEGORIES } from '@/lib/categories';

type FloatingCategoryRailProps = {
  visible: boolean;
  activeKey?: string;
};

/** 본문(max-w-6xl) 오른쪽 바깥 — 컨텐츠와 겹치지 않도록 left 기준 배치 */
const RAIL_LEFT = 'calc(50% + min(36rem, 50vw - 1rem) + 0.25rem)';

export default function FloatingCategoryRail({
  visible,
  activeKey = 'all',
}: FloatingCategoryRailProps) {
  return (
    <nav
      aria-label="빠른 카테고리 이동"
      className={`fixed z-[15] hidden min-w-[4.75rem] transition-all duration-300 ease-out min-[80rem]:block ${
        visible
          ? 'pointer-events-auto translate-x-0 opacity-100'
          : 'pointer-events-none translate-x-2 opacity-0'
      }`}
      style={{
        top: '5.25rem',
        left: RAIL_LEFT,
      }}
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 px-1.5 py-1.5 shadow-lg shadow-rose-100/40 backdrop-blur-md">
        <p className="mb-1 whitespace-nowrap px-0.5 text-center text-[11px] font-bold text-rose-600">
          카테고리
        </p>
        <ul className="flex flex-col gap-0.5">
          {HOME_CATEGORIES.map((c) => {
            const isActive = activeKey === c.key;
            const to =
              c.key === 'all' ? '/products' : `/products?category=${c.key}`;

            return (
              <li key={c.key}>
                <Link
                  to={to}
                  title={c.label}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 transition ${
                    isActive
                      ? 'bg-rose-50 ring-1 ring-rose-200'
                      : 'hover:bg-rose-50'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                      isActive ? 'bg-rose-100' : 'bg-slate-100'
                    }`}
                  >
                    {c.icon}
                  </span>
                  <span
                    className={`whitespace-nowrap text-center text-[11px] font-semibold leading-none ${
                      isActive ? 'text-rose-700' : 'text-slate-700'
                    }`}
                  >
                    {c.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
