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

  createSuki: async (body: { name: string; phone?: string }): Promise<Suki> => {
    const { data } = await api.post<Suki>('/utang/sukis', body);
    return data;
  },

  updateSuki: async (
    id: string,
    body: { name: string; phone?: string },
  ): Promise<void> => {
    await api.put(`/utang/sukis/${id}`, body);
  },

  deleteSuki: async (id: string): Promise<void> => {
    await api.delete(`/utang/sukis/${id}`);
  },

  collect: async (body: {
    sukiId: string;
    amount: number;
    note?: string;
  }): Promise<void> => {
    await api.post('/utang/collect', body);
  },

  voidPayment: async (id: string): Promise<void> => {
    await api.post(`/utang/payments/${id}/void`);
  },

  editPayment: async (id: string, amount: number): Promise<void> => {
    await api.put(`/utang/payments/${id}`, { amount });
  },

  voidInvoice: async (id: string): Promise<void> => {
    await api.post(`/invoices/${id}/void`);
  },
};
