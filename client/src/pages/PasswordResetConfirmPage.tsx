import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';

const inputClass =
  'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

export default function PasswordResetConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!token) return '토큰이 없습니다. 메일에 포함된 링크로 다시 접속해주세요.';
    if (newPassword.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!/[A-Za-z]/.test(newPassword)) {
      return '비밀번호에는 영문자가 1개 이상 포함되어야 합니다.';
    }
    if (!/\d/.test(newPassword)) {
      return '비밀번호에는 숫자가 1개 이상 포함되어야 합니다.';
    }
    if (newPassword !== confirmPassword) return '비밀번호가 일치하지 않습니다.';
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post<{ message: string }>(
        '/auth/password-reset/confirm',
        { token, newPassword }
      );
      setMessage(res.data.message);
      window.setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '재설정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto my-12 max-w-md rounded-xl border border-slate-200 bg-white px-7 py-8 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
        새 비밀번호 설정
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">새 비밀번호</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="영문+숫자 8자 이상"
            autoComplete="new-password"
            className={inputClass}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">비밀번호 확인</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
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
          {submitting ? '재설정 중…' : '비밀번호 변경'}
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
