import { useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';
import type { StoreSettings } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';

export const useSettings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await settingsService.get();
        if (!cancelled) setSettings(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load settings.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAcceptUtang = async (acceptUtang: boolean) => {
    if (!settings) return;

    setSaving(true);
    setSaveError(null);
    try {
      const next = { ...settings, acceptUtang };
      await settingsService.update(next);
      setSettings(next);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Failed to save settings.'));
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, error, saving, saveError, setAcceptUtang };
};
