// app/api/endpoints/tenants.ts

// import {apiClient, createApiClient} from "../client";
import apiClient from "../client";
import { API_CONFIG } from "../config";

// Primero necesitamos actualizar la configuración con los endpoints de tenant
import { TenantValidationResponse, Tenant, TenantFilters, TenantListResponse } from "../types/tenant.types";

export const TenantsAPI = {

  // Obtener todos los tenants
  getAllTenants: async  (
    filters?: TenantFilters
  ): Promise<TenantListResponse> => {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.TENANTS.BASE}`
      );
      return response.data;
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
