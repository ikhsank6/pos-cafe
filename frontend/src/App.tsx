import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import Dashboard from "@/pages/dashboard/Dashboard";
import UserList from "@/pages/master-data/users/UserList";
import RoleList from "@/pages/master-data/roles/RoleList";
import MenuList from "@/pages/master-data/menus/MenuList";
import Profile from "@/pages/profile/Profile";
import Forbidden from "@/pages/errors/Forbidden";
// POS Management Pages
import CategoryList from "@/pages/product-management/categories/CategoryList";
import ProductList from "@/pages/product-management/products/ProductList";
import TableList from "@/pages/table-management/tables/TableList";
import CustomerList from "@/pages/customer-management/customers/CustomerList";
import DiscountList from "@/pages/discount-management/discounts/DiscountList";
import OrderList from "@/pages/order-management/orders/OrderList";
import CreateOrder from "@/pages/order-management/orders/create/CreateOrder";
import TransactionList from "@/pages/transaction-management/transactions/TransactionList";
import { useAuthStore } from "@/stores/auth.store";
import { ThemeProvider } from "@/components/theme-provider";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}

// Route that checks menu access
function MenuProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hasMenuAccess = useAuthStore((state) => state.hasMenuAccess);

  // Check if user has access to current path
  if (!hasMenuAccess(location.pathname)) {
    return <Forbidden />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}

// Helper component to redirect while preserving query parameters
function RedirectWithQuery({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton theme="system" />
        <Routes>
          {/* =================== */}
          {/* AUTH ROUTES (Login) */}
          {/* =================== */}
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <AuthLayout />
              </AuthRoute>
            }
          >
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Legacy routes - redirect to new auth routes (preserving query params) */}
          <Route
            path="/login"
            element={<RedirectWithQuery to="/auth/login" />}
          />
          <Route
            path="/register"
            element={<RedirectWithQuery to="/auth/register" />}
          />
          <Route
            path="/forgot-password"
            element={<RedirectWithQuery to="/auth/forgot-password" />}
          />
          <Route
            path="/reset-password"
            element={<RedirectWithQuery to="/auth/reset-password" />}
          />

          {/* Verify email - standalone route (no redirect if authenticated) */}
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* 403 Forbidden */}
          <Route path="/forbidden" element={<Forbidden />} />

          {/* ======================== */}
          {/* PROTECTED ADMIN ROUTES */}
          {/* ======================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Master Data Routes */}
            <Route
              path="master-data/users"
              element={
                <MenuProtectedRoute>
                  <UserList />
                </MenuProtectedRoute>
              }
            />
            <Route
              path="master-data/roles"
              element={
                <MenuProtectedRoute>
                  <RoleList />
                </MenuProtectedRoute>
              }
            />
            <Route
              path="master-data/menus"
              element={
                <MenuProtectedRoute>
                  <MenuList />
                </MenuProtectedRoute>
              }
            />

            {/* Product Management Routes */}
            <Route
              path="product-management/categories"
              element={
                <MenuProtectedRoute>
                  <CategoryList />
                </MenuProtectedRoute>
              }
            />
            <Route
              path="product-management/products"
              element={
                <MenuProtectedRoute>
                  <ProductList />
                </MenuProtectedRoute>
              }
            />

            {/* Table Management Routes */}
            <Route
              path="table-management/tables"
              element={
                <MenuProtectedRoute>
                  <TableList />
                </MenuProtectedRoute>
              }
            />

            {/* Customer Management Routes */}
            <Route
              path="customer-management/customers"
              element={
                <MenuProtectedRoute>
                  <CustomerList />
                </MenuProtectedRoute>
              }
            />

            {/* Discount Management Routes */}
            <Route
              path="discount-management/discounts"
              element={
                <MenuProtectedRoute>
                  <DiscountList />
                </MenuProtectedRoute>
              }
            />

            {/* Order Management Routes */}
            <Route
              path="order-management/orders"
              element={
                <MenuProtectedRoute>
                  <OrderList />
                </MenuProtectedRoute>
              }
            />
            <Route
              path="order-management/orders/create"
              element={
                <MenuProtectedRoute>
                  <CreateOrder />
                </MenuProtectedRoute>
              }
            />

            {/* Transaction Management Routes */}
            <Route
              path="transaction-management/transactions"
              element={
                <MenuProtectedRoute>
                  <TransactionList />
                </MenuProtectedRoute>
              }
            />

            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Legacy dashboard routes - redirect to admin */}
          <Route
            path="/dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/master-data/*"
            element={<Navigate to="/admin/master-data/users" replace />}
          />

          {/* Root redirects to admin dashboard */}
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
