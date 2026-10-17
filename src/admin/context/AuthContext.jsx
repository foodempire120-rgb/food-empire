import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const AuthContext = createContext({
  user: null,
  adminUser: null,
  isAdmin: false,
  loading: true,
  error: null,
  signInWithEmail: async () => {},
  requestPasswordReset: async () => {},
  updatePassword: async () => {},
  signOut: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authorization against admin_users table using user_id UUID and email
  const verifyAdminStatus = async (currentUser) => {
    if (!currentUser) {
      setAdminUser(null);
      setIsAdmin(false);
      return false;
    }

    const isDev = import.meta.env.DEV;

    try {
      const email = currentUser.email?.toLowerCase();
      const userId = currentUser.id;

      if (isDev) {
        console.group('[AdminAuth] verifyAdminStatus');
        console.log('User ID:', userId);
        console.log('Email:', email);
      }

      // Use select + limit instead of maybeSingle() to safely handle cases
      // where multiple admin_users rows share the same user_id or email
      // (maybeSingle throws PGRST116 if 2+ rows match, causing false "unauthorized")
      const { data: rows, error: queryError } = await supabase
        .from('admin_users')
        .select('id, user_id, email, active')
        .or(`user_id.eq.${userId},email.ilike.${email}`)
        .eq('active', true)
        .limit(1);

      if (isDev) {
        console.log('admin_users query result:', { rows, queryError });
        console.groupEnd();
      }

      if (queryError) {
        if (isDev) console.error('[AdminAuth] admin_users query failed:', queryError);
        setIsAdmin(false);
        setAdminUser(null);
        return false;
      }

      const data = rows && rows.length > 0 ? rows[0] : null;

      if (data && data.active) {
        // Link user_id if it was pre-seeded with email only
        if (!data.user_id) {
          await supabase
            .from('admin_users')
            .update({ user_id: userId })
            .eq('id', data.id);
        }

        setAdminUser(data);
        setIsAdmin(true);
        return true;
      } else {
        if (isDev) console.warn('[AdminAuth] No active admin record found for this user.');
        setAdminUser(null);
        setIsAdmin(false);
        return false;
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('[AdminAuth] Unexpected error in verifyAdminStatus:', err);
      setIsAdmin(false);
      setAdminUser(null);
      return false;
    }
  };


  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // 1. Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user && mounted) {
          setUser(session.user);
          const authorized = await verifyAdminStatus(session.user);
          if (!authorized) {
            // Immediately terminate unauthorized sessions
            await supabase.auth.signOut();
            setUser(null);
            setAdminUser(null);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('Initial session fetch error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for auth changes (sign in, sign out, token refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const authorized = await verifyAdminStatus(session.user);
          if (!authorized && event !== 'PASSWORD_RECOVERY') {
            await supabase.auth.signOut();
            setUser(null);
            setAdminUser(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setAdminUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Secure Email & Password Login
   */
  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('CONFIG_ERROR');
    }

    setError(null);

    // 1. Authenticate with Supabase Auth
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (signInError) {
      throw signInError;
    }

    if (!data?.user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 2. Strict authorization check against admin_users table
    const isAuthorized = await verifyAdminStatus(data.user);

    if (!isAuthorized) {
      // Immediately sign the unauthorized session out
      await supabase.auth.signOut();
      setUser(null);
      setAdminUser(null);
      setIsAdmin(false);
      const err = new Error('UNAUTHORIZED_ADMIN');
      err.code = 'UNAUTHORIZED_ADMIN';
      throw err;
    }

    setUser(data.user);
    return data.user;
  };

  /**
   * Request password reset instructions
   */
  const requestPasswordReset = async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('CONFIG_ERROR');
    }

    const redirectTo = `${window.location.origin}/admin/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    );

    if (resetError) {
      console.warn('Password reset request error:', resetError);
    }

    // Always resolve gracefully to maintain neutral message (security best practice)
    return true;
  };

  /**
   * Update password for recovery session
   */
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured()) {
      throw new Error('CONFIG_ERROR');
    }

    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw updateError;
    }

    return data;
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setAdminUser(null);
      setIsAdmin(false);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isAdmin,
        loading,
        error,
        signInWithEmail,
        requestPasswordReset,
        updatePassword,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
