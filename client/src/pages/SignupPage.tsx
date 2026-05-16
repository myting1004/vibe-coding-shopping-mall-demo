import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

interface FormState {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  address: string;
}

const initialForm: FormState = {
  email: '',
  name: '',
  password: '',
  passwordConfirm: '',
  address: '',
};

const inputClass =
  'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>(initialForm);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.email.trim()) return '이메일을 입력해주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return '이메일 형식이 올바르지 않습니다.';
    }
    if (!form.name.trim()) return '이름을 입력해주세요.';
    if (form.password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!/[A-Za-z]/.test(form.password)) {
      return '비밀번호에는 영문자가 1개 이상 포함되어야 합니다.';
    }
    if (!/\d/.test(form.password)) {
      return '비밀번호에는 숫자가 1개 이상 포함되어야 합니다.';
    }
    if (form.password !== form.passwordConfirm) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    setServerError(null);

    const message = validate();
    if (message) {
      setValidationError(message);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password,
        address: form.address.trim() || undefined,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto my-12 max-w-md rounded-xl border border-slate-200 bg-white px-7 py-8 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
        회원가입
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">이메일</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">이름</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="홍길동"
            autoComplete="name"
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">비밀번호</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="영문+숫자 8자 이상"
            autoComplete="new-password"
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">
            비밀번호 확인
          </span>
          <input
            type="password"
            value={form.passwordConfirm}
            onChange={(e) => updateField('passwordConfirm', e.target.value)}
            autoComplete="new-password"
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">
            주소 (선택)
          </span>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="서울시 ..."
            autoComplete="street-address"
            className={inputClass}
          />
        </label>

        {validationError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {validationError}
          </p>
        )}
        {serverError && !validationError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? '가입 처리 중…' : '가입하기'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
          로그인
        </Link>
      </p>
    </section>
  );
}
