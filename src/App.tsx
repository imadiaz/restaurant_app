import LoginPage from "./pages/auth/LoginPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import OrdersPage from "./pages/orders/OrdersPage";
import UsersPage from "./pages/users/UsersPage";
import ProductsPage from "./pages/products/ProductsPage";
import { ToastProvider } from "./components/common/ToastProvider";
import SocketManager from "./components/managers/SocketManager";
import RestaurantsPage from "./pages/restaurants/RestaurantPage";
import RoleGuard from "./routes/RoleGuard";
import RootRedirect from "./routes/RootRedirect";
import { ROLES } from "./config/roles";
import GuestGuard from "./routes/GuestGuard";
import UnauthorizedPage from "./pages/error/UnauthorizedPage";
import SchedulePage from "./pages/schedule/SchedulesPage";
import ThemeManager from "./components/managers/ThemeManager";
import UserFormPage from "./pages/users/UserFormPage";
import RestaurantFormPage from "./pages/restaurants/RestaurantFormPage";
import MenuSectionsPage from "./pages/menuSections/MenuSectionPage";
import MenuSectionFormPage from "./pages/menuSections/MenuSectionFormPage";
import ProductFormPage from "./pages/products/ProductFormPage";
import ScheduleFormPage from "./pages/schedule/ScheduleFormPage";
import DriversPage from "./pages/drivers/DriversPage";
import DriverFormPage from "./pages/drivers/DriverFormPage";
import ModifiersPage from "./pages/modifiers/ModifiersPage";
import ModifierFormPage from "./pages/modifiers/ModifierFormPage";
import { ConfirmProvider } from "./components/common/ConfirmProdiver";
import { PaymentRefreshPage } from "./pages/payments/PaymentRefreshPage";
import PaymentSuccessPage from "./pages/payments/PaymentSuccessPage";
import CategoriesPage from "./pages/categories/CategoryPage";
import CategoryFormPage from "./pages/categories/CategoryFormPage";
import PromotionsPage from "./pages/promotions/PromotionPage";
import PromotionsFormPage from "./pages/promotions/PromotionFormPage";
import CouponsPage from "./pages/coupons/CouponsPage";
import CouponFormPage from "./pages/coupons/CouponFormPage";
import StatisticsPage from "./pages/statistics/StatisticsPage";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <ConfirmProvider />
      <ThemeManager />
      <SocketManager />

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
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<StatisticsPage />} />
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
    </BrowserRouter>
  );
}

export default App;
