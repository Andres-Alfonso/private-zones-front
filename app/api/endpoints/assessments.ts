

import { AxiosInstance } from 'axios';
import { createApiClient } from '../client';
import { AssessmentFilters, AssessmentGetByIdResponse, AssessmentListResponse, AssessmentUpdateRequest } from '../types/assessment.types';
import apiClient from "../client";


const ASSESSMENT_ENDPOINTS = {
    BASE: '/v1/assessments',
    BY_ID: (id: string) => `/v1/assessments/${id}`,
    GET_ALL: (courseId: string | null = null) => {
        return courseId ? `/v1/assessments/course/${courseId}` : '/v1/assessments';
    },
    CREATE: '/v1/assessments/create',
    TAKE: (id: string) => `/v1/assessments/${id}/take`,
    VALIDATE_SESSION: '/v1/assessment-sessions/validate',
    SUBMIT_ATTEMPT: (attemptId: string) => `/v1/assessment-attempts/${attemptId}/submit`,
    START_INFO: (id: string) => `/v1/assessments/${id}/start-info`,
    CREATE_SESSION: '/v1/assessment-sessions/create',
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



export const AssessmentApi = {
    getAll: async (
        courseId: string, 
        filters?: AssessmentFilters, 
        client?: AxiosInstance
    ): Promise<AssessmentListResponse> => {
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
            const url = `${ASSESSMENT_ENDPOINTS.GET_ALL(courseId)}${queryString ? `?${queryString}` : ''}`;

            // const apiClient = createApiClient(getCurrentDomain());
            
            const response = await apiClientToUse.get(url);

            return response.data;
            
        } catch (error) {
            console.error('Error en forgot password API:', error);
            throw error;
        }
    },
    getById: async (id: string, client?: AxiosInstance): Promise<AssessmentGetByIdResponse> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = ASSESSMENT_ENDPOINTS.BY_ID(id);
            const response = await apiClientToUse.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching assessment by ID:', error);
            throw error;
        }
    },

    update: async (
        id: string,
        assessmentData: any,
        client?: AxiosInstance
    ): Promise<AssessmentUpdateRequest> => {
        try {
            const apiClientToUse = client || apiClient;

            const url = ASSESSMENT_ENDPOINTS.BY_ID(id);

            const updatedAssessmentResponse = await apiClientToUse.put(url, assessmentData);

            return updatedAssessmentResponse.data;
        } catch (error) {
            console.error('Error updating assessment:', error);
            throw error;
        }
    },

    /**
     * Valida si una sesión de evaluación es activa y válida
     */
    validateSession: async (token: string, assessmentId: string, client?: AxiosInstance) => {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.get(ASSESSMENT_ENDPOINTS.VALIDATE_SESSION, {
            params: { token, assessmentId }
        });
        return response.data;
    },

    /**
     * Obtiene la estructura completa de la evaluación para ser respondida
     */
    getToTake: async (id: string, client?: AxiosInstance): Promise<AssessmentGetByIdResponse> => {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.get(ASSESSMENT_ENDPOINTS.TAKE(id));
        return response.data;
    },

    /**
     * Envía las respuestas finales de un intento
     */
    submitAttempt: async (attemptId: string, answers: any, client?: AxiosInstance) => {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.post(
            ASSESSMENT_ENDPOINTS.SUBMIT_ATTEMPT(attemptId), 
            { answers }
        );
        return response.data;
    },
    /**
     * Obtiene la información inicial, configuración e intentos del usuario para una evaluación
     */
    getStartInfo: async (id: string, client?: AxiosInstance) => {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.get(ASSESSMENT_ENDPOINTS.START_INFO(id));
        // Según tu código actual, la estructura es data.data
        return response.data;
    },

    /**
     * Crea una nueva sesión (intento) para el usuario
     */
    createSession: async (assessmentId: string, client?: AxiosInstance) => {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.post(ASSESSMENT_ENDPOINTS.CREATE_SESSION, {
            assessmentId
        });
        return response.data;
    }
};