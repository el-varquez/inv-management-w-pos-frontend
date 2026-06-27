import { useState } from 'react';
import { profileService } from '../services/profileService';
import { getApiErrorMessage } from '../../../services/apiError';

export const useProfileMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateName = (name: string) =>
    run(() => profileService.updateName(name));

  const changePassword = (currentPassword: string, newPassword: string) =>
    run(() => profileService.changePassword(currentPassword, newPassword));

  return { updateName, changePassword, loading, error };
};
