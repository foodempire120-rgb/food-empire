import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, ExternalLink, User, PlusCircle } from 'lucide-react';

const AdminLayout = ({ children, title = 'Products', actionButton = null }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Branding & Nav */}
            <div className="flex items-center gap-6">
              <Link to="/admin" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                  FE
                </div>
                <div>
                  <span className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    Food Empire
                  </span>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                    Product CMS
                  </span>
                </div>
              </Link>

              <nav className="hidden sm:flex items-center space-x-1 pl-4 border-l border-gray-200">
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </Link>
                <Link
                  to="/admin/products/new"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === '/admin/products/new'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Product</span>
                </Link>
              </nav>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-3">
              <a
                href="/products"
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200 transition-colors"
                title="View live website products"
              >
                <span>Live Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {user && (
                <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Admin avatar"
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                  )}

                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[150px]">
                      {user.user_metadata?.full_name || 'Admin'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate max-w-[150px]">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your food catalog items, descriptions, origins, images, and public availability.
            </p>
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>

        {/* Content Body */}
        {children}
      </main>

      {/* Subtle CMS Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Food Empire Product Management System &bull; Secure Client Portal
      </footer>
    </div>
  );
};

export default AdminLayout;
