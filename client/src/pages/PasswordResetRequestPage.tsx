import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';

const inputClass =
  'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post<{ message: string }>(
        '/auth/password-reset/request',
        { email: email.trim() }
      );
      setMessage(res.data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto my-12 max-w-md rounded-xl border border-slate-200 bg-white px-7 py-8 shadow-sm">
      <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
        비밀번호 재설정
      </h1>
      <p className="mb-6 text-center text-sm text-slate-500">
        가입하신 이메일을 입력하시면 재설정 링크를 보내드립니다.
      </p>

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

        {message && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
            {message}
          </p>
        )}
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
          {submitting ? '메일 발송 중…' : '재설정 메일 보내기'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </section>
  );
}
