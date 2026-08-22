import api from '../../../services/api';
import type { Paged, Suki, SukiLedger, UtangSummary } from '../../../types';

export const utangService = {
  getSukis: async (params: {
    term?: string;
    page: number;
    pageSize: number;
  }): Promise<Paged<Suki>> => {
    const { data } = await api.get<Paged<Suki>>('/utang/sukis', { params });
    return data;
  },

  getLedger: async (id: string): Promise<SukiLedger> => {
    const { data } = await api.get<SukiLedger>(`/utang/sukis/${id}/ledger`);
    return data;
  },

  getSummary: async (range?: {
    from?: string;
    to?: string;
  }): Promise<UtangSummary> => {
    const { data } = await api.get<UtangSummary>('/utang/summary', {
      params: range,
    });
    return data;
  },
};
