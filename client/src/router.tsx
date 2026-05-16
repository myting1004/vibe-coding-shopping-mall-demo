import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import SignupPage from '@/pages/SignupPage';
import LoginPage from '@/pages/LoginPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import PasswordResetRequestPage from '@/pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from '@/pages/PasswordResetConfirmPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'products', Component: ProductsPage },
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignupPage },
      { path: 'verify-email', Component: VerifyEmailPage },
      { path: 'password-reset', Component: PasswordResetRequestPage },
      { path: 'password-reset/confirm', Component: PasswordResetConfirmPage },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
