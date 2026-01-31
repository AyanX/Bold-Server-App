/**
 * useAuth Hook
 *
 * Custom hook for authentication state and operations.
 * Provides login, logout, and authentication status checking.
 *
 * @module hooks/useAuth
 */

import { useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import { API_CONFIG } from '../constants/config';

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
 * Authentication state
 */
interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user data */
  user: User | null;
  /** Whether auth is being checked */
  isLoading: boolean;
}

/**
 * Auth hook return type
 */
interface UseAuthReturn extends AuthState {
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
 * Custom hook for authentication management
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```tsx
 * // Check auth status
 * const { isAuthenticated, user } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <Navigate to="/login" />;
 * }
 *
 * // Login
 * const { login } = useAuth();
 * const handleSubmit = async () => {
 *   const success = await login(email, password);
 *   if (success) navigate('/dashboard');
 * };
 *
 * // Role-based access
 * const { hasRole } = useAuth();
 * if (hasRole(['Admin', 'Editor'])) {
 *   showEditButton();
 * }
 * ```
 */
function useAuth(): UseAuthReturn {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [user, setUser] = useLocalStorage<User | null>('user', null);

  /**
   * Authenticate user with credentials
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await fetch("http://localhost:8000/api/login", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Important for session cookies
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok && result.data) {
          const userData: User = {
            id: result.data.id.toString(),
            name: result.data.name,
            email: result.data.email,
            role: result.data.role,
          };
          setUser(userData);
          setIsLoggedIn(true);
          return true;
        }

        console.error('Login failed:', result.message);
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    [setUser, setIsLoggedIn]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:8000/api/logout", {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('token');
    }
  }, [setUser, setIsLoggedIn]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user]
  );

  /**
   * Update current user data
   */
  const updateUser = useCallback(
    (data: Partial<User>) => {
      if (user) {
        setUser({ ...user, ...data });
      }
    },
    [user, setUser]
  );

  /**
   * Memoized auth state
   */
  const authState = useMemo(
    (): AuthState => ({
      isAuthenticated: isLoggedIn,
      user,
      isLoading: false,
    }),
    [isLoggedIn, user]
  );

  return {
    ...authState,
    login,
    logout,
    hasRole,
    updateUser,
  };
}

export default useAuth;
