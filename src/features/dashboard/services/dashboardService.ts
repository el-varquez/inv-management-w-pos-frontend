import api from '../../../services/api';
import type {
  BestSeller,
  DashboardSummary,
  ProfitReport,
  SalesTrend,
  TrendPeriod,
} from '../../../types';

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

  getBestSellers: async (range?: { from?: string; to?: string }): Promise<BestSeller[]> => {
    const { data } = await api.get<BestSeller[]>('/reports/best-sellers', {
      params: range,
    });
    return data;
  },

  getProfitReport: async (params?: { from?: string; to?: string }): Promise<ProfitReport> => {
    const { data } = await api.get<ProfitReport>('/reports/profit', { params });
    return data;
  },
};
