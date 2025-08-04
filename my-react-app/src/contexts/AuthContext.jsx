import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create authentication context for managing user state
const AuthContext = createContext(undefined);

/**
 * Custom hook to access authentication context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication provider component
 * Manages user authentication state, login, signup, and logout functionality
 * Implements secure session management with refresh tokens
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Check if user is authenticated on component mount
  // Restores user session from localStorage if tokens exist
  useEffect(() => {
    if (accessToken && refreshToken) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout(); // Clear invalid data
        }
      }
    }
  }, [accessToken, refreshToken]);

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      // Update tokens
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout(); // Clear all tokens on refresh failure
      throw error;
    }
  }, [refreshToken]);

  /**
   * Make authenticated API request with automatic token refresh
   */
  const apiRequest = useCallback(async (url, options = {}) => {
    const makeRequest = async (token) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          const newToken = await refreshAccessToken();
          // Retry request with new token
          return await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (refreshError) {
          logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    };

    return makeRequest(accessToken);
  }, [accessToken, refreshAccessToken]);

  /**
   * User login function
   * Authenticates user credentials and stores authentication data
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store authentication data
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * User registration function
   * Creates new user account and automatically logs in
   */
  const signup = useCallback(async (email, password, username) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store authentication data after successful signup
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * User logout function
   * Clears authentication data and invalidates server session
   */
  const logout = useCallback(async () => {
    try {
      // Invalidate session on server if we have a token
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
    }
  }, [accessToken]);

  /**
   * Logout from all devices
   */
  const logoutAllDevices = useCallback(async () => {
    try {
      if (accessToken) {
        await fetch('/api/auth/logout-all', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout all devices error:', error);
    } finally {
      logout();
    }
  }, [accessToken, logout]);

  // Provide authentication context to child components
  const value = {
    user,
    accessToken,
    login,
    signup,
    logout,
    logoutAllDevices,
    apiRequest,
    isLoading,
    isAuthenticated: !!accessToken && !!refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};