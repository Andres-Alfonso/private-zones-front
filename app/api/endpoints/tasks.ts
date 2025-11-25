// app/api/endpoints/tasks.ts

import { AxiosInstance } from "axios";
import apiClient from "../client";

const TASKS_ENDPOINTS = {
    BASE: '/v1/tasks',
    BY_ID: (id: string) => `/v1/tasks/${id}`,
    BY_COURSE: (courseId: string) => `/v1/tasks/course/${courseId}`,
    CREATE: '/v1/tasks/create',
    UPDATE: (id: string) => `/v1/tasks/${id}`,
    DELETE: (id: string) => `/v1/tasks/${id}`,
    
    // Submissions
    SUBMISSIONS: (taskId: string) => `/v1/tasks/${taskId}/submissions`,
    SUBMISSION_BY_ID: (taskId: string, submissionId: string) => `/v1/tasks/${taskId}/submissions/${submissionId}`,
    MY_SUBMISSION: (taskId: string) => `/v1/tasks/${taskId}/my-submission`,
    SUBMIT: (taskId: string) => `/v1/tasks/${taskId}/submit`,
    GRADE_SUBMISSION: (taskId: string, submissionId: string) => `/v1/tasks/${taskId}/submissions/${submissionId}/grade`,
    
    // Attachments
    ATTACHMENTS: (taskId: string) => `/v1/tasks/${taskId}/attachments`,
    ATTACHMENT_BY_ID: (taskId: string, attachmentId: string) => `/v1/tasks/${taskId}/attachments/${attachmentId}`,
    UPLOAD_ATTACHMENT: (taskId: string) => `/v1/tasks/${taskId}/attachments/upload`,
    
    // Submission Files
    UPLOAD_SUBMISSION_FILE: (taskId: string, submissionId: string) => `/v1/tasks/${taskId}/submissions/${submissionId}/files`,
    DELETE_SUBMISSION_FILE: (taskId: string, submissionId: string, fileId: string) => `/v1/tasks/${taskId}/submissions/${submissionId}/files/${fileId}`,
};

// ========== Enums ==========
export enum TaskStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    CLOSED = 'closed',
    ARCHIVED = 'archived'
}

export enum SubmissionStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    LATE = 'late',
    GRADED = 'graded',
    RETURNED = 'returned',
    RESUBMITTED = 'resubmitted'
}

// ========== Interfaces ==========
export interface GetTaskOptions {
    includeCourse?: boolean;
    includeModule?: boolean;
    includeNavigation?: boolean;
    includeConfiguration?: boolean;
    includeSubmissions?: boolean;
    includeAttachments?: boolean;
    includeMySubmission?: boolean;
}

