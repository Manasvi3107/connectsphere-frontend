import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🟡 Prevents redirect flicker

  // ✅ Auto-login if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/me'); // Or adjust endpoint as needed
          setUser(res.data);
        } catch (err) {
          console.error('Auto-login failed:', err);
          localStorage.removeItem('token'); // Remove invalid token
          setUser(null);
        }
      }
      setLoading(false); // ✅ End loading after fetch
    };
    fetchUser();
  }, []);

  // ✅ Called on successful login
  const login = (token, user) => {
    localStorage.setItem('token', token);
    setUser(user);
  };

  // ✅ Update user profile locally
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData)); // Optional: persist
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser, // ✅ Provide updateUser in context
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
