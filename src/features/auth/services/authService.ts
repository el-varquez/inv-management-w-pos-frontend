import api from '../../../services/api';
import type { LoginResult } from '../../../types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResult> => {
    const { data } = await api.post<LoginResult>('/auth/login', { username, password });
    return data;
  },
};
