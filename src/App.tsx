
import LoginPage from './pages/auth/LoginPage'
import { BrowserRouter, Navigate,Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import DashboardLayout from './components/layout/DashboardLayout';
import OrdersPage from './pages/orders/OrdersPage';
import UsersPage from './pages/users/UsersPage';
import ProductsPage from './pages/products/ProductsPage';
import { ToastProvider } from './components/common/ToastProvider';
import SocketManager from './components/managers/SocketManager';
import RestaurantsPage from './pages/restaurants/RestaurantPage';
import RoleGuard from './routes/RoleGuard';
import RootRedirect from './routes/RootRedirect';
import { ROLES } from './config/roles';
import GuestGuard from './routes/GuestGuard';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import SchedulePage from './pages/schedule/SchedulePage';
import ThemeManager from './components/managers/ThemeManager';
import UserFormPage from './pages/users/UserFormPage';
import RestaurantFormPage from './pages/restaurants/RestaurantFormPage';
import MenuSectionsPage from './pages/menuSections/MenuSectionPage';
import MenuSectionFormPage from './pages/menuSections/MenuSectionFormPage';
import ProductFormPage from './pages/products/ProductFormPage';

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
           <Route path={`restaurants`} element={<RestaurantsPage />} />
            <Route path="restaurants/add" element={<RestaurantFormPage />} />
            <Route path="restaurants/edit/:id" element={<RestaurantFormPage/>} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/add" element={<UserFormPage />} />
            <Route path="users/edit/:id" element={<UserFormPage/>} />
            <Route path="analytics" element={<>Analytics</>} />
            <Route path="settings" element={<>Seittings</>} />
        </Route>
      </Route>

        {/* PROTECTED ROUTES (Requires login) */}
        <Route element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN,ROLES.ADMIN, ROLES.MANAGER]} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>

            <Route index element={<HomePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/add" element={<UserFormPage />} />
            <Route path="users/edit/:id" element={<UserFormPage/>} />
            <Route path="menu-sections" element={<MenuSectionsPage />} />
            <Route path="menu-sections/add" element={<MenuSectionFormPage />} />
            <Route path="menu-sections/edit/:id" element={<MenuSectionFormPage/>} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/add" element={<ProductFormPage />} />
            <Route path="products/edit/:id" element={<ProductFormPage />} />
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

