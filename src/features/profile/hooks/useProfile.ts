import { useEffect, useState } from 'react';
import { profileService } from '../services/profileService';
import type { Profile } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await profileService.get());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProfile(); }, []);

  return { profile, loading, error, refetch: fetchProfile };
};
