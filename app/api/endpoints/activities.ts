// app/api/endpoints/activities.ts

import { AxiosInstance } from 'axios';
import apiClient from "../client";
import type { 
    Activity,
    ActivityFilters, 
    ActivityListResponse 
} from "../types/activity.types";

const ACTIVITY_ENDPOINTS = {
    BASE: '/v1/activities',
    BY_ID: (id: string) => `/v1/activities/${id}`,
    BY_COURSE: (courseId: string) => `/v1/activities/course/${courseId}`,
    CREATE: '/v1/activities',
    UPDATE: (id: string) => `/v1/activities/${id}`,
    DELETE: (id: string) => `/v1/activities/${id}`,
    TOGGLE_ACTIVE: (id: string) => `/v1/activities/${id}/toggle-active`,
    SAVE_PROGRESS: (activityId: string, courseId: string) => `/v1/activities/${activityId}/complete`,
};

export const ActivitiesAPI = {
    /**
     * Obtener todas las actividades con filtros
     */
    getAll: async (
        filters?: ActivityFilters,
        client?: AxiosInstance
    ): Promise<ActivityListResponse> => {
        try {
            const apiClientToUse = client || apiClient;
            const params = new URLSearchParams();
            
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, value.toString());
                    }
                });
            }
            
            const queryString = params.toString();
            const url = `${ACTIVITY_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;
            
            const response = await apiClientToUse.get(url);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo actividades:', error);
            throw error;
        }
    },

    /**
     * Obtener actividades por curso
     */
    getByCourse: async (
        courseId: string,
        filters?: Omit<ActivityFilters, 'courseId'>,
        client?: AxiosInstance
    ): Promise<ActivityListResponse> => {
        try {
            const apiClientToUse = client || apiClient;
            const params = new URLSearchParams();
            
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, value.toString());
                    }
                });
            }
            
            const queryString = params.toString();
            const url = `${ACTIVITY_ENDPOINTS.BY_COURSE(courseId)}${queryString ? `?${queryString}` : ''}`;
            
            const response = await apiClientToUse.get(url);
            return {
                activities: response.data.data,
                filters: response.data.filters || filters,
                pagination: response.data.pagination,
                stats: response.data.stats,
            };
        } catch (error) {
            console.error('Error obteniendo actividades del curso:', error);
            throw error;
        }
    },

    /**
     * Obtener una actividad por ID
     */
    getById: async (
        id: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: Activity }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(ACTIVITY_ENDPOINTS.BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Error obteniendo actividad:', error);
            throw error;
        }
    },

    /**
     * Crear una nueva actividad
     */
    create: async (
        activityData: {
            courseId: string;
            type: string;
            status?: string;
            difficulty?: string;
            isActive?: boolean;
            order?: number;
            maxScore?: number;
            translations: Array<{
                languageCode: string;
                title: string;
                description?: string;
                instructions?: string;
                welcomeMessage?: string;
                completionMessage?: string;
            }>;
            configuration?: {
                timeLimit?: number;
                strictTimeLimit?: boolean;
                showScoreImmediately?: boolean;
                showFeedbackAfterCompletion?: boolean;
                maxAttempts?: number;
                showTimer?: boolean;
                showScore?: boolean;
                showHints?: boolean;
                maxHints?: number;
                isGradable?: boolean;
                passingScore?: number;
                gameData?: Record<string, any>;
            };
        },
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: Activity }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(ACTIVITY_ENDPOINTS.CREATE, activityData);
            return response.data;
        } catch (error) {
            console.error('Error creando actividad:', error);
            throw error;
        }
    },

    /**
     * Actualizar una actividad
     */
    update: async (
        id: string,
        activityData: Partial<{
            type: string;
            status: string;
            difficulty: string;
            isActive: boolean;
            order: number;
            maxScore: number;
            translations: Array<{
                languageCode: string;
                title: string;
                description?: string;
                instructions?: string;
            }>;
            configuration: Record<string, any>;
        }>,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: Activity }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.put(ACTIVITY_ENDPOINTS.UPDATE(id), activityData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando actividad:', error);
            throw error;
        }
    },

    /**
     * Eliminar una actividad
     */
    delete: async (
        id: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.delete(ACTIVITY_ENDPOINTS.DELETE(id));
            return response.data;
        } catch (error) {
            console.error('Error eliminando actividad:', error);
            throw error;
        }
    },

    /**
     * Activar/Desactivar una actividad
     */
    toggleActive: async (
        id: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: Activity }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.patch(ACTIVITY_ENDPOINTS.TOGGLE_ACTIVE(id));
            return response.data;
        } catch (error) {
            console.error('Error cambiando estado de actividad:', error);
            throw error;
        }
    },

    saveProgress: async (
        activityId: string,
        courseId: string,
        result: any,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(ACTIVITY_ENDPOINTS.SAVE_PROGRESS(activityId, courseId), result);
            return response.data;
        } catch (error) {
            console.error('Error guardando progreso de actividad:', error);
            throw error;
        }
    }
};