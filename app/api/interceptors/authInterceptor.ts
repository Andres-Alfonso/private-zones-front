// app/api/interceptors/authInterceptor.ts

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config';
import { cookieHelpers } from '~/utils/cookieHelpers';

// Referencia al contexto de auth (se asignará desde el AuthProvider)
let authContextRef: any = null;

// Función para establecer la referencia del contexto
export const setAuthContext = (authContext: any) => {
  authContextRef = authContext;
};

// Utilidades para el manejo de tokens
const getStoredTokens = () => {
  if (typeof document === 'undefined') return null;
  try {
    return cookieHelpers.getJSON('auth_tokens');
  } catch {
    return null;
  }
};

const clearStoredAuth = () => {
  if (typeof document === 'undefined') return;
  try {
    cookieHelpers.clearAuth();
  } catch (error) {
    console.error('Error clearing auth cookies:', error);
  }
};

// Flag para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Función para agregar requests a la cola durante el refresh
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Función para notificar a todos los requests en cola
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Configurar interceptores de axios
export const setupAuthInterceptors = (axiosInstance: typeof axios) => {
  // Interceptor de Request - Agregar token de autorización
  axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const tokens = getStoredTokens();
      
      if (tokens?.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de Response - Manejar errores 401 y refresh automático
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      // Si es un error 401 y no es el endpoint de login/register/refresh
      if (
        error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/register') &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        
        // Si ya estamos refresheando, agregar request a la cola
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const tokens = getStoredTokens();
          
          if (!tokens?.refreshToken) {
            throw new Error('No refresh token available');
          }

          // Llamar al endpoint de refresh
          const refreshResponse = await axiosInstance.post(
            API_CONFIG.ENDPOINTS.AUTH.REFRESH,
            { refreshToken: tokens.refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken, user } = refreshResponse.data;

          // Actualizar tokens en cookies
          cookieHelpers.setJSON('auth_tokens', {
            accessToken,
            refreshToken: newRefreshToken,
            timestamp: Date.now(),
          }, {
            maxAge: 30 * 24 * 60 * 60, // 30 días
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          
          cookieHelpers.setJSON('auth_user', user, {
            maxAge: 30 * 24 * 60 * 60, // 30 días
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          // Actualizar el contexto de auth si está disponible
          if (authContextRef?.refreshTokens) {
            authContextRef.refreshTokens();
          }

          // Notificar a todos los requests en cola
          onTokenRefreshed(accessToken);

          // Reintentar el request original con el nuevo token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return axiosInstance(originalRequest);

        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          
          // Si falla el refresh, limpiar todo y redirigir a login
          clearStoredAuth();
          
          // Notificar al contexto de auth para hacer logout
          if (authContextRef?.logout) {
            authContextRef.logout();
          }
          
          // Redirigir a login si estamos en el cliente
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Si es un error 403 (Forbidden), podría ser un problema de permisos
      if (error.response?.status === 403) {
        console.error('Access forbidden:', error.response.data);
        // Aquí podrías manejar errores específicos de permisos
      }

      return Promise.reject(error);
    }
  );
};

// Función para verificar si un token está próximo a expirar
export const isTokenExpiringSoon = (token: string, bufferMinutes: number = 5): boolean => {
  if (!token) return true;
  
  try {
    // Decodificar el JWT (sin verificar la firma, solo para obtener el payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convertir a milliseconds
    const currentTime = Date.now();
    const bufferTime = bufferMinutes * 60 * 1000; // Buffer en milliseconds
    
    return (expirationTime - currentTime) < bufferTime;
  } catch {
    return true; // Si hay error decodificando, asumir que está expirado
  }
};

// Función para configurar refresh automático por tiempo
export const setupAutoRefresh = () => {
  if (typeof window === 'undefined') return;

  // Verificar cada 5 minutos si el token necesita refresh
  const interval = setInterval(async () => {
    const tokens = getStoredTokens();
    
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      return;
    }

    // Si el token expira en los próximos 10 minutos, refrescarlo
    if (isTokenExpiringSoon(tokens.accessToken, 10)) {
      if (authContextRef?.refreshTokens) {
        try {
          await authContextRef.refreshTokens();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }
    }
  }, 5 * 60 * 1000); // Cada 5 minutos

  return () => clearInterval(interval);
};