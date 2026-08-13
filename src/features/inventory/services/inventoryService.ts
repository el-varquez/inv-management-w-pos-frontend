import api from '../../../services/api';
import type {
  StockLevel,
  InventoryHistoryItem,
  InventoryValuation,
  ItemComponents,
  LowStockItem,
  Paged,
  InventoryCount,
  InventoryCountSummary,
} from '../../../types';

export const inventoryService = {
  getStockLevels: async (params: {
    page: number;
    pageSize: number;
  }): Promise<Paged<StockLevel>> => {
    const { data } = await api.get<Paged<StockLevel>>(
      '/inventory/stock-levels',
      { params }
    );
    return data;
  },

  getLowStock: async (): Promise<LowStockItem[]> => {
    const { data } = await api.get<LowStockItem[]>('/inventory/low-stock');
    return data;
  },

  receiveStock: async (payload: {
    supplierName?: string;
    notes?: string;
    lines: {
      itemId: string;
      quantity: number;
      costPerUnit: number;
      sellingPrice: number;
    }[];
  }): Promise<{ count: number }> => {
    const { data } = await api.post<{ count: number }>(
      '/inventory/receive-stock',
      payload
    );
    return data;
  },

  adjustStock: async (payload: {
    itemId: string;
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<{ id: string }> => {
    const { data } = await api.post<{ id: string }>(
      '/inventory/adjust-stock',
      payload
    );
    return data;
  },

  createCount: async (notes?: string): Promise<{ id: string }> => {
    const { data } = await api.post<{ id: string }>('/inventory/count', {
      notes,
    });
    return data;
  },

  completeCount: async (
    countId: string,
    lines: { itemId: string; actualQty: number | null }[]
  ): Promise<void> => {
    await api.post(`/inventory/count/${countId}/complete`, lines);
  },

  saveProgress: async (
    countId: string,
    lines: { itemId: string; actualQty: number | null }[]
  ): Promise<void> => {
    await api.post(`/inventory/count/${countId}/progress`, lines);
  },

  getCount: async (id: string): Promise<InventoryCount> => {
    const { data } = await api.get<InventoryCount>(`/inventory/count/${id}`);
    return data;
  },

  getCounts: async (params: {
    status?: 'Draft' | 'Completed';
    page: number;
    pageSize: number;
  }): Promise<Paged<InventoryCountSummary>> => {
    const { data } = await api.get<Paged<InventoryCountSummary>>('/inventory/count', {
      params,
    });
    return data;
  },

  getComponents: async (itemId: string): Promise<ItemComponents> => {
    const { data } = await api.get<ItemComponents>(
      `/inventory/items/${itemId}/components`
    );
    return data;
  },

  setComponents: async (
    itemId: string,
    components: { componentItemId: string; quantity: number }[]
  ): Promise<void> => {
    await api.post(`/inventory/items/${itemId}/components`, components);
  },

  getHistory: async (params: {
    from?: string;
    to?: string;
    type?: string;
    page: number;
    pageSize: number;
  }): Promise<Paged<InventoryHistoryItem>> => {
    const { data } = await api.get<Paged<InventoryHistoryItem>>(
      '/inventory/history',
      { params }
    );
    return data;
  },

  getValuation: async (): Promise<InventoryValuation> => {
    const { data } = await api.get<InventoryValuation>('/inventory/valuation');
    return data;
  },
};
