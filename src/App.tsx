import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from '@/contexts/cart-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Layout';
import { Footer } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { ProductsPage } from '@/pages/Products';
import { ProductDetail } from '@/pages/ProductDetail';
import { CartPage } from '@/pages/Cart';
import { CheckoutPage } from '@/pages/Checkout';
import { LoginPage } from '@/pages/Login';
import { SignupPage } from '@/pages/Signup';
import { AdminLoginPage } from '@/pages/AdminLogin';
import { TrackPage } from '@/pages/Track';
import { AdminPage } from '@/pages/Admin';
import { AccountPage } from '@/pages/Account';
import { PharmacistLoginPage } from '@/pages/PharmacistLogin';
import { PharmacistDashboard } from '@/pages/pharmacist/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<><Navbar /><main className="page"><Home /></main><Footer /></>} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/pharmacist-login" element={<PharmacistLoginPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pharmacist" element={<PharmacistDashboard />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
