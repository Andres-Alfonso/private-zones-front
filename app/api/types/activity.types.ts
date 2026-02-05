// app/api/types/activity.types.ts

export type GameType = 
    | 'word_search'
    | 'hanging'
    | 'complete_phrase'
    | 'crossword'
    | 'drag_drop'
    | 'matching'
    | 'memory'
    | 'quiz_game'
    | 'puzzle';

export type ActivityStatus = 'draft' | 'published' | 'archived' | 'suspended';
export type ActivityDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ActivityTranslation {
    id: string;
    activityId: string;
    languageCode: string;
    title: string;
    description?: string;
    instructions?: string;
    welcomeMessage?: string;
    completionMessage?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface ActivityConfiguration {
    id: string;
    activityId: string;
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
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    id: string;
    slug: string;
    tenantId: string;
    courseId?: string;
    courseName?: string;
    type: GameType;
    status: ActivityStatus;
    difficulty?: ActivityDifficulty;
    isActive: boolean;
    order: number;
    maxScore: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    translations?: ActivityTranslation[];
    configuration?: ActivityConfiguration;
    stats?: {
        totalAttempts: number;
        totalCompleted: number;
        averageScore: number;
        averageTime: number;
    };
}

export interface ActivityFilters {
    search?: string;
    type?: string;
    status?: string;
    courseId?: string;
    actives?: boolean;
    page?: number;
    limit?: number;
}

export interface ActivityListResponse {
    activities: Activity[];
    filters: ActivityFilters;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    stats: {
        total: number;
        totalActive: number;
        totalInactive: number;
        byType: Record<string, number>;
    };
}