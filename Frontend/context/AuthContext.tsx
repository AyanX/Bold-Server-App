/**
 * AuthContext
 *
 * React Context for authentication state management.
 * Provides auth state and methods to all child components.
 *
 * @module context/AuthContext
 */

import React, { createContext, useContext, useMemo } from 'react';
import useAuth from '../hooks/useAuth';

/**
 * User data structure
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Auth context value type
 */
interface AuthContextValue {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user data */
  user: User | null;
  /** Whether auth is being checked */
  isLoading: boolean;
  /** Log in user */
  login: (email: string, password: string) => Promise<boolean>;
  /** Log out user */
  logout: () => Promise<void>;
  /** Check if user has specific role */
  hasRole: (role: string | string[]) => boolean;
  /** Update user data */
  updateUser: (data: Partial<User>) => void;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider Component
 *
 * Wraps the application to provide authentication state.
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <AuthProvider>
 *   <Router>
 *     <App />
 *   </Router>
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  const value = useMemo(() => auth, [auth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context
 *
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, login, logout } = useAuthContext();
 *
 * if (!isAuthenticated) {
 *   return <LoginPage />;
 * }
 * ```
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
