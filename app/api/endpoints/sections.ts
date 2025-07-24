// app/api/endpoints/sections.ts


import { create } from "node_modules/axios/index.cjs";
import { createApiClient } from "../client";
import { API_CONFIG } from '../config';

import { CreateTenantRequest, Section, SectionError, SectionErrorResponse, SectionFilters, SectionListResponse } from "../types/section.types";

// Primero actualiza tu API_CONFIG para incluir los endpoints de courses
const SECTIONS_ENDPOINTS = {
  BASE: '/v1/sections',
  BY_ID: (id: string) => `/v1/sections/${id}`,
};


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


export const SectionApi = {
    getAll: async (filters?: SectionFilters): Promise<SectionListResponse> => {
        try {
            const params = new URLSearchParams();
            
            if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                params.append(key, value.toString());
                }
            });
            }
            
            const queryString = params.toString();
            const url = `${SECTIONS_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;

            const apiClient = createApiClient(getCurrentDomain());
            
            const response = await apiClient.get(url);

            return response.data;

        } catch (error) {
            console.error('Error en forgot password API:', error);
            throw error;
        }
    },

    getById: async (sectionId: string): Promise<Section | SectionErrorResponse> => {
        try {
          const apiClient = createApiClient(getCurrentDomain());
          const response = await apiClient.get(
            `${API_CONFIG.ENDPOINTS.SECTIONS.BASE}/${sectionId}`
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
                  error: SectionError.SECTION_NOT_FOUND,
                  message: "Tenant no encontrado",
                };
              case 403:
                return {
                  error: SectionError.FORBIDDEN,
                  message: "Acceso denegado al tenant",
                };
              case 500:
                return {
                  error: SectionError.NETWORK_ERROR,
                  message: "Error interno del servidor",
                };
              default:
                return {
                  error: SectionError.NETWORK_ERROR,
                  message: errorData?.message || "Error del servidor",
                };
            }
          }
          // Error de red o conexión
          console.error("Network Error:", error.message);
          return {
            error: SectionError.NETWORK_ERROR,
            message: "Error de conexión al obtener la sección",
          };
        }
    },

    create: async (sectionData: CreateTenantRequest): Promise<CreateTenantRequest | SectionErrorResponse> => {
        try {
            const apiClient = createApiClient(getCurrentDomain());
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.SECTIONS.CREATE, sectionData);
            return response.data;
        } catch (error: any) {
            console.error('Error al crear la sección:', error);
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                switch (status) {
                    case 400:
                        return {
                            error: SectionError.VALIDATION_ERROR,
                            message: errorData?.message || 'Error de validación',
                        };
                    case 403:
                        return {
                            error: SectionError.FORBIDDEN,
                            message: 'Acceso denegado',
                        };
                    case 500:
                        return {
                            error: SectionError.NETWORK_ERROR,
                            message: 'Error interno del servidor',
                        };
                    default:
                        return {
                            error: SectionError.NETWORK_ERROR,
                            message: errorData?.message || 'Error del servidor',
                        };
                }
            }
            return {
                error: SectionError.NETWORK_ERROR,
                message: 'Error de conexión al crear la sección',
            };
        }
    }

};