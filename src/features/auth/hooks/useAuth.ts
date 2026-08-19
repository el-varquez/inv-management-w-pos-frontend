import { useState } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../store/authStore';
import { getApiErrorMessage } from '../../../services/apiError';
import type { LoginResult } from '../../../types';

export const useAuth = () => {
  const { setAuth, logout, user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSetupUsername, setPendingSetupUsername] = useState<
    string | null
  >(null);
  const [setupUsername, setSetupUsername] = useState<string | null>(null);

  const completeLogin = (result: LoginResult) => {
    if (result.role === 'Cashier') {
      setError('Cashiers sign in on the register.');
      return;
    }
    if (result.token && result.name && result.username && result.role) {
      setPendingSetupUsername(null);
      setSetupUsername(null);
      setAuth(result.token, {
        name: result.name,
        username: result.username,
        role: result.role,
      });
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(username, password);
      if (result.passwordSetupRequired) {
        if (result.role !== 'Admin') {
          setError('Cashiers sign in on the register.');
          return;
        }
        setPendingSetupUsername(result.username);
        return;
      }
      completeLogin(result);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = () => {
    setSetupUsername(pendingSetupUsername);
    setPendingSetupUsername(null);
  };

  const setupPassword = async (newPassword: string) => {
    if (!setupUsername) return;
    setLoading(true);
    setError(null);
    try {
      const result = await authService.setupPassword(setupUsername, newPassword);
      completeLogin(result);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not set the password.'));
    } finally {
      setLoading(false);
    }
  };

  const cancelSetup = () => {
    setPendingSetupUsername(null);
    setSetupUsername(null);
    setError(null);
  };

  return {
    login,
    logout,
    user,
    token,
    loading,
    error,
    pendingSetupUsername,
    confirmSetup,
    setupUsername,
    setupPassword,
    cancelSetup,
  };
};
