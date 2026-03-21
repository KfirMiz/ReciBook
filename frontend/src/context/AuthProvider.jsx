import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUserLocal = (newUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

