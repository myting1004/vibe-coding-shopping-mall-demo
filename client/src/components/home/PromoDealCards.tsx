import { Link } from 'react-router-dom';

const CARDS = [
  {
    id: 'deal',
    tag: '오늘의 딜',
    title: '최대 40% 할인전',
    desc: '인기 가전 한정 수량 특가 진행',
    href: '/products',
    boxClass: 'rounded-xl bg-rose-600 p-4 text-white shadow-sm',
    tagClass: 'text-[11px] font-semibold uppercase tracking-wider opacity-80',
    titleClass: 'mt-1 text-base font-bold',
    descClass: 'mt-1 text-xs opacity-90',
    linkClass: 'text-xs font-semibold text-white/90 hover:underline',
  },
  {
    id: 'event',
    tag: 'new event',
    title: '신규 회원 10% 쿠폰',
    desc: '가입 즉시 발급 · 첫 구매 시 사용 가능',
    href: '/signup',
    boxClass: 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
    tagClass: 'text-[11px] font-semibold uppercase tracking-wider text-slate-400',
    titleClass: 'mt-1 text-base font-bold text-slate-900',
    descClass: 'mt-1 text-xs text-slate-500',
    linkClass: 'text-xs font-semibold text-rose-600 hover:underline',
  },
  {
    id: 'member',
    tag: 'membership',
    title: '멤버십 혜택 안내',
    desc: '등급별 적립률 / 무료 배송 혜택 제공',
    href: '/products',
    boxClass: 'rounded-xl bg-amber-50 p-4 shadow-sm',
    tagClass: 'text-[11px] font-semibold uppercase tracking-wider text-amber-700',
    titleClass: 'mt-1 text-base font-bold text-amber-900',
    descClass: 'mt-1 text-xs text-amber-800',
    linkClass: 'text-xs font-semibold text-amber-800 hover:underline',
  },
] as const;

export default function PromoDealCards() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {CARDS.map((card) => (
        <Link
          key={card.id}
          to={card.href}
          className={`block transition hover:opacity-95 ${card.boxClass}`}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className={card.tagClass}>{card.tag}</div>
              <div className={card.titleClass}>{card.title}</div>
              <p className={card.descClass}>{card.desc}</p>
            </div>
            <span className={`shrink-0 ${card.linkClass}`}>바로가기 →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
