import api from '../../../services/api';
import type { TenantSummary, TenantDetail } from '../../../types';

export const platformService = {
  getAll: async (): Promise<TenantSummary[]> => {
    const { data } = await api.get<TenantSummary[]>('/platform/tenants');
    return data;
  },

  getOne: async (id: string): Promise<TenantDetail> => {
    const { data } = await api.get<TenantDetail>(`/platform/tenants/${id}`);
    return data;
  },

  create: async (payload: {
    businessName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    cashierCap?: number;
  }): Promise<{ id: string }> => {
    const { data } = await api.post<{ id: string }>('/platform/tenants', payload);
    return data;
  },

  suspend: async (id: string): Promise<void> => {
    await api.post(`/platform/tenants/${id}/suspend`);
  },

  reactivate: async (id: string): Promise<void> => {
    await api.post(`/platform/tenants/${id}/reactivate`);
  },

  setCashierCap: async (id: string, cashierCap: number): Promise<void> => {
    await api.patch(`/platform/tenants/${id}/cashier-cap`, { cashierCap });
  },
};
