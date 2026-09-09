import api from './api';
import type { StoreSettings } from '../types';

export interface UpdateStoreSettingsPayload {
  storeName: string;
  address: string;
  receiptFooter: string;
  defaultUtangMarkup: number;
  utangReminderDays: number;
}

export interface AcceptUtangCredentials {
  username: string;
  password: string;
}

export const settingsService = {
  get: async (): Promise<StoreSettings> => {
    const { data } = await api.get<StoreSettings>('/settings');
    return data;
  },

  update: async (payload: UpdateStoreSettingsPayload): Promise<void> => {
    await api.put('/settings', payload);
  },

  setAcceptUtang: async (
    accept: boolean,
    credentials?: AcceptUtangCredentials,
  ): Promise<void> => {
    await api.post('/settings/accept-utang', { accept, ...credentials });
  },
};
