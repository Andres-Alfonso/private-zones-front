// app/api/hooks/useStripeProducts.ts

import { useState, useEffect } from 'react';
import { PaymentsAPI } from '../endpoints/payments/payments';
import { StripeProduct } from '../types/stripe.types';

export function useStripeProducts() {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      try {
        const response = await PaymentsAPI.getStripeProducts();
        setProducts(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los productos');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
  };
}