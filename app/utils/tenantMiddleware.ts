// app/utils/tenantMiddleware.ts

import { TenantsAPI } from '~/api/endpoints/tenants';

// Interceptor para axios que valida el tenant en cada request
export function setupTenantInterceptor() {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') return;

  const apiClient = require('~/api/client').default;
  
  // Interceptor de request para agregar información del tenant
  apiClient.interceptors.request.use(
    async (config: any) => {
      // Obtener el dominio actual
      const currentDomain = window.location.hostname;
      
      // Agregar header con el dominio del tenant
      config.headers['X-Tenant-Domain'] = currentDomain;
      
      // Verificar si tenemos información del tenant en sessionStorage
      const tenantInfo = sessionStorage.getItem('tenant-info');
      if (tenantInfo) {
        const tenant = JSON.parse(tenantInfo);
        config.headers['X-Tenant-ID'] = tenant.id;
      }
      
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Interceptor de response para manejar errores de tenant
  apiClient.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Manejar errores específicos del tenant
        if (status === 403 && errorData?.error === 'TENANT_INACTIVE') {
          // Tenant inactivo - limpiar datos y recargar
          sessionStorage.removeItem('tenant-info');
          window.location.reload();
          return Promise.reject(error);
        }
        
        if (status === 404 && errorData?.error === 'TENANT_NOT_FOUND') {
          // Tenant no encontrado - limpiar datos y recargar
          sessionStorage.removeItem('tenant-info');
          window.location.reload();
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );
}

// Función para verificar periódicamente el estado del tenant
export function startTenantHealthCheck(intervalMs: number = 300000) { // 5 minutos por defecto
  if (typeof window === 'undefined') return;

  const checkTenantHealth = async () => {
    try {
      const currentDomain = window.location.hostname;
      const result = await TenantsAPI.checkTenantStatus(currentDomain);
      
      if (!result.isActive) {
        // Tenant inactivo - mostrar mensaje y recargar
        alert('La sesión ha expirado o la cuenta no está disponible. La página se recargará.');
        sessionStorage.clear();
        window.location.reload();
      }
    } catch (error) {
      console.warn('Health check failed:', error);
      // No hacer nada en caso de error de red para evitar interrupciones
    }
  };

  // Ejecutar cada intervalo especificado
  return setInterval(checkTenantHealth, intervalMs);
}

// Hook para usar en componentes React
export function useTenantHealthCheck(enabled: boolean = true, intervalMs: number = 300000) {
  const { useEffect } = require('react');
  
  useEffect(() => {
    if (!enabled) return;
    
    const intervalId = startTenantHealthCheck(intervalMs);
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enabled, intervalMs]);
}