import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/common/ToastProvider";
import SocketManager from "./components/managers/SocketManager";
import RoleGuard from "./routes/RoleGuard";
import RootRedirect from "./routes/RootRedirect";
import { ROLES } from "./config/roles";
import GuestGuard from "./routes/GuestGuard";
import ThemeManager from "./components/managers/ThemeManager";
import { ConfirmProvider } from "./components/common/ConfirmProdiver";

const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const UnauthorizedPage = lazy(() => import("./pages/error/UnauthorizedPage"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const UsersPage = lazy(() => import("./pages/users/UsersPage"));
const UserFormPage = lazy(() => import("./pages/users/UserFormPage"));
const ProductsPage = lazy(() => import("./pages/products/ProductsPage"));
const ProductFormPage = lazy(() => import("./pages/products/ProductFormPage"));
const RestaurantsPage = lazy(() => import("./pages/restaurants/RestaurantPage"));
const RestaurantFormPage = lazy(() => import("./pages/restaurants/RestaurantFormPage"));
const SchedulePage = lazy(() => import("./pages/schedule/SchedulesPage"));
const ScheduleFormPage = lazy(() => import("./pages/schedule/ScheduleFormPage"));
const MenuSectionsPage = lazy(() => import("./pages/menuSections/MenuSectionPage"));
const MenuSectionFormPage = lazy(() => import("./pages/menuSections/MenuSectionFormPage"));
const DriversPage = lazy(() => import("./pages/drivers/DriversPage"));
const DriverFormPage = lazy(() => import("./pages/drivers/DriverFormPage"));
const ModifiersPage = lazy(() => import("./pages/modifiers/ModifiersPage"));
const ModifierFormPage = lazy(() => import("./pages/modifiers/ModifierFormPage"));
const CategoriesPage = lazy(() => import("./pages/categories/CategoryPage"));
const CategoryFormPage = lazy(() => import("./pages/categories/CategoryFormPage"));
const PromotionsPage = lazy(() => import("./pages/promotions/PromotionPage"));
const PromotionsFormPage = lazy(() => import("./pages/promotions/PromotionFormPage"));
const CouponsPage = lazy(() => import("./pages/coupons/CouponsPage"));
const CouponFormPage = lazy(() => import("./pages/coupons/CouponFormPage"));
const StatisticsPage = lazy(() => import("./pages/statistics/StatisticsPage"));
const PaymentPlatformPage = lazy(() => import("./pages/payments/PaymentPlatformPage"));
const PaymentSuccessPage = lazy(() => import("./pages/payments/PaymentSuccessPage"));
const PaymentRefreshPage = lazy(() =>
  import("./pages/payments/PaymentRefreshPage").then((module) => ({ default: module.PaymentRefreshPage })),
);

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <ConfirmProvider />
      <ThemeManager />
      <SocketManager />

      <Suspense fallback={<div className="min-h-dvh grid place-items-center text-text-muted">Loading…</div>}>
      <Routes>
        <Route
          path="/payments/onboarding/success/:id"
          element={<PaymentSuccessPage />}
        />
        <Route
          path="/payments/onboarding/refresh/:id"
          element={<PaymentRefreshPage />}
        />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<GuestGuard />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path={`restaurants`} element={<RestaurantsPage />} />
            <Route path="restaurants/add" element={<RestaurantFormPage />} />
            <Route
              path="restaurants/edit/:id"
              element={<RestaurantFormPage />}
            />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/add" element={<UserFormPage />} />
            <Route path="users/edit/:id" element={<UserFormPage />} />

            <Route path="categories" element={<CategoriesPage />} />

            <Route path="categories/add" element={<CategoryFormPage />} />
            <Route path="categories/edit/:id" element={<CategoryFormPage />} />
          </Route>
        </Route>

        <Route
          element={
            <RoleGuard
              allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}
            />
          }
        >
          <Route
            path="/payments/restaurant/finance"
            element={<PaymentPlatformPage />}
          />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="home"  element={<StatisticsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/add" element={<UserFormPage />} />
            <Route path="users/edit/:id" element={<UserFormPage />} />
            <Route path="menu-sections" element={<MenuSectionsPage />} />
            <Route path="menu-sections/add" element={<MenuSectionFormPage />} />
            <Route
              path="menu-sections/edit/:id"
              element={<MenuSectionFormPage />}
            />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/add" element={<ProductFormPage />} />
            <Route path="products/edit/:id" element={<ProductFormPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="schedule/add" element={<ScheduleFormPage />} />

            <Route path="drivers" element={<DriversPage />} />
            <Route path="drivers/add" element={<DriverFormPage />} />
            <Route path="drivers/edit/:id" element={<DriverFormPage />} />

            <Route path="modifiers" element={<ModifiersPage />} />
            <Route path="modifiers/add" element={<ModifierFormPage />} />
            <Route path="modifiers/edit/:id" element={<ModifierFormPage />} />

            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="promotions/add" element={<PromotionsFormPage />} />
            <Route path="promotions/edit/:id" element={<PromotionsFormPage />} />

            <Route path="coupons" element={<CouponsPage />} />
            <Route path="coupons/add" element={<CouponFormPage />} />
            <Route path="coupons/edit/:id" element={<CouponFormPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
