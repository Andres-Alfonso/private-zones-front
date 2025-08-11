// app/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { useAuth } from '~/context/AuthContext';
import apiClient from '~/api/client';
import { authDebug } from '~/utils/authDebug';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { state: authState } = useAuth();

  const makeRequest = useCallback(async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    options?: any
  ): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Debug authentication state before making request
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Making API request:', { method, url, hasAuth: authState.isAuthenticated });
        authDebug.checkAuthState();
      }

      let response;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get(url, options);
          break;
        case 'POST':
          response = await apiClient.post(url, data, options);
          break;
        case 'PUT':
          response = await apiClient.put(url, data, options);
          break;
        case 'DELETE':
          response = await apiClient.delete(url, options);
          break;
        case 'PATCH':
          response = await apiClient.patch(url, data, options);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setState({
        data: response.data,
        loading: false,
        error: null,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      // Debug authentication errors
      if (error.response?.status === 401 && process.env.NODE_ENV === 'development') {
        console.error('🔒 Authentication failed - debugging...');
        authDebug.checkAuthState();
      }

      throw error;
    }
  }, [authState.isAuthenticated]);

  // Convenience methods
  const get = useCallback((url: string, options?: any) => 
    makeRequest('GET', url, undefined, options), [makeRequest]);
  
  const post = useCallback((url: string, data?: any, options?: any) => 
    makeRequest('POST', url, data, options), [makeRequest]);
  
  const put = useCallback((url: string, data?: any, options?: any) => 
    makeRequest('PUT', url, data, options), [makeRequest]);
  
  const del = useCallback((url: string, options?: any) => 
    makeRequest('DELETE', url, undefined, options), [makeRequest]);
  
  const patch = useCallback((url: string, data?: any, options?: any) => 
    makeRequest('PATCH', url, data, options), [makeRequest]);

  return {
    ...state,
    makeRequest,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}

// Hook específico para usuarios
export function useUsersApi() {
  const api = useApi();

  return {
    ...api,
    // Métodos específicos para usuarios
    getAllUsers: (filters?: any) => api.get('/v1/users', { params: filters }),
    getUserById: (id: string) => api.get(`/v1/users/${id}`),
    createUser: (userData: any) => api.post('/v1/users', userData),
    updateUser: (id: string, userData: any) => api.put(`/v1/users/${id}`, userData),
    deleteUser: (id: string) => api.delete(`/v1/users/${id}`),
    toggleUserActive: (id: string) => api.patch(`/v1/users/${id}/toggle-active`),
    getUserStats: () => api.get('/v1/users/stats'),
    getUserRoles: () => api.get('/v1/users/roles'),
    getUserTenants: () => api.get('/v1/users/tenants'),
  };
}