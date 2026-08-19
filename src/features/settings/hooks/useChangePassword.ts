import { useState } from 'react';
import { profileService } from '../services/profileService';
import { getApiErrorMessage } from '../../../services/apiError';

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await profileService.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change password.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
};
