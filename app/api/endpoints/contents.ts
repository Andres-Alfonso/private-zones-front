// app/api/endpoints/contents.ts
import { AxiosInstance } from 'axios';

const CONTENTS_ENDPOINTS = {
  BASE: '/v1/contents',
  BY_ID: (id: string) => `/v1/contents/${id}`,
  COMPLETE: (id: string) => `/v1/contents/${id}/complete`,
  PROGRESS: (id: string) => `/v1/contents/${id}/progress`,
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
        type: 'video' | 'image' | 'document' | 'embed';
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
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        tags: string[];
        createdAt: string;
        updatedAt: string;
    };
}

export const ContentAPI = {
  async getById(
    contentId: string,
    options: GetContentOptions,
    authenticatedApiClient: AxiosInstance
  ): Promise<ContentResponse> {
    const params = new URLSearchParams();
    
    if (options.includeCourse) {
      params.append('includeCourse', 'true');
    }
    if (options.includeModule) {
      params.append('includeModule', 'true');
    }
    if (options.includeNavigation) {
      params.append('includeNavigation', 'true');
    }

    const url = `${CONTENTS_ENDPOINTS.BY_ID(contentId)}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await authenticatedApiClient.get<ContentResponse>(url);
    return response.data;
  },

  async markComplete(
    contentId: string,
    authenticatedApiClient: AxiosInstance
  ): Promise<ProgressResponse> {
    const response = await authenticatedApiClient.post<ProgressResponse>(
      CONTENTS_ENDPOINTS.COMPLETE(contentId)
    );
    return response.data;
  },

  async updateVideoProgress(
    contentId: string,
    progressData: ProgressUpdateData,
    authenticatedApiClient: AxiosInstance
  ): Promise<ProgressResponse> {
    const response = await authenticatedApiClient.post<ProgressResponse>(
      CONTENTS_ENDPOINTS.PROGRESS(contentId),
      progressData
    );
    return response.data;
  }
};