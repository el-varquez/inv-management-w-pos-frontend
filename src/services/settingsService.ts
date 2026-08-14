import api from './api';
import type { StoreSettings } from '../types';

export const settingsService = {
  get: async (): Promise<StoreSettings> => {
    const { data } = await api.get<StoreSettings>('/settings');
    return data;
  },

  update: async (payload: StoreSettings): Promise<void> => {
    await api.put('/settings', payload);
  },
};
