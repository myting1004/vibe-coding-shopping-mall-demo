import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignup } from '@/hooks/useSignup';

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
  const signupMutation = useSignup();

  const [form, setForm] = useState<FormState>(initialForm);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.email.trim()) return '이메일을 입력해주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return '이메일 형식이 올바르지 않습니다.';
    }
    if (!form.name.trim()) return '이름을 입력해주세요.';
    if (form.password.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.';
    }
    if (form.password !== form.passwordConfirm) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    const message = validate();
    if (message) {
      setValidationError(message);
      return;
    }

    signupMutation.mutate(
      {
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password,
        address: form.address.trim() || undefined,
      },
      {
        onSuccess: (user) => {
          setSuccessMessage(`${user.name} 님, 가입이 완료되었습니다.`);
          setForm(initialForm);
          window.setTimeout(() => navigate('/'), 1500);
        },
      }
    );
  }

  const serverErrorMessage =
    signupMutation.isError && signupMutation.error
      ? signupMutation.error.message
      : null;

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
            placeholder="6자 이상"
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
        {serverErrorMessage && !validationError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {serverErrorMessage}
          </p>
        )}
        {successMessage && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="h-11 rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signupMutation.isPending ? '가입 처리 중…' : '가입하기'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/" className="font-semibold text-indigo-600 hover:underline">
          홈으로
        </Link>
      </p>
    </section>
  );
}
