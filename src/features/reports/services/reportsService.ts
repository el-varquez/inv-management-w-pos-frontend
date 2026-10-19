import api from '../../../services/api';
import type {
  SalesReport,
  ExpenseReport,
  ProfitReport,
  BestSeller,
  Paged,
} from '../../../types';

export interface DateRange {
  from?: string;
  to?: string;
}

type PageParams = { page: number; pageSize: number };

export const reportsService = {
  getSalesReport: async (params: DateRange & PageParams): Promise<SalesReport> => {
    const { data } = await api.get<SalesReport>('/reports/sales', { params });
    return data;
  },

  getExpenseReport: async (params: DateRange & PageParams): Promise<ExpenseReport> => {
    const { data } = await api.get<ExpenseReport>('/reports/expenses', { params });
    return data;
  },

  getProfitReport: async (
    params: DateRange & PageParams & { categoryId?: string; itemId?: string }
  ): Promise<ProfitReport> => {
    const { data } = await api.get<ProfitReport>('/reports/profit', { params });
    return data;
  },

  getBestSellers: async (params: DateRange & PageParams): Promise<Paged<BestSeller>> => {
    const { data } = await api.get<Paged<BestSeller>>('/reports/best-sellers', { params });
    return data;
  },
};
