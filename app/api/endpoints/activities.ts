// app/api/endpoints/activities.ts

import { AxiosInstance } from 'axios';
import apiClient from "../client";

export interface ActivityFilters {
    search?: string;
    actives?: boolean;
    type?: string;
    page?: number;
    limit?: number;
}

export interface ActivityListResponse {
    success: boolean;
    message: string;
    data: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    stats: {
        total: number;
        totalActive: number;
        totalInactive: number;
        totalDraft: number;
        totalPublished: number;
        totalArchived: number;
    };
}

export interface ActivityGetByIdResponse {
    success: boolean;
    message: string;
    data: any;
}

export interface ActivityCreateRequest {
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
    configuration: {
        timeLimit?: number;
        strictTimeLimit?: boolean;
        maxAttempts?: number;
        timeBetweenAttempts?: number;
        showTimer?: boolean;
        showScore?: boolean;
        showHints?: boolean;
        maxHints?: number;
        isGradable?: boolean;
        passingScore?: number;
        showScoreImmediately?: boolean;
        availableFrom?: string;
        availableUntil?: string;
        showFeedbackAfterCompletion?: boolean;
        customSuccessMessage?: string;
        customFailMessage?: string;
        awardBadges?: boolean;
        showLeaderboard?: boolean;
        notifyInstructorOnCompletion?: boolean;
        gameData?: Record<string, any>;
    };
}

const ACTIVITY_ENDPOINTS = {
    BASE: '/v1/activities',
    BY_ID: (id: string) => `/v1/activities/${id}`,
    GET_ALL: (courseId: string) => `/v1/activities/course/${courseId}`,
    CREATE: '/v1/activities',
    UPDATE: (id: string) => `/v1/activities/${id}`,
};

export const ActivitiesAPI = {
    getAll: async (
        courseId: string,
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
            const url = `${ACTIVITY_ENDPOINTS.GET_ALL(courseId)}${queryString ? `?${queryString}` : ''}`;

            const response = await apiClientToUse.get(url);

            return response.data;

        } catch (error) {
            console.error('Error obteniendo actividades:', error);
            throw error;
        }
    },

    getById: async (id: string, client?: AxiosInstance): Promise<ActivityGetByIdResponse> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = ACTIVITY_ENDPOINTS.BY_ID(id);
            const response = await apiClientToUse.get(url);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo actividad:', error);
            throw error;
        }
    },

    create: async (
        activityData: ActivityCreateRequest,
        client?: AxiosInstance
    ): Promise<ActivityGetByIdResponse> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(ACTIVITY_ENDPOINTS.CREATE, activityData);
            return response.data;
        } catch (error) {
            console.error('Error creando actividad:', error);
            throw error;
        }
    },

    update: async (
        id: string,
        activityData: Partial<ActivityCreateRequest>,
        client?: AxiosInstance
    ): Promise<ActivityGetByIdResponse> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = ACTIVITY_ENDPOINTS.UPDATE(id);
            const response = await apiClientToUse.put(url, activityData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando actividad:', error);
            throw error;
        }
    },
};