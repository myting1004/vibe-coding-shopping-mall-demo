import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/hooks/useCart';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-rose-600' : 'text-slate-600 hover:text-slate-900'
  }`;

export default function Layout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const isAdmin = isAuthenticated && user?.user_type === 'admin';
  const { data: cart } = useCart();
  const cartCount = cart?.totalQuantity ?? 0;

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 상단 프로모션 바 */}
      <div className="bg-rose-600 text-white">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-4 text-xs">
          <span className="font-medium tracking-wide">
            전 상품 무료 배송 · 신규 가입 시 10% 할인
          </span>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="opacity-80">고객센터 1588-0000</span>
            <span className="opacity-60">|</span>
            <span className="opacity-80">매장 안내</span>
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-600 text-xs font-black text-white">
              E
            </span>
            <span className="text-lg font-black tracking-tight text-slate-900">
              ELEC<span className="text-rose-600">.</span>COM
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              홈
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              상품
            </NavLink>
            <NavLink to="/promotions" className={navLinkClass}>
              기획전
            </NavLink>
            <NavLink to="/brands" className={navLinkClass}>
              브랜드
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/cart"
              aria-label={`장바구니${cartCount > 0 ? ` (${cartCount}개)` : ''}`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {isInitializing ? (
              <span className="text-slate-400">…</span>
            ) : isAuthenticated && user ? (
              <>
                <span className="hidden text-slate-600 sm:inline">
                  <strong className="font-semibold text-slate-900">
                    {user.name}
                  </strong>
                  님 환영합니다
                </span>
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition ${
                      isActive
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  주문 내역
                </NavLink>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-700"
                  >
                    어드민
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-slate-800 bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-600 text-sm font-black text-white">
                E
              </span>
              <div>
                <div className="text-base font-black text-white">
                  ELEC<span className="text-rose-500">.</span>COM
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  당신의 라이프스타일을 책임지는 가전 전문 쇼핑몰
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-xs">
              <div>
                <div className="mb-2 font-semibold text-white">쇼핑</div>
                <ul className="space-y-1 text-slate-400">
                  <li>인기 제품</li>
                  <li>신상품</li>
                  <li>기획전</li>
                </ul>
              </div>
              <div>
                <div className="mb-2 font-semibold text-white">고객센터</div>
                <ul className="space-y-1 text-slate-400">
                  <li>FAQ</li>
                  <li>1:1 문의</li>
                  <li>배송 조회</li>
                </ul>
              </div>
              <div>
                <div className="mb-2 font-semibold text-white">회사</div>
                <ul className="space-y-1 text-slate-400">
                  <li>회사 소개</li>
                  <li>채용</li>
                  <li>제휴 문의</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} ELEC.COM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function CartIcon() {
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
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
