import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import DiscountPrice from '@/components/DiscountPrice';
import { useAddCartItem, useClearCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import {
  deriveFeatures,
  deriveListPrice,
  deriveRating,
  deriveReviews,
  deriveSpecs,
} from '@/lib/productDerive';
import { useAuth } from '@/providers/AuthProvider';
import type { Product } from '@/types/product';

type Tab = 'description' | 'specs' | 'reviews';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id);

  const [thumbIndex, setThumbIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>('description');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        상품을 불러오는 중입니다…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
        상품 정보를 불러올 수 없습니다.
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="ml-2 underline"
        >
          이전 페이지로
        </button>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      <DetailHeader onBack={() => navigate(-1)} />

      <section className="grid gap-8 lg:grid-cols-2">
        <GalleryPane
          product={product}
          activeIndex={thumbIndex}
          onSelect={setThumbIndex}
        />
        <SummaryPane
          product={product}
          quantity={quantity}
          onQuantity={setQuantity}
        />
      </section>

      <Tabs current={tab} onChange={setTab} reviewCount={deriveRating(product).reviewCount} />

      <section>
        {tab === 'description' && <DescriptionPanel product={product} />}
        {tab === 'specs' && <SpecsPanel product={product} />}
        {tab === 'reviews' && <ReviewsPanel product={product} />}
      </section>
    </article>
  );
}

/* ───── Header ───── */

function DetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <ChevronLeftIcon />
        뒤로
      </button>

      <div className="flex items-center gap-1">
        <IconButton label="찜하기">
          <HeartIcon />
        </IconButton>
        <IconButton label="공유">
          <ShareIcon />
        </IconButton>
      </div>
    </header>
  );
}

/* ───── Gallery ───── */

