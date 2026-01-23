
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

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC ROUTES (Restricted for logged-in users) */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        {/* PROTECTED ROUTES (Requires login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
      
            {/* The index route (default for /dashboard) */}
            <Route index element={<HomePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
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