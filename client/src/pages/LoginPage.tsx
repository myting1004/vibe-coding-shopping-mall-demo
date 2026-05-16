import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

const inputClass =
  'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

interface RedirectState {
  from?: Location;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      const redirectTo =
        (location.state as RedirectState | null)?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto my-12 max-w-md rounded-xl border border-slate-200 bg-white px-7 py-8 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">로그인</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
            required
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <Link
          to="/password-reset"
          className="font-medium text-slate-600 hover:text-indigo-600 hover:underline"
        >
          비밀번호 찾기
        </Link>
        <span>
          아직 회원이 아니신가요?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:underline">
            회원가입
          </Link>
        </span>
      </div>
    </section>
  );
}
