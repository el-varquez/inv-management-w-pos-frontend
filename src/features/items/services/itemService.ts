import api from '../../../services/api';
import type { Item, ItemComponents, Paged, SearchItem } from '../../../types';

export type CreateItemPayload = Omit<
  Item,
  | 'id'
  | 'stock'
  | 'isLowStock'
  | 'isActive'
  | 'isComposite'
  | 'categoryName'
  | 'createdAt'
>;

export type UpdateItemPayload = CreateItemPayload & { isActive: boolean };

export const itemService = {
  getPaged: async (params: {
    page: number;
    pageSize: number;
    isComposite?: boolean;
  }): Promise<Paged<Item>> => {
    const { data } = await api.get<Paged<Item>>('/items', { params });
    return data;
  },

  getSellable: async (): Promise<Item[]> => {
    const { data } = await api.get<Item[]>('/items/sellable');
    return data;
  },

  search: async (term: string, limit = 10): Promise<SearchItem[]> => {
    const { data } = await api.get<SearchItem[]>('/items/search', {
      params: { term, limit },
    });
    return data;
  },

  create: async (payload: CreateItemPayload): Promise<{ id: string }> => {
    const { data } = await api.post<{ id: string }>('/items', payload);
    return data;
  },

  update: async (id: string, payload: UpdateItemPayload): Promise<void> => {
    await api.put(`/items/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
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
};