
import LoginPage from './pages/auth/LoginPage'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/home/HomePage';
import PublicRoute from './routes/PublicRoute';
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
import { useAuthStore } from './store/auth.store';

function App() {

  return (
    <BrowserRouter>

      <ToastProvider />

      <SocketManager />

      <Routes>
      <Route path="/" element={<RootRedirect />} />
      
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RoleGuard allowedRoles={['super_admin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
           <Route path="restaurants" element={<RestaurantsPage />} />
           <Route path="analytics" element={<>Analytics</>} />
           <Route path="settings" element={<>Seittings</>} />
        </Route>
      </Route>

        {/* PROTECTED ROUTES (Requires login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>

            {/* The index route (default for /dashboard) */}
            <Route index element={<HomePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/add" element={<AddUserPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/add" element={<AddProductPage />} /> {/* Add this line */}
            {/* Add other pages here later */}
            {/* <Route path="orders" element={<OrdersPage />} /> */}

          </Route>
        </Route>

        {/* CATCH ALL - Redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

// Create this small component inside App.tsx or separate file
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Redirect based on role if they hit "/"
  if (user?.role === 'super_admin') return <Navigate to="/admin/restaurants" replace />;
  return <Navigate to="/dashboard/orders" replace />;
};

