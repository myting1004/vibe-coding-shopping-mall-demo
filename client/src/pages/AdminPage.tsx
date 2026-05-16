import { useAuth } from '@/providers/AuthProvider';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">어드민 콘솔</h1>
            <p className="mt-1 text-sm text-slate-500">
              {user?.name}님, 환영합니다. 관리자 전용 영역입니다.
            </p>
          </div>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            ADMIN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: '상품 관리', desc: '상품 등록 / 수정 / 재고 관리' },
          { title: '주문 관리', desc: '주문 조회 / 배송 상태 변경' },
          { title: '회원 관리', desc: '회원 목록 / 권한 변경' },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-sm font-bold text-slate-900">{c.title}</div>
            <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
