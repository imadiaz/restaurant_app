
import LoginPage from './pages/auth/LoginPage'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import DashboardLayout from './components/layout/DashboardLayout';
import OrdersPage from './pages/orders/OrdersPage';
import UsersPage from './pages/users/UsersPage';
import ProductsPage from './pages/products/ProductsPage';
import AddProductPage from './pages/products/AddProductPage';
import { ToastProvider } from './components/common/ToastProvider';
import AddUserPage from './pages/users/AddUsersPage';
import SocketManager from './components/managers/SocketManager';
import RestaurantsPage from './pages/restaurants/RestaurantPage';
import RoleGuard from './routes/RoleGuard';
import RootRedirect from './routes/RootRedirect';
import { ROLES } from './config/roles';
import GuestGuard from './routes/GuestGuard';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import AddRestaurantPage from './pages/restaurants/AddRestaurantPage';
import SchedulePage from './pages/schedule/SchedulePage';
import ThemeManager from './components/managers/ThemeManager';

function App() {

  return (
    <BrowserRouter>

      <ToastProvider />
      <ThemeManager />
      <SocketManager />

      <Routes>
      <Route path="/" element={<RootRedirect />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<GuestGuard />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]} />}>
        <Route path="/admin" element={<DashboardLayout />}>
           <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="restaurants/add" element={<AddRestaurantPage />} />
           <Route path="analytics" element={<>Analytics</>} />
           <Route path="settings" element={<>Seittings</>} />
        </Route>
      </Route>

        {/* PROTECTED ROUTES (Requires login) */}
        <Route element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>

            <Route index element={<HomePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/add" element={<AddUserPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/add" element={<AddProductPage />} />
              <Route path="schedule" element={<SchedulePage />} />

          </Route>
        </Route>

        {/* CATCH ALL - Redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

