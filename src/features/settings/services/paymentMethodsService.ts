import api from '../../../services/api';
import type { PaymentMethod } from '../../../types';

export const CASH_METHOD_ID = '00000000-0000-0000-0000-000000000001';

export interface CreatePaymentMethodPayload {
  name: string;
  requiresReference: boolean;
}

export interface UpdatePaymentMethodPayload {
  name: string;
  requiresReference: boolean;
  isActive: boolean;
}

export const paymentMethodsService = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const { data } = await api.get<PaymentMethod[]>('/payment-methods');
    return data;
  },
  create: async (payload: CreatePaymentMethodPayload): Promise<PaymentMethod> => {
    const { data } = await api.post<PaymentMethod>('/payment-methods', payload);
    return data;
  },
  update: async (id: string, payload: UpdatePaymentMethodPayload): Promise<void> => {
    await api.put(`/payment-methods/${id}`, payload);
  },
};
