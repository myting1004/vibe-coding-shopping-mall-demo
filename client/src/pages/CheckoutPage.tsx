import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';

import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/providers/AuthProvider';
import type { CartItem } from '@/types/cart';
import type { PaymentMethod } from '@/types/order';
import type { IamportResponse } from '@/types/iamport';

interface ShippingForm {
  recipient: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string;
  memo: string;
}

const EMPTY_FORM: ShippingForm = {
  recipient: '',
  phone: '',
  zipCode: '',
  address1: '',
  address2: '',
  memo: '',
};

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string }[] =
  [
    { value: 'card', label: '신용/체크카드', hint: '즉시 결제' },
    {
      value: 'bank_transfer',
      label: '실시간 계좌이체',
      hint: '은행 인증 필요',
    },
    { value: 'virtual_account', label: '가상계좌', hint: '입금 확인 후 발송' },
  ];

// PortOne(iamport) 가맹점 식별코드.
const IMP_ACCOUNT_ID = 'imp84431328';
// 사용할 PG 사. null 이면 PortOne 콘솔에 등록된 기본 PG 가 자동 적용.
// 여러 PG 가 등록된 경우 명시 필요 (예: 'html5_inicis', 'tosspayments', 'kcp', 'kakaopay').
const IMP_PG: string | null = 'html5_inicis';

// 우리 도메인의 결제 수단 → IMP pay_method 매핑.
const IMP_PAY_METHOD: Record<PaymentMethod, 'card' | 'trans' | 'vbank'> = {
  card: 'card',
  bank_transfer: 'trans',
  virtual_account: 'vbank',
};

