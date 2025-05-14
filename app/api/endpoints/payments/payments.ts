// app/api/endpoints/payments.ts

import apiClient from '../../client';
import { API_CONFIG } from '../../config';
import { StripeProductListResponse } from '../../types/stripe.types';

export const PaymentsAPI = {
  // Obtener todos los productos de Stripe
  getStripeProducts: async (): Promise<StripeProductListResponse> => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PAYMENTS.STRIPE.FIND_ALL
    );
    return response.data;
  },
  
  // Crear una sesión de checkout en Stripe
  createCheckoutSession: async (productId: string): Promise<{ url: string }> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.PAYMENTS.STRIPE.CREATE_CHECKOUT_SESSION,
      { productId }
    );
    return response.data;
  }
};