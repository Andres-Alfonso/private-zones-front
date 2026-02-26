// app/api/endpoints/complete-phrase.ts

import { AxiosInstance } from 'axios';
import apiClient from "../client";
import type { 
    CompletePhraseGame,
    CreateCompletePhraseRequest,
    UpdateCompletePhraseRequest,
    CompletePhrasePlayableData,
    CompletePhraseValidationResult,
    CompletePhraseHint
} from "../types/complete-phrase.types";

const COMPLETE_PHRASE_ENDPOINTS = {
    CREATE: (activityId: string) => `/v1/complete-phrase/activity/${activityId}`,
    GET: (activityId: string) => `/v1/complete-phrase/activity/${activityId}`,
    UPDATE: (activityId: string) => `/v1/complete-phrase/activity/${activityId}`,
    PLAY: (activityId: string) => `/v1/complete-phrase/activity/${activityId}/play`,
    VALIDATE: (activityId: string) => `/v1/complete-phrase/activity/${activityId}/validate`,
    HINT: (activityId: string, phraseIndex: number, blankId: number) => 
        `/v1/complete-phrase/activity/${activityId}/hint/${phraseIndex}/${blankId}`,
    COMPLETE_ITEM: (itemId: string) => `/v1/user-progress/items/${itemId}/complete`,
};

export const CompletePhraseAPI = {

    async completeItem(
        itemId: string,
        data: { score?: number; percentage?: number; metadata?: Record<string, any> },
        client?: AxiosInstance
    ) {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.put(
                COMPLETE_PHRASE_ENDPOINTS.COMPLETE_ITEM(itemId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error completando item:', error);
            throw error;
        }
    },

    /**
     * Crear configuración del juego de completar frases
     */
    create: async (
        activityId: string,
        data: CreateCompletePhraseRequest,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: CompletePhraseGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                COMPLETE_PHRASE_ENDPOINTS.CREATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error creando juego de completar frases:', error);
            throw error;
        }
    },

    /**
     * Obtener configuración del juego
     */
    get: async (
        activityId: string,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: CompletePhraseGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                COMPLETE_PHRASE_ENDPOINTS.GET(activityId)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo juego de completar frases:', error);
            throw error;
        }
    },

    /**
     * Actualizar configuración del juego
     */
    update: async (
        activityId: string,
        data: UpdateCompletePhraseRequest,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: CompletePhraseGame }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.put(
                COMPLETE_PHRASE_ENDPOINTS.UPDATE(activityId),
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error actualizando juego de completar frases:', error);
            throw error;
        }
    },

    /**
     * Generar datos para jugar (sin revelar respuestas)
     */
    getPlayableData: async (
        activityId: string,
        fromModule: boolean,
        phraseIndex?: number,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: CompletePhrasePlayableData }> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = phraseIndex !== undefined
                ? `${COMPLETE_PHRASE_ENDPOINTS.PLAY(activityId)}?phraseIndex=${phraseIndex}`
                : COMPLETE_PHRASE_ENDPOINTS.PLAY(activityId);
            
            const response = await apiClientToUse.get(url, { params: { fromModule } });
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
            phraseIndex: number;
            answers: Array<{ blankId: number; answer: string }>;
            hintsUsed: number;
        },
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: CompletePhraseValidationResult }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.post(
                COMPLETE_PHRASE_ENDPOINTS.VALIDATE(activityId),
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
        phraseIndex: number,
        blankId: number,
        client?: AxiosInstance
    ): Promise<{ success: boolean; message: string; data: CompletePhraseHint }> => {
        try {
            const apiClientToUse = client || apiClient;
            const response = await apiClientToUse.get(
                COMPLETE_PHRASE_ENDPOINTS.HINT(activityId, phraseIndex, blankId)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo pista:', error);
            throw error;
        }
    },
};