// app/api/endpoints/word-search.ts

import { AxiosInstance } from 'axios';
import apiClient from "../client";
import type { 
    WordSearchGame,
    CreateWordSearchGameRequest,
    UpdateWordSearchGameRequest,
    WordSearchPlayableData,
    WordSearchValidationResult,
    WordSearchHint,
    GeneratedGrid
} from "../types/word-search.types";

const WORD_SEARCH_ENDPOINTS = {
    CREATE: (activityId: string) => `/v1/word-search/activity/${activityId}`,
    GET: (activityId: string) => `/v1/word-search/activity/${activityId}`,
    UPDATE: (activityId: string) => `/v1/word-search/activity/${activityId}`,
    PLAY: (activityId: string) => `/v1/word-search/activity/${activityId}/play`,
    ADMIN_GRID: (activityId: string) => `/v1/word-search/activity/${activityId}/admin-grid`,
    VALIDATE: (activityId: string) => `/v1/word-search/activity/${activityId}/validate`,
    REGENERATE_SEED: (activityId: string) => `/v1/word-search/activity/${activityId}/regenerate-seed`,
    HINT: (activityId: string, wordIndex: number) => `/v1/word-search/activity/${activityId}/hint/${wordIndex}`,
};

export const WordSearchAPI = {
    /**
     * Crear configuración del juego de sopa de letras
     */
    create: async (
        activityId: string,
        data: CreateWordSearchGameRequest,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: WordSearchGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                WORD_SEARCH_ENDPOINTS.CREATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error creando sopa de letras:', error);
            throw error;
        }
    },

    /**
     * Obtener configuración del juego
     */
    get: async (
        activityId: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: WordSearchGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.GET(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo sopa de letras:', error);
            throw error;
        }
    },

    /**
     * Actualizar configuración del juego
     */
    update: async (
        activityId: string,
        data: UpdateWordSearchGameRequest,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: WordSearchGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.put(
                WORD_SEARCH_ENDPOINTS.UPDATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error actualizando sopa de letras:', error);
            throw error;
        }
    },

    /**
     * Generar grid para jugar (sin revelar posiciones)
     */
    getPlayableGrid: async (
        activityId: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: WordSearchPlayableData }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.PLAY(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo grid de juego:', error);
            throw error;
        }
    },

    /**
     * Generar grid completo para administradores
     */
    getAdminGrid: async (
        activityId: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: GeneratedGrid }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.ADMIN_GRID(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo grid administrativo:', error);
            throw error;
        }
    },

    /**
     * Validar intento del usuario
     */
    validateAttempt: async (
        activityId: string,
        data: {
            foundWords: Array<{
                word: string;
                startRow: number;
                startCol: number;
                endRow: number;
                endCol: number;
            }>;
        },
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: WordSearchValidationResult }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                WORD_SEARCH_ENDPOINTS.VALIDATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error validando intento:', error);
            throw error;
        }
    },

    /**
     * Regenerar seed para crear un nuevo tablero
     */
    regenerateSeed: async (
        activityId: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: WordSearchGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                WORD_SEARCH_ENDPOINTS.REGENERATE_SEED(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error regenerando seed:', error);
            throw error;
        }
    },

    /**
     * Obtener una pista
     */
    getHint: async (
        activityId: string,
        wordIndex: number,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: WordSearchHint }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                WORD_SEARCH_ENDPOINTS.HINT(activityId, wordIndex)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo pista:', error);
            throw error;
        }
    },
};