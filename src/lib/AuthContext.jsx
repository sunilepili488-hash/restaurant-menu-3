/**
 * AuthContext.jsx — Supabase version
 * 
 * Base44 auth completely removed.
 * This context now just checks if Supabase is configured in localStorage.
 * Admin authentication happens via username/password stored in the restaurants table.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { isSupabaseConfigured, getSupabaseConfig } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [isLoadingAuth] = useState(false); // No async auth check needed
  const [supbaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured on mount
    setSupabaseReady(isSupabaseConfigured());
    setIsLoadingPublicSettings(false);
  }, []);

  // Called by SupabaseSection after connecting
  const refreshSupabaseState = () => {
    setSupabaseReady(isSupabaseConfigured());
  };

  return (
    <AuthContext.Provider value={{
      isLoadingAuth,
      isLoadingPublicSettings,
      supbaseReady,
      refreshSupabaseState,
      // Legacy compat — always null, admin auth is session-based
      user: null,
      isAuthenticated: false,
      authError: null,
      appPublicSettings: null,
      authChecked: true,
      logout: () => {},
      navigateToLogin: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
