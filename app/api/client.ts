import axios, { AxiosInstance } from 'axios';
import { setupAuthInterceptors } from './interceptors/authInterceptor';

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Configura la URL base según el entorno
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.tudominio.com' 
  : 'http://localhost:3020';

// Factory function to create API client with optional tenant domain
export const createApiClient = (tenantDomain?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar automáticamente el header del tenant
  client.interceptors.request.use((config) => {
    let domain = tenantDomain;
    
    // Si no se proporciona el dominio y estamos en el navegador, obtenerlo
    if (!domain && isBrowser) {
      domain = window.location.hostname;
    }
    
    // Agregar header del tenant si tenemos el dominio
    if (domain) {
      config.headers['X-Tenant-Domain'] = domain;
    } else {
      console.warn('Tenant domain not available for this request');
    }
    
    return config;
  });

  // Configurar interceptores de autenticación
  setupAuthInterceptors(client);

  // Interceptor para manejar errores de respuesta
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Manejar errores de red
      if (!error.response) {
        console.error('Network error:', error);
      }
      
      // Manejar errores del servidor
      if (error.response?.status >= 500) {
        console.error('Server error:', error.response.data);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Default client for browser usage (backward compatibility)
const apiClient = createApiClient();

// Helper function to create client from Remix request
export const createApiClientFromRequest = (request: Request): AxiosInstance => {
  const url = new URL(request.url);
  return createApiClient(url.hostname);
};

export default apiClient;