function GalleryPane({
  product,
  activeIndex,
  onSelect,
}: {
  product: Product;
  activeIndex: number;
  onSelect: (idx: number) => void;
}) {
  // 모델 1장만 있어 동일 이미지를 썸네일 3개로 노출 (선택 상태만 변경).
  const thumbs = [product.imageUrl, product.imageUrl, product.imageUrl];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
        {product.imageUrl ? (
          <img
            src={thumbs[activeIndex] || product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            이미지 없음
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          NEW
        </span>
      </div>

      <div className="flex gap-2">
        {thumbs.map((src, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              type="button"
              key={idx}
              onClick={() => onSelect(idx)}
              aria-label={`상품 이미지 ${idx + 1}`}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-slate-100 transition ${
                active
                  ? 'border-rose-500'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className={`h-full w-full object-cover ${
                    idx === 2 ? 'opacity-60' : idx === 1 ? 'opacity-80' : ''
                  }`}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Summary (price, buy CTA) ───── */

type Feedback = { tone: 'success' | 'error'; message: string };

function SummaryPane({
  product,
  quantity,
  onQuantity,
}: {
  product: Product;
  quantity: number;
  onQuantity: (n: number) => void;
}) {
  const { listPrice, discountPercent, discountAmount } = useMemo(
    () => deriveListPrice(product),
    [product]
  );
  const { rating, reviewCount } = useMemo(
    () => deriveRating(product),
    [product]
  );

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const addItem = useAddCartItem();
  const clearCart = useClearCart();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [buyNowActive, setBuyNowActive] = useState(false);
  const cartBusy = addItem.isPending || clearCart.isPending;

  // 성공/에러 피드백은 3초 후 자동 사라짐.
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(t);
  }, [feedback]);

  function cartErrorMessage(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback;
  }

  function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    addItem.mutate(
      { productId: product._id, quantity },
      {
        onSuccess: () =>
          setFeedback({
            tone: 'success',
            message: `장바구니에 ${quantity}개 담았습니다.`,
          }),
        onError: (err: unknown) => {
          setFeedback({
            tone: 'error',
            message: cartErrorMessage(
              err,
              '장바구니에 담는 중 오류가 발생했습니다.'
            ),
          });
        },
      }
    );
  }

  function handleBuyNow() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setFeedback(null);
    setBuyNowActive(true);
    clearCart.mutate(undefined, {
      onSuccess: () => {
        addItem.mutate(
          { productId: product._id, quantity },
          {
            onSuccess: () => {
              setBuyNowActive(false);
              navigate('/checkout');
            },
            onError: (err: unknown) => {
              setBuyNowActive(false);
              setFeedback({
                tone: 'error',
                message: cartErrorMessage(
                  err,
                  '주문 준비 중 오류가 발생했습니다.'
                ),
              });
            },
          }
        );
      },
      onError: (err: unknown) => {
        setBuyNowActive(false);
        setFeedback({
          tone: 'error',
          message: cartErrorMessage(
            err,
            '주문 준비 중 오류가 발생했습니다.'
          ),
        });
      },
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {product.sku}
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          {product.name}
        </h1>
        <div className="mt-2 flex items-center gap-1.5">
          <StarRow rating={rating} />
          <span className="text-sm font-medium text-slate-700">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">
            ({reviewCount}개 리뷰)
          </span>
        </div>
      </div>

      <div className="border-y border-slate-200 py-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-600">
            {discountPercent}%
          </span>
          <DiscountPrice price={product.price} size="md" />
        </div>
        <div className="mt-1 flex items-baseline gap-2 text-sm">
          <span className="text-slate-400 line-through">
            {listPrice.toLocaleString()}원
          </span>
          <span className="text-rose-500">
            {discountAmount.toLocaleString()}원 할인
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">수량</span>
        <div className="inline-flex items-center rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => onQuantity(Math.max(1, quantity - 1))}
            aria-label="수량 감소"
            className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            −
          </button>
          <div className="w-10 text-center text-sm font-semibold text-slate-900">
            {quantity}
          </div>
          <button
            type="button"
            onClick={() => onQuantity(quantity + 1)}
            aria-label="수량 증가"
            className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center">
        <Perk icon={<TruckIcon />} label="무료배송" />
        <Perk icon={<ShieldIcon />} label="1년 보증" />
        <Perk icon={<ReturnIcon />} label="30일 반품" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={cartBusy}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addItem.isPending && !buyNowActive ? '담는 중…' : '장바구니'}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={cartBusy}
          className="rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buyNowActive ? '이동 중…' : '바로 구매'}
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <span>{feedback.message}</span>
          {feedback.tone === 'success' && (
            <Link
              to="/cart"
              className="text-xs font-semibold underline-offset-2 hover:underline"
            >
              장바구니 보기
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Perk({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        {icon}
      </span>
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
}

/* ───── Tabs ───── */

function Tabs({
  current,
  onChange,
  reviewCount,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
  reviewCount: number;
}) {
  const items: { key: Tab; label: string }[] = [
    { key: 'description', label: '상품 설명' },
    { key: 'specs', label: '상세 스펙' },
    { key: 'reviews', label: `리뷰 (${reviewCount})` },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="grid grid-cols-3" aria-label="상품 정보 탭">
        {items.map((item) => {
          const active = current === item.key;
          return (
            <button
              type="button"
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ───── Description Tab ───── */

function DescriptionPanel({ product }: { product: Product }) {
  const features = deriveFeatures(product);
  const intro =
    product.description?.trim() ||
    'α11 AI 프로세서가 채워주는 OLED TV입니다. 한 단계 진화한 색감과 깊이있는 명암비로 영상이 살아납니다. AI 업스케일링으로 모든 콘텐츠를 4K 수준으로 향상시켜 줍니다.';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-slate-900">제품 소개</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {intro}
        </p>
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">주요 특징</h2>
        <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <CheckIcon />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───── Specs Tab ───── */

function SpecsPanel({ product }: { product: Product }) {
  const specs = deriveSpecs(product);
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900">상세 사양</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {specs.map((row) => (
              <tr key={row.label}>
                <th className="w-40 bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-slate-700">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───── Reviews Tab ───── */

function ReviewsPanel({ product }: { product: Product }) {
  const { rating, reviewCount, distribution } = useMemo(
    () => deriveRating(product),
    [product]
  );
  const reviews = useMemo(() => deriveReviews(product, 3), [product]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">고객 리뷰</h2>
        <button
          type="button"
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          리뷰 작성
        </button>
      </div>

      <div className="grid items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-[auto_1fr]">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-slate-900">
            {rating.toFixed(1)}
          </div>
          <div className="mt-1 flex justify-center">
            <StarRow rating={rating} />
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {reviewCount}개 리뷰
          </div>
        </div>

        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, idx) => {
            const pct = distribution[idx] ?? 0;
            return (
              <div
                key={star}
                className="flex items-center gap-3 text-xs text-slate-500"
              >
                <span className="w-4 text-right">{star}</span>
                <span className="text-amber-400">★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {reviews.map((r) => (
          <li key={r.id} className="space-y-2 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  {r.authorMasked.charAt(0)}
                </span>
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">
                    {r.authorMasked}
                  </div>
                  <div className="text-xs text-slate-400">{r.date}</div>
                </div>
              </div>
              <StarRow rating={r.rating} />
            </div>
            <p className="text-sm text-slate-600">{r.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───── Reusable bits ───── */

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center text-base leading-none text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true">
          {n <= Math.round(rating) ? '★' : '☆'}
        </span>
      ))}
      <span className="sr-only">평점 {rating} / 5</span>
    </div>
  );
}

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}

/* ───── Icons ───── */

function ChevronLeftIcon() {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function HeartIcon() {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ShareIcon() {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TruckIcon() {
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
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ReturnIcon() {
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
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
