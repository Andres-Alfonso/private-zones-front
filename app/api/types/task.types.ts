// types/task.types.ts
export enum TaskStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    CLOSED = 'closed',
    ARCHIVED = 'archived'
}

export type UpdateTaskPayload = {
    title?: string;
    description?: string;
    instructions?: string;
    status?: TaskStatus;
    order?: number;
    startDate?: string | undefined | Date;
    endDate?: string;
    lateSubmissionDate?: string | undefined | Date;
    maxPoints?: number;
    lateSubmissionPenalty?: number;
    maxFileUploads?: number;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    allowMultipleSubmissions?: boolean;
    maxSubmissionAttempts?: number | null;
    requireSubmission?: boolean;
    enablePeerReview?: boolean;
    showGradeToStudent?: boolean;
    showFeedbackToStudent?: boolean;
    notifyOnSubmission?: boolean;
};