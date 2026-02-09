// app/api/endpoints/hanging.ts

import { AxiosInstance } from 'axios';
import apiClient from "../client";
import type { 
    HangingGame,
    CreateHangingGameRequest,
    UpdateHangingGameRequest,
    HangingPlayableData,
    HangingValidationResult,
    HangingHint
} from "../types/hanging.types";

const HANGING_ENDPOINTS = {
    CREATE: (activityId: string) => `/v1/hanging/activity/${activityId}`,
    GET: (activityId: string) => `/v1/hanging/activity/${activityId}`,
    UPDATE: (activityId: string) => `/v1/hanging/activity/${activityId}`,
    PLAY: (activityId: string) => `/v1/hanging/activity/${activityId}/play`,
    VALIDATE: (activityId: string) => `/v1/hanging/activity/${activityId}/validate`,
    HINT: (activityId: string, wordIndex: number) => `/v1/hanging/activity/${activityId}/hint/${wordIndex}`,
};

export const HangingAPI = {
    /**
     * Crear configuración del juego de ahorcado
     */
    create: async (
        activityId: string,
        data: CreateHangingGameRequest,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: HangingGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                HANGING_ENDPOINTS.CREATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error creando juego de ahorcado:', error);
            throw error;
        }
    },

    /**
     * Obtener configuración del juego
     */
    get: async (
        activityId: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: HangingGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                HANGING_ENDPOINTS.GET(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo juego de ahorcado:', error);
            throw error;
        }
    },

    /**
     * Actualizar configuración del juego
     */
    update: async (
        activityId: string,
        data: UpdateHangingGameRequest,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: HangingGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.put(
                HANGING_ENDPOINTS.UPDATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error actualizando juego de ahorcado:', error);
            throw error;
        }
    },

    /**
     * Generar datos para jugar (sin revelar la palabra)
     */
    getPlayableData: async (
        activityId: string,
        wordIndex?: number,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: HangingPlayableData }> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = wordIndex !== undefined
                ? `${HANGING_ENDPOINTS.PLAY(activityId)}?wordIndex=${wordIndex}`
                : HANGING_ENDPOINTS.PLAY(activityId);
            
            const response = await apiClientToUse.get(url);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo datos de juego:', error);
            throw error;
        }
    },

    /**
     * Validar un intento del usuario
     */
    validateAttempt: async (
        activityId: string,
        data: {
            wordIndex: number;
            guessedLetters: string[];
            hintsUsed: number;
        },
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: HangingValidationResult }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                HANGING_ENDPOINTS.VALIDATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error validando intento:', error);
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
    ): Promise<{ success: boolean; message: string; data: HangingHint }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                HANGING_ENDPOINTS.HINT(activityId, wordIndex)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo pista:', error);
            throw error;
        }
    },
};