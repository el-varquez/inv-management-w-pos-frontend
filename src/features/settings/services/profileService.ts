import api from '../../../services/api';

export const profileService = {
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await api.post('/profile/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
