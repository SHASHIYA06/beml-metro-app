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

    if (storedUser) {
      // If loginTime is missing or invalid, assume valid for now to prevent flash logout
      // unless we want strict timeout. Let's make it lenient for user complaints.
      const now = Date.now();
      const sessionStart = parseInt(loginTime) || now;
      const elapsed = now - sessionStart;

      // Use config timeout or default to 24 hours (86400000ms) to prevent annoyance
      const timeout = config.sessionTimeout || 86400000;

      if (elapsed < timeout) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user data', e);
          logout(); // Corrupt data, logout is safe
        }
      } else {
        console.warn('Session expired, logging out');
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
