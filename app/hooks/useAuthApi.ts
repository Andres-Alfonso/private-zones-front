// app/hooks/useAuthApi.ts
// Hook personalizado para hacer llamadas autenticadas a la API

import { useCallback } from 'react';
import { useAuth } from '~/context/AuthContext';
import apiClient from '~/api/client';

export function useAuthApi() {
  const { state, logout } = useAuth();

  const authenticatedRequest = useCallback(async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any
  ) => {
    if (!state.isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await apiClient.request({
        method,
        url,
        data,
      });
      
      return response.data;
    } catch (error: any) {
      // Si es un error 401, el interceptor ya manejará el refresh automático
      // Si el refresh falla, el interceptor hará logout automáticamente
      throw error;
    }
  }, [state.isAuthenticated]);

  const get = useCallback((url: string) => 
    authenticatedRequest('GET', url), [authenticatedRequest]);
  
  const post = useCallback((url: string, data?: any) => 
    authenticatedRequest('POST', url, data), [authenticatedRequest]);
  
  const put = useCallback((url: string, data?: any) => 
    authenticatedRequest('PUT', url, data), [authenticatedRequest]);
  
  const del = useCallback((url: string) => 
    authenticatedRequest('DELETE', url), [authenticatedRequest]);

  return {
    get,
    post,
    put,
    delete: del,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  };
}