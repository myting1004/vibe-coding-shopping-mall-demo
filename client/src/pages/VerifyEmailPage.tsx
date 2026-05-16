import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/providers/AuthProvider';

type Status = 'idle' | 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('토큰이 없습니다. 메일에 포함된 링크로 다시 접속해주세요.');
      return;
    }

    (async () => {
      setStatus('verifying');
      try {
        await apiClient.post('/auth/email/verify', { token });
        await refreshUser();
        setStatus('success');
        setMessage('이메일 인증이 완료되었습니다.');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : '인증에 실패했습니다.');
      }
    })();
  }, [token, refreshUser]);

  return (
    <section className="mx-auto my-12 max-w-md rounded-xl border border-slate-200 bg-white px-7 py-8 text-center shadow-sm">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">이메일 인증</h1>

      {status === 'verifying' && (
        <p className="text-sm text-slate-500">인증 처리 중…</p>
      )}
      {status === 'success' && (
        <>
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
            {message}
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            홈으로
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {message}
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            홈으로
          </Link>
        </>
      )}
    </section>
  );
}
