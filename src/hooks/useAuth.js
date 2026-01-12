import { useState, useEffect } from 'react';
import { config } from '../config';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const storedUser = sessionStorage.getItem('user');
    const loginTime = sessionStorage.getItem('loginTime');

    if (storedUser && loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      
      if (elapsed < config.sessionTimeout) {
        setUser(JSON.parse(storedUser));
      } else {
        logout();
      }
    }
    
    setLoading(false);
  };

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('loginTime', Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('loginTime');
  };

  return { user, loading, login, logout, checkAuth };
}
