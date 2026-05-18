import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct } from '@/api/products';
import CloudinaryUploadBox from '@/components/CloudinaryUploadBox';
import { CATEGORIES } from '@/lib/categories';

const BADGES = ['NEW', '베스트', '인기', '정밀', '한정수량', '무료설치', '당일출고'];

interface SpecRow {
  id: number;
  key: string;
  value: string;
}

export default function ProductRegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [listPrice, setListPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');

  const [imageUrl, setImageUrl] = useState('');

  const [badges, setBadges] = useState<string[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([
    { id: 1, key: '', value: '' },
  ]);
  const [features, setFeatures] = useState<string[]>(['']);

  const [error, setError] = useState<string | null>(null);

  const discountPercent = useMemo(() => {
    if (
      typeof listPrice === 'number' &&
      typeof sellPrice === 'number' &&
      listPrice > 0 &&
      sellPrice <= listPrice
    ) {
      return Math.round(((listPrice - sellPrice) / listPrice) * 100);
    }
    return null;
  }, [listPrice, sellPrice]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin');
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function toggleBadge(badge: string) {
    setBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  }

  function addSpec() {
    setSpecs((prev) => [
      ...prev,
      { id: (prev.at(-1)?.id ?? 0) + 1, key: '', value: '' },
    ]);
  }
  function updateSpec(id: number, patch: Partial<SpecRow>) {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeSpec(id: number) {
    setSpecs((prev) => (prev.length === 1 ? prev : prev.filter((s) => s.id !== id)));
  }

  function addFeature() {
    setFeatures((prev) => [...prev, '']);
  }
  function updateFeature(idx: number, value: string) {
    setFeatures((prev) => prev.map((f, i) => (i === idx ? value : f)));
  }
  function removeFeature(idx: number) {
    setFeatures((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!sku.trim()) return setError('SKU 를 입력해주세요.');
    if (!name.trim()) return setError('상품명을 입력해주세요.');
    if (!category) return setError('카테고리를 선택해주세요.');
    if (typeof sellPrice !== 'number' || sellPrice <= 0) {
      return setError('판매가를 0 보다 큰 값으로 입력해주세요.');
    }

    createMutation.mutate({
      sku: sku.trim(),
      name: name.trim(),
      category,
      price: sellPrice,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-start gap-3">
        <Link
          to="/admin"
          className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="뒤로"
        >
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">상품 등록</h1>
          <p className="mt-1 text-sm text-slate-500">새로운 상품을 등록합니다</p>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Section title="기본 정보">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="상품명" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="상품명을 입력하세요"
              className={inputClass}
            />
          </Field>
          <Field label="SKU" required>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="예: TV-OLED-65-001"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="카테고리" required className="mt-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? 'border-rose-500 bg-rose-50 text-rose-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="상품 설명" className="mt-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="상품에 대한 자세한 설명을 입력하세요"
            className={`${inputClass} resize-y`}
          />
        </Field>
      </Section>

      <Section title="가격 정보">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="정가" required>
            <PriceInput value={listPrice} onChange={setListPrice} />
          </Field>
          <Field label="판매가" required>
            <PriceInput value={sellPrice} onChange={setSellPrice} />
          </Field>
          <Field label="할인율">
            <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              {discountPercent === null ? '-' : `${discountPercent}%`}
            </div>
          </Field>
        </div>
      </Section>

      <Section title="상품 이미지">
        <CloudinaryUploadBox
          value={imageUrl}
          onChange={setImageUrl}
          folder="products"
        />
      </Section>

      <Section title="상품 뱃지">
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => {
            const active = badges.includes(b);
            return (
              <button
                type="button"
                key={b}
                onClick={() => toggleBadge(b)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title="상세 스펙"
        action={
          <button
            type="button"
            onClick={addSpec}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            <PlusIcon />
            항목 추가
          </button>
        }
      >
        <div className="space-y-2">
          {specs.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                type="text"
                value={row.key}
                onChange={(e) => updateSpec(row.id, { key: e.target.value })}
                placeholder="항목명"
                className={inputClass}
              />
              <input
                type="text"
                value={row.value}
                onChange={(e) => updateSpec(row.id, { value: e.target.value })}
                placeholder="값"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeSpec(row.id)}
                disabled={specs.length === 1}
                className="rounded-lg border border-slate-200 px-2 text-sm text-slate-400 transition hover:bg-slate-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="행 삭제"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="주요 특징"
        action={
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            <PlusIcon />
            노출 추가
          </button>
        }
      >
        <div className="space-y-2">
          {features.map((f, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_auto] gap-2">
              <input
                type="text"
                value={f}
                onChange={(e) => updateFeature(idx, e.target.value)}
                placeholder="노출할 특징"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                disabled={features.length === 1}
                className="rounded-lg border border-slate-200 px-2 text-sm text-slate-400 transition hover:bg-slate-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="행 삭제"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <footer className="flex items-center justify-end gap-2">
        <Link
          to="/admin"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createMutation.isPending ? '등록 중…' : '상품 등록'}
        </button>
      </footer>
    </form>
  );
}

const inputClass =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100';

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function PriceInput({
  value,
  onChange,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? '' : Number(v));
        }}
        placeholder="0"
        className={`${inputClass} pr-8 text-right`}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
        원
      </span>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
