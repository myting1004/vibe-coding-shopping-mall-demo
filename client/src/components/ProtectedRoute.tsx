import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import type { UserType } from '@/types/user';

interface Props {
  children: ReactNode;
  allowedRoles?: UserType[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        로그인 상태 확인 중…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">접근 권한이 없습니다.</h2>
        <p className="mt-2 text-sm text-slate-500">
          이 페이지는 {allowedRoles.join(', ')} 권한이 필요합니다.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
