// app/api/endpoints/tenants.ts

// import {apiClient, createApiClient} from "../client";
import { createApiClient } from "../client";
import apiClient from "../client";
import { API_CONFIG } from "../config";

// Primero necesitamos actualizar la configuración con los endpoints de tenant
import { TenantValidationResponse, Tenant, TenantFilters, TenantListResponse, CreateTenantRequest, TenantError, TenantErrorResponse } from "../types/tenant.types";


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

export const TenantsAPI = {

  getById: async (tenantId: string): Promise<Tenant | TenantErrorResponse> => {
    try {
      const apiClient = createApiClient(getCurrentDomain());
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.TENANTS.BASE}/${tenantId}`
      );

      console.log("Tenant fetched successfully:", response.data);

      return response.data;
    } catch (error: any) {
      // Manejo de errores más específico
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        console.error("API Error Details:", {
          status,
          data: errorData,
          headers: error.response.headers
        });
        switch (status) {
          case 404:
            return {
              error: TenantError.TENANT_NOT_FOUND,
              message: "Tenant no encontrado",
            };
          case 403:
            return {
              error: TenantError.FORBIDDEN,
              message: "Acceso denegado al tenant",
            };
          case 500:
            return {
              error: TenantError.NETWORK_ERROR,
              message: "Error interno del servidor",
            };
          default:
            return {
              error: TenantError.NETWORK_ERROR,
              message: errorData?.message || "Error del servidor",
            };
        }
      }
      // Error de red o conexión
      console.error("Network Error:", error.message);
      return {
        error: TenantError.NETWORK_ERROR,
        message: "Error de conexión al obtener el tenant",
      };
    }
  },

  // Crear nuevo tenant
  create: async (tenantData: CreateTenantRequest): Promise<Tenant | TenantErrorResponse> => {
    try {
      const apiClient = createApiClient(getCurrentDomain());

      console.log("Creating tenant with data:", tenantData);
      const response = await apiClient.post(
        `${API_CONFIG.ENDPOINTS.TENANTS.CREATE_TENANT}`,
        tenantData
      );
      console.log("Tenant created successfully:", response.data);
      return response.data;
    } catch (error: any) {
      // Manejo más específico de errores
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Log del error completo para debug
        console.error("API Error Details:", {
          status,
          data: errorData,
          headers: error.response.headers
        });
        
        switch (status) {
          case 400:
            // Usar el error específico del backend
            return {
              error: errorData?.error || TenantError.DOMAIN_MISMATCH,
              message: errorData?.message || "Datos inválidos para crear el tenant",
              field: errorData?.field,
              value: errorData?.value,
              details: errorData?.details
            };
          case 409:
            return {
              error: errorData?.error || TenantError.DOMAIN_MISMATCH,
              message: errorData?.message || "El tenant ya existe",
              field: errorData?.field,
              value: errorData?.value
            };
          case 500:
            return {
              error: TenantError.NETWORK_ERROR,
              message: errorData?.message || "Error interno del servidor",
            };
          default:
            return {
              error: TenantError.NETWORK_ERROR,
              message: errorData?.message || "Error del servidor",
            };
        }
      }
      
      // Error de red o conexión
      console.error("Network Error:", error.message);
      return {
        error: TenantError.NETWORK_ERROR,
        message: "Error de conexión al crear el tenant",
      };
    }
  },

  // Obtener todos los tenants
  getAllTenants: async  (
    filters?: TenantFilters
  ): Promise<TenantListResponse> => {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.TENANTS.BASE}`
      );
      
      // El backend devuelve directamente un array, pero necesitamos estructurarlo correctamente
      const tenantArray = response.data;
      
      // Si es un array, estructurarlo como TenantListResponse
      if (Array.isArray(tenantArray)) {
        return {
          data: tenantArray,
          total: tenantArray.length,
          page: filters?.page || 1,
          limit: filters?.limit || tenantArray.length,
        };
      }
      
      // Si ya tiene la estructura correcta, devolverlo tal como está
      if (tenantArray && typeof tenantArray === 'object' && tenantArray.data) {
        return tenantArray;
      }
      
      // Fallback en caso de estructura inesperada
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      };
      
    } catch (error: any) {
      console.error("Error fetching tenants:", error);

      // Manejar diferentes tipos de errores
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 404) {
          return {
            data: [],
            total: 0,
            page: 0,
            limit: 0,
            error: "TENANTS_NOT_FOUND",
            message: "No se encontraron tenants",
          };
        } else if (status === 403) {
          return {
            data: [],
            total: 0,
            page: 0,
            limit: 0,
            error: "FORBIDDEN",
            message: "Acceso denegado a los tenants",
          };
        } else if (errorData?.message) {
          return {
            data: [],
            total: 0,
            page: 0,
            limit: 0,
            error: errorData.error || "FETCH_ERROR",
            message: errorData.message,
          };
        }
      }

      // Error de red o desconocido
      return {
        data: [],
        total: 0,
        page: 0,
        limit: 0,
        error: "NETWORK_ERROR",
        message: "Error de conexión al obtener los tenants",
      };
    }
  },

  // Validar tenant por dominio
  validateByDomain: async (
    domain: string
  ): Promise<TenantValidationResponse> => {
    try {
      const response = await apiClient.get(
        `${
          API_CONFIG.ENDPOINTS.TENANTS.VALIDATE_DOMAIN
        }?domain=${encodeURIComponent(domain)}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error validating tenant:", error);

      // Manejar diferentes tipos de errores
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 404) {
          return {
            tenant: null,
            isValid: false,
            isActive: false,
            error: "TENANT_NOT_FOUND",
            message: "Tenant no encontrado para este dominio",
          };
        } else if (status === 403) {
          return {
            tenant: null,
            isValid: false,
            isActive: false,
            error: "TENANT_INACTIVE",
            message: "El tenant no está activo",
          };
        } else if (errorData?.message) {
          return {
            tenant: null,
            isValid: false,
            isActive: false,
            error: errorData.error || "VALIDATION_ERROR",
            message: errorData.message,
          };
        }
      }

      // Error de red o desconocido
      return {
        tenant: null,
        isValid: false,
        isActive: false,
        error: "NETWORK_ERROR",
        message: "Error de conexión al validar el tenant",
      };
    }
  },

  // Obtener configuración del tenant
  getTenantConfig: async (tenantId: string): Promise<Tenant> => {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.TENANTS.BASE}/${tenantId}/config`
    );
    return response.data;
  },

  // Verificar si el tenant está activo (para uso en interceptores)
  checkTenantStatus: async (
    domain: string
  ): Promise<{ isActive: boolean; tenant?: Tenant }> => {
    try {
      const response = await apiClient.head(
        `${
          API_CONFIG.ENDPOINTS.TENANTS.CHECK_STATUS
        }?domain=${encodeURIComponent(domain)}`
      );

      return {
        isActive: response.status === 200,
        tenant: response.headers["x-tenant-info"]
          ? JSON.parse(response.headers["x-tenant-info"])
          : undefined,
      };
    } catch (error) {
      return { isActive: false };
    }
  },
};
