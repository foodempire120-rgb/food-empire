import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import HomePage from './pages/HomePage';
import About from './pages/about';
import ProductsPage from './pages/ProductsPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import GlobalToVietnamMap from './components/GlobalToVietnamMap';
import ScrollToTop from './components/ScrollToTop';

// Admin CMS imports
import { AuthProvider } from './admin/context/AuthContext';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProductForm from './admin/pages/AdminProductForm';
import AdminResetPassword from './admin/pages/AdminResetPassword';

// Public layout preserving original website navbar, footer, background elements and behavior
function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navbar />
      <ScrollToTop />
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/map" element={<GlobalToVietnamMap />} />
        </Route>

        {/* Dedicated Admin CMS Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedAdminRoute>
              <AdminProductForm />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedAdminRoute>
              <AdminProductForm />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
