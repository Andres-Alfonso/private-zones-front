// app/api/endpoints/sections.ts


import { createApiClient } from "../client";
import { API_CONFIG } from '../config';

import { SectionFilters, SectionListResponse } from "../types/section.types";

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

};