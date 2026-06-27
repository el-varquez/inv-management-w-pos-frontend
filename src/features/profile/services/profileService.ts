import api from '../../../services/api';
import type { Profile } from '../../../types';

export const profileService = {
  get: async (): Promise<Profile> => {
    const { data } = await api.get<Profile>('/profile');
    return data;
  },

  updateName: async (name: string): Promise<void> => {
    await api.put('/profile', { name });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await api.post('/profile/change-password', { currentPassword, newPassword });
  },
};
