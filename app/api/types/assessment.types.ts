export interface Assessment {
    id: string;
    slug: string;
    type: 'evaluation' | 'survey' | 'self_assessment';
    status: 'draft' | 'published' | 'archived' | 'suspended';
    isActive: boolean;
    order: number;
    courseId: string;
    tenantId: string;
    created_at: string;
    updated_at: string;
    translations: Array<{
        languageCode: string;
        title: string;
        description: string;
    }>;
    configuration: {
        isGradable: boolean;
        maxScore: number;
        timeLimit: number | null;
        maxAttempts: number;
    };
    course?: {
        id: string;
        slug: string;
        translations: Array<{
            languageCode: string;
            title: string;
        }>;
    };
    // Estadísticas
    totalAttempts?: number;
    completedAttempts?: number;
    averageScore?: number;
}

export interface AssessmentFilters {
    isActive?: boolean;
    search?: string;
    type?: 'evaluation' | 'survey' | 'self_assessment';
    status?: 'draft' | 'published' | 'archived' | 'suspended';
    courseId?: string;
    actives?: boolean;
    sortBy?: 'created_at' | 'updated_at' | 'title';
    page?: number;
    limit?: number;
}

export interface AssessmentListResponse {
    success: boolean;
    message: string;
    data: Assessment[];
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