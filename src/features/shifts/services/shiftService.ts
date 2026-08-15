import api from '../../../services/api';
import type { Paged, Shift, ShiftRead } from '../../../types';

export const shiftService = {
  getPaged: async (params: {
    page: number;
    pageSize: number;
  }): Promise<Paged<Shift>> => {
    const { data } = await api.get<Paged<Shift>>('/shifts', { params });
    return data;
  },

  getRead: async (id: string): Promise<ShiftRead> => {
    const { data } = await api.get<ShiftRead>(`/shifts/${id}`);
    return data;
  },

  correctCount: async (
    id: string,
    payload: { countedCash: number; reason: string }
  ): Promise<void> => {
    await api.post(`/shifts/${id}/correct-count`, payload);
  },
};
