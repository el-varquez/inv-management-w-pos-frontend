import api from '../../../services/api';
import type { LoginResult } from '../../../types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResult> => {
    const { data } = await api.post<LoginResult>('/auth/login', { username, password });
    return data;
  },
  setupPassword: async (
    username: string,
    newPassword: string
  ): Promise<LoginResult> => {
    const { data } = await api.post<LoginResult>('/auth/setup-password', {
      username,
      newPassword,
    });
    return data;
  },
};
