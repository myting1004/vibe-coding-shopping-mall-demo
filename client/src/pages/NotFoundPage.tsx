import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="text-6xl font-bold text-slate-300">404</div>
      <p className="mt-2 text-slate-600">페이지를 찾을 수 없습니다.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        홈으로
      </Link>
    </section>
  );
}
