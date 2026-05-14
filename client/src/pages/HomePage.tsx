import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 px-8 py-12 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          쇼핑몰 데모에 오신 걸 환영합니다
        </h1>
        <p className="mt-2 max-w-xl text-indigo-100">
          Vite + React + TypeScript + Tailwind, 그리고 Express + MongoDB API
          서버와 연동되는 풀스택 데모입니다.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow transition hover:bg-indigo-50"
        >
          상품 보러 가기 →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Vite', desc: '빠른 dev server + HMR' },
          { title: 'TanStack Query', desc: '서버 상태 캐싱/리패칭' },
          { title: 'Tailwind v4', desc: 'utility-first 스타일링' },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm font-semibold text-slate-900">
              {card.title}
            </div>
            <p className="mt-1 text-xs text-slate-500">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
