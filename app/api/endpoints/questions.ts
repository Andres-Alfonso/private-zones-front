import { AxiosInstance } from 'axios';
import apiClient from '../client';

// ==================== INTERFACES ====================

export interface QuestionTranslation {
    languageCode: string;
    questionText: string;
    hint?: string;
    feedback?: string;
    correctFeedback?: string;
    incorrectFeedback?: string;
    explanation?: string;
}

export interface QuestionOptionTranslation {
    languageCode: string;
    optionText: string;
    feedback?: string;
}

export interface QuestionOption {
    id?: string;
    order?: number;
    isCorrect?: boolean;
    partialCreditPercentage?: number;
    matchingPairId?: string;
    matchingGroup?: string;
    translations: QuestionOptionTranslation[];
}

export interface Question {
    id?: string;
    type: 'multiple_choice' | 'multiple_response' | 'true_false' | 'short_answer' | 
          'essay' | 'matching' | 'ordering' | 'fill_in_blank' | 'scale' | 'matrix';
    order?: number;
    isGradable?: boolean;
    points?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    isRequired?: boolean;
    allowPartialCredit?: boolean;
    caseSensitive?: boolean;
    minLength?: number;
    maxLength?: number;
    scaleMin?: number;
    scaleMax?: number;
    scaleStep?: number;
    category?: string;
    tag?: string;
    randomGroup?: string;
    translations: QuestionTranslation[];
    options?: QuestionOption[];
}

export interface SaveQuestionsRequest {
    questions: Question[];
}

export interface QuestionsGetResponse {
    success: boolean;
    message: string;
    data: Question[];
}

export interface QuestionsSaveResponse {
    success: boolean;
    message: string;
    data: Question[];
}

export interface QuestionDeleteResponse {
    success: boolean;
    message: string;
}

// ==================== ENDPOINTS ====================

const QUESTIONS_ENDPOINTS = {
    GET_ALL: (assessmentId: string) => `/v1/assessments/${assessmentId}/questions`,
    SAVE: (assessmentId: string) => `/v1/assessments/${assessmentId}/questions`,
    DELETE: (assessmentId: string, questionId: string) => `/v1/assessments/${assessmentId}/questions/${questionId}`,
};

// ==================== API ====================

export const QuestionsApi = {
    getQuestions: async (
        assessmentId: string,
        client?: AxiosInstance
    ): Promise<Question[]> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = QUESTIONS_ENDPOINTS.GET_ALL(assessmentId);
            const response = await apiClientToUse.get<QuestionsGetResponse>(url);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    },

    saveQuestions: async (
        assessmentId: string,
        questions: Question[],
        client?: AxiosInstance
    ): Promise<Question[]> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = QUESTIONS_ENDPOINTS.SAVE(assessmentId);
            const response = await apiClientToUse.post<QuestionsSaveResponse>(url, { questions });
            return response.data.data;
        } catch (error) {
            console.error('Error saving questions:', error);
            throw error;
        }
    },

    deleteQuestion: async (
        assessmentId: string,
        questionId: string,
        client?: AxiosInstance
    ): Promise<void> => {
        try {
            const apiClientToUse = client || apiClient;
            const url = QUESTIONS_ENDPOINTS.DELETE(assessmentId, questionId);
            await apiClientToUse.delete<QuestionDeleteResponse>(url);
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    },
};