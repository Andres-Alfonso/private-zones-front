// app/api/endpoints/tenants.ts

import apiClient from "../client";
import { API_CONFIG } from "../config";

// Primero necesitamos actualizar la configuración con los endpoints de tenant
import { TenantValidationResponse, Tenant } from "../types/tenant.types";

export const TenantsAPI = {
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
