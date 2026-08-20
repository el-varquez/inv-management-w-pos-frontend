import api from './api';
import type { DaySummary, Paged } from '../types';

export const daysService = {
  getLatest: async (): Promise<DaySummary | null> => {
    const { data } = await api.get<Paged<DaySummary>>('/days', {
      params: { page: 1, pageSize: 1 },
    });
    return data.items[0] ?? null;
  },

  reopen: async (
    dayId: string,
    username: string,
    password: string,
    reason: string
  ): Promise<void> => {
    await api.post(`/days/${dayId}/reopen`, { username, password, reason });
  },
};
