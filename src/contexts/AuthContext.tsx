import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSession } from '../types';
import { authService, storageService } from '../services';

interface AuthContextType {
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      setCurrentUser(session);
      storageService.setUserId(session.userId);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const result = await authService.login(username, password);

      if (result.success && result.session) {
        setCurrentUser(result.session);
        storageService.setUserId(result.session.userId);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const result = await authService.register(username, password);

      if (result.success && result.user) {
        // Auto-login after registration
        const loginResult = await authService.login(username, password);
        if (loginResult.success && loginResult.session) {
          setCurrentUser(loginResult.session);
          storageService.setUserId(loginResult.session.userId);
          return { success: true };
        }
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    storageService.setUserId(null);
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: currentUser !== null,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
