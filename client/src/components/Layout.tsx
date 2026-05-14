import { NavLink, Outlet } from 'react-router-dom';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'text-indigo-600'
      : 'text-slate-600 hover:text-slate-900'
  }`;

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="text-lg font-bold tracking-tight">
            Shopping Mall Demo
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navClass}>
              Products
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} Shopping Mall Demo
        </div>
      </footer>
    </div>
  );
}
