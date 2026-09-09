import api from './api';
import type { UtangOutstanding } from '../types';

export const utangOutstandingService = {
  get: async (): Promise<UtangOutstanding> => {
    const { data } = await api.get<UtangOutstanding>('/utang/outstanding');
    return data;
  },
};