// IMP merchant_uid — 결제건을 식별하는 가맹점측 고유 ID.
// 데모에서는 서버에서 주문번호를 미리 발급받지 않고 클라이언트에서 임시 ID 를 생성한다.
function generateMerchantUid() {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `mid_${ts}_${rand}`;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const createOrder = useCreateOrder();
  const navigate = useNavigate();

  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 포트원 결제 모듈 초기화 — index.html 에서 로드된 window.IMP 가 있어야 동작.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.IMP) {
      console.warn(
        '[PortOne] IMP SDK 가 로드되지 않았습니다. index.html 의 script 태그를 확인하세요.'
      );
      return;
    }
    window.IMP.init(IMP_ACCOUNT_ID);
  }, []);

  // 로그인 정보로 기본값 채우기 — User.address 는 단일 문자열이라 address1 에만 매핑.
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      recipient: prev.recipient || user.name,
      address1: prev.address1 || user.address,
    }));
  }, [user]);

  const items = cart?.items ?? [];
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.product.price * it.quantity, 0),
    [items]
  );
  const shippingFee = 0;
  const discount = 0;
  const totalAmount = Math.max(0, subtotal + shippingFee - discount);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        주문 정보를 불러오는 중입니다…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
        주문 정보를 불러올 수 없습니다.
        <button
          type="button"
          onClick={() => refetch()}
          className="ml-2 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 빈 장바구니는 결제할 게 없음 → CartPage 로.
  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange =
    (field: keyof ShippingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // 결제 성공 후 서버에 imp_uid 와 함께 주문 생성 요청 → 서버가 PortOne 검증 → 완료 페이지로.
  const finalizeOrder = async (paymentIds: {
    impUid: string;
    merchantUid: string;
  }) => {
    try {
      const order = await createOrder.mutateAsync({
        impUid: paymentIds.impUid,
        merchantUid: paymentIds.merchantUid,
        shippingAddress: {
          recipient: form.recipient,
          phone: form.phone,
          zipCode: form.zipCode,
          address1: form.address1,
          address2: form.address2,
          memo: form.memo,
        },
        payment: { method },
      });
      navigate(`/checkout/complete/${order._id}`, { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        const data = err.response?.data as
          | {
              message?: string;
              code?: string;
              items?: Array<{ name: string; stock: number }>;
              expected?: number;
              actual?: number;
            }
          | undefined;
        if (data?.code === 'OUT_OF_STOCK' && data.items?.length) {
          const detail = data.items
            .map((it) => `${it.name} (재고 ${it.stock}개)`)
            .join(', ');
          setErrorMsg(`재고 부족: ${detail}`);
        } else if (data?.code === 'AMOUNT_MISMATCH') {
          setErrorMsg(
            `결제 금액 불일치 (요청 ${data.expected?.toLocaleString()}원 / 실제 ${data.actual?.toLocaleString()}원). 결제가 자동 환불되었습니다.`
          );
        } else {
          setErrorMsg(data?.message ?? '주문 처리에 실패했습니다.');
        }
      } else {
        setErrorMsg('주문 처리에 실패했습니다.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreed) {
      setErrorMsg('주문 내용 확인 및 결제 동의가 필요합니다.');
      return;
    }
    for (const required of [
      'recipient',
      'phone',
      'zipCode',
      'address1',
    ] as const) {
      if (!form[required].trim()) {
        setErrorMsg('배송지 필수 항목을 모두 입력해주세요.');
        return;
      }
    }
    if (!window.IMP) {
      setErrorMsg(
        '결제 모듈이 로드되지 않았습니다. 페이지를 새로고침해주세요.'
      );
      return;
    }
    if (totalAmount <= 0) {
      setErrorMsg('결제 금액이 올바르지 않습니다.');
      return;
    }

    // 결제창에 표시할 상품명 — 첫 상품 + 외 N건.
    const itemName =
      items.length === 1
        ? items[0].product.name
        : `${items[0].product.name} 외 ${items.length - 1}건`;

    const buyerAddr = [form.address1, form.address2].filter(Boolean).join(' ');
    // merchant_uid 는 콜백에서 서버 검증에 동일하게 전달해야 하므로 변수에 저장.
    const merchantUid = generateMerchantUid();

    window.IMP.request_pay(
      {
        ...(IMP_PG ? { pg: IMP_PG } : {}),
        pay_method: IMP_PAY_METHOD[method],
        merchant_uid: merchantUid,
        name: itemName,
        amount: totalAmount,
        buyer_name: form.recipient,
        buyer_tel: form.phone,
        buyer_email: user?.email,
        buyer_addr: buyerAddr,
        buyer_postcode: form.zipCode,
      },
      (rsp: IamportResponse) => {
        if (!rsp.success) {
          setErrorMsg(`결제 실패: ${rsp.error_msg ?? '알 수 없는 오류'}`);
          return;
        }
        if (!rsp.imp_uid) {
          setErrorMsg('결제 응답에 imp_uid 가 없습니다.');
          return;
        }
        // 결제 성공 → 서버가 merchant_uid 로 PortOne V2 검증 후 주문 생성.
        void finalizeOrder({ impUid: rsp.imp_uid, merchantUid });
      }
    );
  };

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          주문/결제
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          배송 정보를 확인하고 결제 수단을 선택해주세요.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <ShippingSection form={form} onChange={handleChange} />
          <PaymentSection value={method} onChange={setMethod} />
          <ItemsSection items={items} />
        </div>

        <PaymentSummary
          itemCount={cart?.totalQuantity ?? 0}
          subtotal={subtotal}
          shippingFee={shippingFee}
          discount={discount}
          totalAmount={totalAmount}
          agreed={agreed}
          onAgreedChange={setAgreed}
          submitting={createOrder.isPending}
          errorMsg={errorMsg}
        />
      </form>
    </article>
  );
}

/* ───── Sections ───── */

function ShippingSection({
  form,
  onChange,
}: {
  form: ShippingForm;
  onChange: (
    field: keyof ShippingForm
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">배송지 정보</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="받는 사람" required>
          <input
            type="text"
            value={form.recipient}
            onChange={onChange('recipient')}
            className={inputClass}
            placeholder="홍길동"
          />
        </Field>
        <Field label="연락처" required>
          <input
            type="tel"
            value={form.phone}
            onChange={onChange('phone')}
            className={inputClass}
            placeholder="010-0000-0000"
          />
        </Field>
        <Field label="우편번호" required>
          <input
            type="text"
            value={form.zipCode}
            onChange={onChange('zipCode')}
            className={inputClass}
            placeholder="06236"
          />
        </Field>
        <div className="hidden sm:block" />
        <Field label="기본 주소" required className="sm:col-span-2">
          <input
            type="text"
            value={form.address1}
            onChange={onChange('address1')}
            className={inputClass}
            placeholder="서울특별시 강남구 …"
          />
        </Field>
        <Field label="상세 주소" className="sm:col-span-2">
          <input
            type="text"
            value={form.address2}
            onChange={onChange('address2')}
            className={inputClass}
            placeholder="동·호수, 건물명 등"
          />
        </Field>
        <Field label="배송 메모" className="sm:col-span-2">
          <textarea
            value={form.memo}
            onChange={onChange('memo')}
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="예) 부재 시 경비실에 맡겨주세요"
          />
        </Field>
      </div>
    </section>
  );
}

function PaymentSection({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">결제 수단</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {PAYMENT_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 text-left transition ${
                selected
                  ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                className={`text-sm font-semibold ${
                  selected ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {opt.label}
              </span>
              <span className="text-xs text-slate-500">{opt.hint}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function ItemsSection({ items }: { items: CartItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">
        주문 상품 <span className="text-slate-400">({items.length}종)</span>
      </h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {items.map((item) => {
          const { product, quantity } = item;
          const lineTotal = product.price * quantity;
          return (
            <li key={item._id} className="flex gap-3 py-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    no image
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="line-clamp-1 text-sm font-medium text-slate-900">
                    {product.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    수량 {quantity}개 · 개당 {product.price.toLocaleString()}원
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {lineTotal.toLocaleString()}원
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PaymentSummary({
  itemCount,
  subtotal,
  shippingFee,
  discount,
  totalAmount,
  agreed,
  onAgreedChange,
  submitting,
  errorMsg,
}: {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  agreed: boolean;
  onAgreedChange: (v: boolean) => void;
  submitting: boolean;
  errorMsg: string | null;
}) {
  return (
    <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-base font-bold text-slate-900">결제 금액</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>상품 금액 ({itemCount}개)</dt>
          <dd>{subtotal.toLocaleString()}원</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>배송비</dt>
          <dd className={shippingFee === 0 ? 'text-rose-500' : ''}>
            {shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-slate-600">
            <dt>할인</dt>
            <dd className="text-rose-500">-{discount.toLocaleString()}원</dd>
          </div>
        )}
      </dl>

      <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-700">
          총 결제 금액
        </span>
        <span className="text-xl font-extrabold text-rose-600">
          {totalAmount.toLocaleString()}원
        </span>
      </div>

      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
        />
        <span>
          주문 내용을 확인했으며, 결제에 동의합니다. <br />
          <span className="text-slate-400">
            (데모: 실제 결제는 발생하지 않습니다)
          </span>
        </span>
      </label>

      {errorMsg && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? '결제 처리 중…'
          : `${totalAmount.toLocaleString()}원 결제하기`}
      </button>
      <Link
        to="/cart"
        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        장바구니로 돌아가기
      </Link>
    </aside>
  );
}

/* ───── Form Field ───── */

function Field({
  label,
  required,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500';
