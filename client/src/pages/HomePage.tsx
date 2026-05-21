import { Link } from 'react-router-dom';
import CategoryNav from '@/components/CategoryNav';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/product';

const NEWS = [
  {
    id: 'n1',
    title: '신형 OLED TV 출시 — 사전예약 진행 중',
    excerpt: '한 단계 진화한 화질, 사전예약 고객에게는 사운드바를 증정합니다.',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: 'n2',
    title: '게이밍 모니터 신모델 입고',
    excerpt: '240Hz, HDR400 — 게이밍을 위한 최적의 선택.',
    image:
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: 'n3',
    title: '봄맞이 노트북 할인전',
    excerpt: '최대 25% 할인, 무이자 12개월 제공.',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: 'n4',
    title: 'VR 헤드셋 체험존 운영',
    excerpt: '오프라인 매장에서 신형 VR 기기를 직접 체험해 보세요.',
    image:
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=80&auto=format&fit=crop',
  },
];

const FAQS = [
  { id: 'f1', q: '배송은 얼마나 걸리나요?' },
  { id: 'f2', q: '교환·환불은 어떻게 하나요?' },
  { id: 'f3', q: '회원 등급 혜택이 궁금해요.' },
];

const NOTICES = [
  { id: 'b1', q: '5월 정기 점검 안내', tag: '공지' },
  { id: 'b2', q: '신규 회원 쿠폰 발급 안내', tag: '이벤트' },
  { id: 'b3', q: '개인정보 처리방침 개정 안내', tag: '안내' },
];

function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
    >
      <article>
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              no image
            </div>
          )}
          {badge && (
            <span className="absolute left-2 top-2 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              {badge}
            </span>
          )}
          <button
            type="button"
            aria-label="찜하기"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm hover:text-rose-600"
          >
            ♡
          </button>
        </div>
        <div className="space-y-1 p-3">
          <div className="text-[11px] text-slate-400">{product.category}</div>
          <div className="line-clamp-1 text-sm font-semibold text-slate-900">
            {product.name}
          </div>
          <div className="text-sm font-bold text-slate-900">
            {product.price.toLocaleString()}원
          </div>
        </div>
      </article>
    </Link>
  );
}

function PlaceholderCard({ index }: { index: number }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-square w-full animate-pulse bg-slate-100" />
      <div className="space-y-1.5 p-3">
        <div className="h-2 w-12 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
      </div>
      <span className="sr-only">로딩 중 카드 {index}</span>
    </article>
  );
}

export default function HomePage() {
  const { data: products } = useProducts();

  const popular = (products ?? []).slice(0, 8);
  const subscribed = (products ?? []).slice(8, 11);

  return (
    <section className="space-y-10">
      {/* 히어로 배너 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-rose-700 text-white shadow-lg">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1600&q=80&auto=format&fit=crop"
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative grid gap-6 px-8 py-12 md:grid-cols-2 md:px-12 md:py-16">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
              new arrival
            </span>
            <h1 className="text-3xl font-black leading-tight md:text-5xl">
              NEW OLED TV
              <br />
              완벽한 화질의 시작
            </h1>
            <p className="max-w-md text-sm text-white/90">
              사전예약 고객에게만 드리는 특별한 혜택. 지금 만나보세요.
            </p>
            <Link
              to="/products"
              className="inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-rose-600 shadow hover:bg-slate-50"
            >
              자세히 보기 →
            </Link>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="grid grid-cols-2 gap-3">
              {['Samsung', 'Meiding', 'Privacy', 'Netflix'].map((b) => (
                <div
                  key={b}
                  className="flex h-16 w-32 items-center justify-center rounded-lg bg-white/15 text-sm font-semibold backdrop-blur"
                >
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center gap-2 pb-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition ${
                i === 0 ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      <CategoryNav />

      {/* 상단 알림 카드 3개 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-rose-600 p-4 text-white shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
            오늘의 딜
          </div>
          <div className="mt-1 text-base font-bold">최대 40% 할인전</div>
          <div className="mt-1 text-xs opacity-90">
            인기 가전 한정 수량 특가 진행
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            new event
          </div>
          <div className="mt-1 text-base font-bold text-slate-900">
            신규 회원 10% 쿠폰
          </div>
          <div className="mt-1 text-xs text-slate-500">
            가입 즉시 발급 · 첫 구매 시 사용 가능
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            membership
          </div>
          <div className="mt-1 text-base font-bold text-amber-900">
            멤버십 혜택 안내
          </div>
          <div className="mt-1 text-xs text-amber-800">
            등급별 적립률 / 무료 배송 혜택 제공
          </div>
        </div>
      </div>

      {/* 인기 제품 */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">인기 제품</h2>
            <p className="text-xs text-slate-500">
              가장 많이 찾는 제품을 모았습니다
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popular.length > 0
            ? popular.map((p, i) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  badge={i === 0 ? 'NEW' : i === 3 ? 'HOT' : undefined}
                />
              ))
            : Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} index={i} />
              ))}
        </div>
      </section>

      {/* 가장 구독 / 정기 배송 */}
      <section className="rounded-2xl bg-slate-100 p-6">
        <div className="mb-4 text-center">
          <h2 className="text-lg font-bold text-slate-900">가장 구독</h2>
          <p className="text-xs text-slate-500">
            정기 배송으로 더 합리적으로 만나보세요
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {subscribed.length > 0
            ? subscribed.map((p) => (
                <ProductCard key={p._id} product={p} badge="구독" />
              ))
            : Array.from({ length: 3 }).map((_, i) => (
                <PlaceholderCard key={i} index={i} />
              ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/products"
            className="inline-block rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            구독 상품 더 보기
          </Link>
        </div>
      </section>

      {/* 최신 제품 소식 */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">최신 제품 소식</h2>
          <p className="text-xs text-slate-500">새로 들어온 소식을 확인하세요</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {NEWS.map((n) => (
            <article
              key={n.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-video w-full bg-slate-100">
                <img
                  src={n.image}
                  alt={n.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <div className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {n.title}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {n.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ / 공지 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">자주 묻는 질문</h3>
            <span className="text-[11px] text-slate-400">FAQ</span>
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {FAQS.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between py-2.5 text-slate-700 hover:text-rose-600"
              >
                <span>Q. {f.q}</span>
                <span className="text-slate-300">+</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">베스트셀러 카탈로그 안내</h3>
            <span className="text-[11px] text-slate-400">NOTICE</span>
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {NOTICES.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between py-2.5 text-slate-700 hover:text-rose-600"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                    {n.tag}
                  </span>
                  {n.q}
                </span>
                <span className="text-slate-300">→</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}
