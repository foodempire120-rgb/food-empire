import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Service Unavailable</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Unable to connect to the system. Please try again later.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Website
          </a>
        </div>
      </div>
    );
  }

  // 1. Loading State - do not briefly flash dashboard or redirect prematurely
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/20">
              FE
            </div>
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin absolute -top-2 -right-2" />
          </div>
          <p className="text-sm font-medium text-gray-500 mt-2">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated - Redirect to login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but Unauthorized (Not in admin_users)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            This account (<strong className="text-gray-900 font-semibold">{user.email}</strong>) is not authorized to access the Food Empire CMS.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 mb-6 text-left border border-gray-100">
            <p className="font-semibold text-gray-700 mb-1">To gain access:</p>
            <p>An administrator must authorize your account in the system.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out & Switch Account
            </button>
            <a
              href="/"
              className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Return to Public Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;
