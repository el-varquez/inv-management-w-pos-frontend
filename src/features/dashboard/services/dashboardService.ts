import api from '../../../services/api';
import type { DashboardSummary, SalesTrend, TrendPeriod } from '../../../types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary');
    return data;
  },

  getSalesTrend: async (period: TrendPeriod): Promise<SalesTrend> => {
    const { data } = await api.get<SalesTrend>('/dashboard/sales-trend', {
      params: { period },
    });
    return data;
  },
};
