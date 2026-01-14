

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
    }
};