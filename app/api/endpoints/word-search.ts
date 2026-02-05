// app/api/endpoints/word-search.ts

import { AxiosInstance } from 'axios';
import apiClient from "../client";

export interface WordSearchCreateRequest {
    gridWidth: number;
    gridHeight: number;
    words: Array<{
        word: string;
        clue?: string;
        category?: string;
    }>;
    allowedDirections: string[];
    fillEmptyCells?: boolean;
    caseSensitive?: boolean;
    showWordList?: boolean;
    showClues?: boolean;
    pointsPerWord?: number;
    bonusForSpeed?: number;
    penaltyPerHint?: number;
}

const WORD_SEARCH_ENDPOINTS = {
    CREATE: (activityId: string) => `/v1/word-search/activity/${activityId}`,
    GET: (activityId: string) => `/v1/word-search/activity/${activityId}`,
    PLAY: (activityId: string) => `/v1/word-search/activity/${activityId}/play`,
    ADMIN_GRID: (activityId: string) => `/v1/word-search/activity/${activityId}/admin-grid`,
    VALIDATE: (activityId: string) => `/v1/word-search/activity/${activityId}/validate`,
    UPDATE: (activityId: string) => `/v1/word-search/activity/${activityId}`,
    REGENERATE_SEED: (activityId: string) => `/v1/word-search/activity/${activityId}/regenerate-seed`,
    HINT: (activityId: string, wordIndex: number) => `/v1/word-search/activity/${activityId}/hint/${wordIndex}`,
};

export const WordSearchAPI = {
    create: async (
        activityId: string,
        data: WordSearchCreateRequest,
        client?: AxiosInstance
    ) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                WORD_SEARCH_ENDPOINTS.CREATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error creating word search:', error);
            throw error;
        }
    },

    get: async (activityId: string, client?: AxiosInstance) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.GET(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error getting word search:', error);
            throw error;
        }
    },

    getPlayableGrid: async (activityId: string, client?: AxiosInstance) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.PLAY(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error getting playable grid:', error);
            throw error;
        }
    },

    getAdminGrid: async (activityId: string, client?: AxiosInstance) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.ADMIN_GRID(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error getting admin grid:', error);
            throw error;
        }
    },

    validate: async (
        activityId: string,
        foundWords: Array<{
            word: string;
            startRow: number;
            startCol: number;
            endRow: number;
            endCol: number;
        }>,
        client?: AxiosInstance
    ) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                WORD_SEARCH_ENDPOINTS.VALIDATE(activityId),
                { foundWords }
            );
            return response.data;
        } catch (error) {
            console.error('Error validating attempt:', error);
            throw error;
        }
    },

    update: async (
        activityId: string,
        data: Partial<WordSearchCreateRequest>,
        client?: AxiosInstance
    ) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.put(
                WORD_SEARCH_ENDPOINTS.UPDATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error updating word search:', error);
            throw error;
        }
    },

    regenerateSeed: async (activityId: string, client?: AxiosInstance) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                WORD_SEARCH_ENDPOINTS.REGENERATE_SEED(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error regenerating seed:', error);
            throw error;
        }
    },

    getHint: async (activityId: string, wordIndex: number, client?: AxiosInstance) => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.HINT(activityId, wordIndex)
            );
            return response.data;
        } catch (error) {
            console.error('Error getting hint:', error);
            throw error;
        }
    },
};