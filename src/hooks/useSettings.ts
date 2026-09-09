import { useEffect, useState } from 'react';
import {
  settingsService,
  type AcceptUtangCredentials,
} from '../services/settingsService';
import type { StoreSettings } from '../types';
import { getApiErrorMessage } from '../services/apiError';

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

  const persist = async (next: StoreSettings): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await settingsService.update({
        storeName: next.storeName,
        address: next.address,
        receiptFooter: next.receiptFooter,
        defaultUtangMarkup: next.defaultUtangMarkup,
        utangReminderDays: next.utangReminderDays,
      });
      setSettings(next);
      return true;
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Failed to save settings.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setDefaultUtangMarkup = async (
    defaultUtangMarkup: number
  ): Promise<boolean> => {
    if (!settings) return false;
    return persist({ ...settings, defaultUtangMarkup });
  };

  const setUtangReminderDays = async (
    utangReminderDays: number
  ): Promise<boolean> => {
    if (!settings) return false;
    return persist({ ...settings, utangReminderDays });
  };

  const setAcceptUtang = async (
    accept: boolean,
    credentials?: AcceptUtangCredentials
  ): Promise<boolean> => {
    if (!settings) return false;

    setSaving(true);
    setSaveError(null);
    try {
      await settingsService.setAcceptUtang(accept, credentials);
      setSettings({ ...settings, acceptUtang: accept });
      return true;
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Failed to change the utang setting.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    acceptUtang: settings?.acceptUtang ?? false,
    loading,
    error,
    saving,
    saveError,
    clearSaveError: () => setSaveError(null),
    setDefaultUtangMarkup,
    setUtangReminderDays,
    setAcceptUtang,
  };
};
