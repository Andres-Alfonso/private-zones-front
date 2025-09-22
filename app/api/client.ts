import axios, { AxiosInstance } from 'axios';
import { setupAuthInterceptors } from './interceptors/authInterceptor';
import { cookieHelpers } from '~/utils/cookieHelpers';

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Helper function to parse cookies from cookie string (for server-side)
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      const value = rest.join('=');
      try {
        cookies[name] = decodeURIComponent(value);
      } catch {
        cookies[name] = value;
      }
    }
  });
  
  return cookies;
}

// Helper function to get auth tokens from cookies (server-side compatible)
function getAuthTokensFromCookies(cookieString?: string): { accessToken?: string; refreshToken?: string } | null {
  if (isBrowser) {
    // En el browser, usar cookieHelpers
    return cookieHelpers.getJSON('auth_tokens');
  } else if (cookieString) {
    // En el servidor, parsear desde el cookie string
    const cookies = parseCookies(cookieString);
    const authTokensString = cookies['auth_tokens'];
    
    if (authTokensString) {
      try {
        return JSON.parse(authTokensString);
      } catch {
        return null;
      }
    }
  }
  
  return null;
}

// Configura la URL base según el entorno
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.klmsystem.online' 
  : 'https://api.klmsystem.online';

function getCurrentDomain(): string {
  if (typeof window === 'undefined') {
      return 'localhost'; // Para SSR
  }

  const hostname = window.location.hostname;

  // En desarrollo, manejar casos como cardio.klmsystem.test
  if (hostname.includes('.test') || hostname.includes('.local')) {
      return hostname;
  }

  // En producción, usar el hostname completo
  return hostname;
}

// Factory function to create API client with optional tenant domain and cookies
export const createApiClient = (tenantDomain?: string, cookieString?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar automáticamente el header del tenant y token
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

    // Agregar el header Authorization con el token
    const authTokens = getAuthTokensFromCookies(cookieString);
    const token = authTokens?.accessToken;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
const apiClient = createApiClient(getCurrentDomain());

// Helper function to create client from Remix request
export const createApiClientFromRequest = (request: Request): AxiosInstance => {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get('Cookie') || '';
  return createApiClient(url.hostname, cookieHeader);
};

export default apiClient;