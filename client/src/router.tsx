import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderCompletePage from '@/pages/OrderCompletePage';
import SignupPage from '@/pages/SignupPage';
import LoginPage from '@/pages/LoginPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import PasswordResetRequestPage from '@/pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from '@/pages/PasswordResetConfirmPage';
import AdminPage from '@/pages/AdminPage';
import AdminProductsPage from '@/pages/AdminProductsPage';
import AdminProductRegisterPage from '@/pages/AdminProductRegisterPage';
import AdminOrdersPage from '@/pages/AdminOrdersPage';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'products', Component: ProductsPage },
      { path: 'products/:id', Component: ProductDetailPage },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout/complete/:orderId',
        element: (
          <ProtectedRoute>
            <OrderCompletePage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignupPage },
      { path: 'verify-email', Component: VerifyEmailPage },
      { path: 'password-reset', Component: PasswordResetRequestPage },
      { path: 'password-reset/confirm', Component: PasswordResetConfirmPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: AdminPage },
      { path: 'products', Component: AdminProductsPage },
      { path: 'products/new', Component: AdminProductRegisterPage },
      { path: 'orders', Component: AdminOrdersPage },
    ],
  },
]);
