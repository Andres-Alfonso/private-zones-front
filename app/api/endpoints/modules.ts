// app/api/endpoints/modules.ts
import { AxiosInstance } from "axios";
import apiClient from "../client";
import { CourseModule, CreateModuleData, ModuleApiResponse, ModulesResponse } from "../types/modules.types";
// import { ContentCreateResponse } from "../types/content.types";

const MODULES_ENDPOINTS = {
    BASE: '/v1/modules',
    BY_ID: (id: string) => `/v1/modules/${id}`,
    GET_ALL: (courseId: string | null = null) => {
        return courseId ? `/v1/modules/course/${courseId}` : '/v1/modules';
    },
    CREATE: '/v1/modules/create',
};

// Tipos para las opciones y respuesta
export interface GetContentOptions {
    includeCourse?: boolean;
    includeModule?: boolean;
    includeNavigation?: boolean;
}

export interface ProgressUpdateData {
    timeSpent?: number;
    progressPercentage?: number;
}

export interface ProgressResponse {
    success: boolean;
    message?: string;
}

export interface ContentResponse {
    id: string;
    title: string;
    description: string;
    content: {
        type: "video" | "image" | "document" | "embed";
        videoUrl?: string;
        videoThumbnail?: string;
        videoDuration?: number;
        textContent?: string;
        htmlContent?: string;
        pdfUrl?: string;
        interactiveUrl?: string;
    };
    module: {
        id: string;
        title: string;
    };
    course: {
        id: string;
        title: string;
        colorTitle: string;
    };
    navigation: {
        previousItem?: {
            id: string;
            title: string;
            type: string;
            referenceId: string;
        };
        nextItem?: {
            id: string;
            title: string;
            type: string;
            referenceId: string;
        };
    };
    userProgress: {
        isCompleted: boolean;
        completionDate?: string;
        timeSpent: number;
        bookmarked: boolean;
        lastPosition?: number; // Para videos
    };
    metadata: {
        duration: number;
        difficulty: "beginner" | "intermediate" | "advanced";
        tags: string[];
        createdAt: string;
        updatedAt: string;
    };
}

export interface ContentGetResponse {
    id: string;
    course: {
        id: string;
        slug: string;
        tenantId: string;
        isActive: boolean;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        translations: any[];
    };

    courseId: string;
    title: string;
    description: string | null;
    thumbnailImagePath: string | null;

    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;

    configuration: {
        id: string;
        courseModuleId: string;
        isActive: boolean;
        order: number;
        approvalPercentage: number;
        metadata: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
    };

    items: any[];
}


export interface ContentGetByIdResponse {
    success: boolean;
    data: ContentGetResponse;
}

export const ModuleAPI = {
    async getById(
        contentId: string,
        options?: GetContentOptions,
        client?: AxiosInstance
    ): Promise<ContentGetByIdResponse> {
        const apiClientToUse = client || apiClient;
        // console.log('CLIENTE EN CONTENTS API:', apiClientToUse);

        const params = new URLSearchParams();

        if(options){
            if (options.includeCourse) {
                params.append("includeCourse", "true");
            }

            if (options.includeModule) {
                params.append("includeModule", "true");
            }

            if (options.includeNavigation) {
                params.append("includeNavigation", "true");
            }
        }

        const url = `${MODULES_ENDPOINTS.BY_ID(contentId)}${params.toString() ? `?${params.toString()}` : ""
            }`;

        const response = await apiClientToUse.get<ContentResponse>(url);
        return response.data;
    },

    async getAllModules(
        courseId: string | null = null,
        filters: Record<string, any> = {},
        client?: AxiosInstance
    ): Promise<ModulesResponse> {
        const apiClientToUse = client || apiClient;
        const params = new URLSearchParams(filters);
        const response = await apiClientToUse.get<ModulesResponse>(
            MODULES_ENDPOINTS.GET_ALL(courseId),
            { params }
        );
        return response.data;
    },

    /**
     * Obtener módulos de un curso específico
     */
    async getByCourse(courseId: string, apiClient: AxiosInstance): Promise<CourseModule[] | null> {
        try {
        const response = await apiClient.get<ModulesListApiResponse>(`/courses/${courseId}/modules`);
        
        if (response.data.success) {
            return response.data.data;
        }
        
        console.error('Error al obtener módulos:', response.data.message);
        return null;
        } catch (error) {
        console.error('Error en getByCourse:', error);
        return null;
        }
    },

    /**
     * Crear un nuevo módulo
     */
    async create(moduleData: CreateModuleData, apiClient: AxiosInstance): Promise<ModuleApiResponse> {
        try {
        const response = await apiClient.post<ModuleApiResponse>(MODULES_ENDPOINTS.CREATE, moduleData);
        return response.data;
        } catch (error: any) {
        console.error('Error al crear módulo:', error);
        
        if (error.response?.data) {
            return error.response.data;
        }
        
        return {
            success: false,
            message: error.message || 'Error desconocido al crear módulo',
            data: {} as CourseModule
        };
        }
    }

    // async create(
    //     data: Partial<ContentResponse> = {},
    //     client?: AxiosInstance
    // ): Promise<ContentCreateResponse> {
    //     const apiClientToUse = client || apiClient;
    //     const response = await apiClientToUse.post<ContentResponse>(CONTENTS_ENDPOINTS.CREATE, {...data});
    //     return response.data;
    // }
};
