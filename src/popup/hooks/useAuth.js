// ============================================================
// useAuth.js — Hook quản lý trạng thái xác thực
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { MSG } from '../../shared/messageTypes.js';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra trạng thái auth khi mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({ type: MSG.AUTH_STATUS });
      setIsLoggedIn(response.loggedIn);
      setEmail(response.email || '');
      setError(null);
    } catch (err) {
      setIsLoggedIn(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await chrome.runtime.sendMessage({ type: MSG.AUTH_LOGIN });
      if (response.success) {
        setIsLoggedIn(true);
        setEmail(response.email);
        return response;
      } else {
        setError(response.error || 'Đăng nhập thất bại');
        return response;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await chrome.runtime.sendMessage({ type: MSG.AUTH_LOGOUT });
      setIsLoggedIn(false);
      setEmail('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isLoggedIn,
    email,
    loading,
    error,
    login,
    logout,
    checkAuthStatus,
  };
}