export interface GetAllTasksOptions {
    courseId?: string;
    search?: string;
    status?: TaskStatus;
    page?: number;
    limit?: number;
    includeConfiguration?: boolean;
    includeStats?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TaskGetAllResponse {
  success: boolean;
  message: string;
  data: TaskResponse[];
  pagination: PaginationMeta;
  stats: {
    totalTasks: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    activeUsers: number;
  }
}

export interface TaskConfigResponse {
    id: string;
    taskId: string;
    isActive: boolean;
    enableSupportResources: boolean;
    showResourcesBeforeSubmission: boolean;
    enableSelfAssessment: boolean;
    requireSelfAssessmentBeforeSubmit: boolean;
    enableFileUpload: boolean;
    requireFileUpload: boolean;
    enableTextSubmission: boolean;
    requireTextSubmission: boolean;
    showToStudentsBeforeStart: boolean;
    sendReminderBeforeDue: boolean;
    reminderHoursBeforeDue: number;
    notifyOnGrade: boolean;
    autoGrade: boolean;
    requireGradeComment: boolean;
    enableGradeRubric: boolean;
    rubricData: Record<string, any>;
    showOtherSubmissions: boolean;
    anonymizeSubmissions: boolean;
    enableGroupSubmission: boolean;
    maxGroupSize: number;
    enableVersionControl: boolean;
    lockAfterGrade: boolean;
    metadata: Record<string, any>;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface TaskSubmissionFileResponse {
    id: string;
    submissionId: string;
    fileName: string;
    originalFileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    fileExtension: string;
    order: number;
    metadata: Record<string, any>;
    uploadedAt: Date | string;
}

export interface TaskSubmissionResponse {
    id: string;
    taskId: string;
    userId: string;
    status: SubmissionStatus;
    attemptNumber: number;
    textSubmission: string;
    comments: string;
    submittedAt: Date | string;
    grade: number;
    feedback: string;
    gradedBy: string;
    gradedAt: Date | string;
    isLate: boolean;
    penaltyApplied: number;
    metadata: Record<string, any>;
    createdAt: Date | string;
    updatedAt: Date | string;
    // Relaciones opcionales
    user?: any;
    grader?: any;
    files?: TaskSubmissionFileResponse[];
}

export interface TaskAttachmentResponse {
    id: string;
    taskId: string;
    fileName: string;
    originalFileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    fileExtension: string;
    description: string;
    order: number;
    metadata: Record<string, any>;
    uploadedAt: Date | string;
}

export interface TaskResponse {
    id: string;
    tenantId: string;
    courseId: string;
    createdBy: string;
    title: string;
    description: string;
    instructions: string;
    status: TaskStatus;
    startDate: Date | string;
    endDate: Date | string;
    lateSubmissionDate: Date | string;
    maxPoints: number;
    lateSubmissionPenalty: number;
    maxFileUploads: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    allowMultipleSubmissions: boolean;
    maxSubmissionAttempts: number | null;
    requireSubmission: boolean;
    enablePeerReview: boolean;
    thumbnailImagePath: string;
    order: number;
    showGradeToStudent: boolean;
    showFeedbackToStudent: boolean;
    notifyOnSubmission: boolean;
    metadata: Record<string, any>;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string;
    // Relaciones opcionales
    course?: any;
    creator?: any;
    configuration?: TaskConfigResponse;
    submissions?: TaskSubmissionResponse[];
    attachments?: TaskAttachmentResponse[];
    mySubmission?: TaskSubmissionResponse;
    // Stats opcionales
    submissionCount?: number;
    gradedCount?: number;
    averageGrade?: number;
}

export interface CreateTaskDto {
    courseId: string;
    title: string;
    description?: string;
    instructions?: string;
    status?: TaskStatus;
    startDate?: Date | string;
    endDate?: Date | string;
    lateSubmissionDate?: Date | string;
    maxPoints?: number;
    lateSubmissionPenalty?: number;
    maxFileUploads?: number;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    allowMultipleSubmissions?: boolean;
    maxSubmissionAttempts?: number | null;
    requireSubmission?: boolean;
    enablePeerReview?: boolean;
    thumbnailImagePath?: string;
    order?: number;
    showGradeToStudent?: boolean;
    showFeedbackToStudent?: boolean;
    notifyOnSubmission?: boolean;
    metadata?: Record<string, any>;
    configuration?: Partial<TaskConfigResponse>;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
    id: string;
}

export interface SubmitTaskDto {
    textSubmission?: string;
    comments?: string;
    attemptNumber?: number;
}

export interface GradeSubmissionDto {
    grade: number;
    feedback?: string;
    penaltyApplied?: number;
    status?: SubmissionStatus;
}

export interface UploadAttachmentDto {
    file: File;
    description?: string;
    order?: number;
}

// ========== API Functions ==========
export const TaskAPI = {
    // ========== Tasks CRUD ==========
    async getById(
        taskId: string,
        options?: GetTaskOptions,
        client?: AxiosInstance
    ): Promise<TaskResponse> {
        const apiClientToUse = client || apiClient;
        const params = new URLSearchParams();

        if (options) {
            if (options.includeCourse) params.append("includeCourse", "true");
            if (options.includeModule) params.append("includeModule", "true");
            if (options.includeNavigation) params.append("includeNavigation", "true");
            if (options.includeConfiguration) params.append("includeConfiguration", "true");
            if (options.includeSubmissions) params.append("includeSubmissions", "true");
            if (options.includeAttachments) params.append("includeAttachments", "true");
            if (options.includeMySubmission) params.append("includeMySubmission", "true");
        }

        const url = `${TASKS_ENDPOINTS.BY_ID(taskId)}${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await apiClientToUse.get<TaskResponse>(url);
        return response.data;
    },

    async getAll(
        courseId?: string,
        options?: GetAllTasksOptions,
        client?: AxiosInstance
    ): Promise<TaskGetAllResponse> {
        const apiClientToUse = client || apiClient;
        const params = new URLSearchParams();

        if (options) {
            if (options.courseId) params.append("courseId", courseId ?? '');
            if (options.search) params.append("search", options.search);
            if (options.status) params.append("status", options.status);
            if (options.page) params.append("page", options.page.toString());
            if (options.limit) params.append("limit", options.limit.toString());
            if (options.includeConfiguration) params.append("includeConfiguration", "true");
            if (options.includeStats) params.append("includeStats", "true");
        }

        const url = courseId
            ? `${TASKS_ENDPOINTS.BY_COURSE(courseId)}${params.toString() ? `?${params.toString()}` : ""}`
            : `${TASKS_ENDPOINTS.BASE}${params.toString() ? `?${params.toString()}` : ""}`;

        const response = await apiClientToUse.get(url);

        return response.data;
    },
    async create(
        data: CreateTaskDto,
        client?: AxiosInstance
    ): Promise<TaskResponse> {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.post<TaskResponse>(
            TASKS_ENDPOINTS.CREATE,
            data
        );
        return response.data;
    },

    async update(
        taskId: string,
        data: Partial<UpdateTaskDto>,
        client?: AxiosInstance
    ): Promise<TaskResponse> {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.patch<TaskResponse>(
            TASKS_ENDPOINTS.UPDATE(taskId),
            data
        );
        return response.data;
    },

    async delete(
        taskId: string,
        client?: AxiosInstance
    ): Promise<void> {
        const apiClientToUse = client || apiClient;
        await apiClientToUse.delete(TASKS_ENDPOINTS.DELETE(taskId));
    },

    // ========== Submissions ==========
    async getSubmissions(
        taskId: string,
        options?: {
            status?: SubmissionStatus;
            userId?: string;
            includeFiles?: boolean;
            includeUser?: boolean;
        },
        client?: AxiosInstance
    ): Promise<TaskSubmissionResponse[]> {
        const apiClientToUse = client || apiClient;
        const params = new URLSearchParams();

        if (options) {
            if (options.status) params.append("status", options.status);
            if (options.userId) params.append("userId", options.userId);
            if (options.includeFiles) params.append("includeFiles", "true");
            if (options.includeUser) params.append("includeUser", "true");
        }

        const url = `${TASKS_ENDPOINTS.SUBMISSIONS(taskId)}${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await apiClientToUse.get<TaskSubmissionResponse[]>(url);
        return response.data;
    },

    async getMySubmission(
        taskId: string,
        options?: {
            includeFiles?: boolean;
        },
        client?: AxiosInstance
    ): Promise<TaskSubmissionResponse | null> {
        const apiClientToUse = client || apiClient;
        const params = new URLSearchParams();

        if (options?.includeFiles) {
            params.append("includeFiles", "true");
        }

        const url = `${TASKS_ENDPOINTS.MY_SUBMISSION(taskId)}${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await apiClientToUse.get<TaskSubmissionResponse | null>(url);
        return response.data;
    },

    async getSubmissionById(
        taskId: string,
        submissionId: string,
        options?: {
            includeFiles?: boolean;
            includeUser?: boolean;
        },
        client?: AxiosInstance
    ): Promise<TaskSubmissionResponse> {
        const apiClientToUse = client || apiClient;
        const params = new URLSearchParams();

        if (options) {
            if (options.includeFiles) params.append("includeFiles", "true");
            if (options.includeUser) params.append("includeUser", "true");
        }

        const url = `${TASKS_ENDPOINTS.SUBMISSION_BY_ID(taskId, submissionId)}${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await apiClientToUse.get<TaskSubmissionResponse>(url);
        return response.data;
    },

    async submitTask(
        taskId: string,
        data: SubmitTaskDto,
        client?: AxiosInstance
    ): Promise<TaskSubmissionResponse> {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.post<TaskSubmissionResponse>(
            TASKS_ENDPOINTS.SUBMIT(taskId),
            data
        );
        return response.data;
    },

    async updateSubmission(
        taskId: string,
        submissionId: string,
        data: Partial<SubmitTaskDto>,
        client?: AxiosInstance
    ): Promise<TaskSubmissionResponse> {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.patch<TaskSubmissionResponse>(
            TASKS_ENDPOINTS.SUBMISSION_BY_ID(taskId, submissionId),
            data
        );
        return response.data;
    },

    async gradeSubmission(
        taskId: string,
        submissionId: string,
        data: GradeSubmissionDto,
        client?: AxiosInstance
    ): Promise<TaskSubmissionResponse> {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.post<TaskSubmissionResponse>(
            TASKS_ENDPOINTS.GRADE_SUBMISSION(taskId, submissionId),
            data
        );
        return response.data;
    },

    // ========== Submission Files ==========
    async uploadSubmissionFile(
        taskId: string,
        submissionId: string,
        file: File,
        client?: AxiosInstance
    ): Promise<TaskSubmissionFileResponse> {
        const apiClientToUse = client || apiClient;
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClientToUse.post<TaskSubmissionFileResponse>(
            TASKS_ENDPOINTS.UPLOAD_SUBMISSION_FILE(taskId, submissionId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    async deleteSubmissionFile(
        taskId: string,
        submissionId: string,
        fileId: string,
        client?: AxiosInstance
    ): Promise<void> {
        const apiClientToUse = client || apiClient;
        await apiClientToUse.delete(
            TASKS_ENDPOINTS.DELETE_SUBMISSION_FILE(taskId, submissionId, fileId)
        );
    },

    // ========== Task Attachments ==========
    async getAttachments(
        taskId: string,
        client?: AxiosInstance
    ): Promise<TaskAttachmentResponse[]> {
        const apiClientToUse = client || apiClient;
        const response = await apiClientToUse.get<TaskAttachmentResponse[]>(
            TASKS_ENDPOINTS.ATTACHMENTS(taskId)
        );
        return response.data;
    },

    async uploadAttachment(
        taskId: string,
        file: File,
        description?: string,
        order?: number,
        client?: AxiosInstance
    ): Promise<TaskAttachmentResponse> {
        const apiClientToUse = client || apiClient;
        const formData = new FormData();
        formData.append('file', file);
        if (description) formData.append('description', description);
        if (order !== undefined) formData.append('order', order.toString());

        const response = await apiClientToUse.post<TaskAttachmentResponse>(
            TASKS_ENDPOINTS.UPLOAD_ATTACHMENT(taskId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    async deleteAttachment(
        taskId: string,
        attachmentId: string,
        client?: AxiosInstance
    ): Promise<void> {
        const apiClientToUse = client || apiClient;
        await apiClientToUse.delete(
            TASKS_ENDPOINTS.ATTACHMENT_BY_ID(taskId, attachmentId)
        );
    },

    // ========== Utility Methods ==========
    async updateTaskStatus(
        taskId: string,
        status: TaskStatus,
        client?: AxiosInstance
    ): Promise<TaskResponse> {
        return this.update(taskId, { status }, client);
    },

    async publishTask(
        taskId: string,
        client?: AxiosInstance
    ): Promise<TaskResponse> {
        return this.updateTaskStatus(taskId, TaskStatus.PUBLISHED, client);
    },

    async closeTask(
        taskId: string,
        client?: AxiosInstance
    ): Promise<TaskResponse> {
        return this.updateTaskStatus(taskId, TaskStatus.CLOSED, client);
    },

    async archiveTask(
        taskId: string,
        client?: AxiosInstance
    ): Promise<TaskResponse> {
        return this.updateTaskStatus(taskId, TaskStatus.ARCHIVED, client);
    },
};

export default TaskAPI;