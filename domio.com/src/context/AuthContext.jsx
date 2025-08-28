import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('domio_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('domio_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userWithUsername = {
      ...userData,
      username: userData.firstName?.toLowerCase() + userData.lastName?.toLowerCase() || 'user'
    };
    setUser(userWithUsername);
    localStorage.setItem('domio_user', JSON.stringify(userWithUsername));
  };

  const signup = (userData) => {
    const userWithUsername = {
      ...userData,
      username: userData.firstName?.toLowerCase() + userData.lastName?.toLowerCase() || 'user'
    };
    setUser(userWithUsername);
    localStorage.setItem('domio_user', JSON.stringify(userWithUsername));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('domio_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
