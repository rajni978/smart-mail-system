import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        // Validate the stored token against the backend
        const validatedUser = await api('/api/auth/me');
        const userData = {
          _id: validatedUser._id,
          name: validatedUser.name,
          email: validatedUser.email,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        // Token invalid, expired, or user deleted — clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData, token) => {
    const authToken = token || userData?.token;
    const normalizedUser = {
      _id: userData?._id ?? userData?.id,
      name: userData?.name,
      email: userData?.email,
    };
    if (authToken) {
      localStorage.setItem('token', authToken);
    }
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};