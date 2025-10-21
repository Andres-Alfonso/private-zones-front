// app/api/endpoints/forums.ts
import { AxiosInstance } from "axios";
import apiClient from "../client";

const FORUMS_ENDPOINTS = {
  BASE: '/v1/forums',
  BY_ID: (id: string) => `/v1/forums/${id}`,
  BY_COURSE: (courseId: string) => `/v1/forums/course/${courseId}`,
  CREATE: '/v1/forums/create',
  UPDATE: (id: string) => `/v1/forums/update/${id}`,
};

// ==================== INTERFACES ====================

export interface CreateForumDto {
  title: string;
  description?: string;
  thumbnail?: string;
  expirationDate?: Date | string;
  isActive?: boolean;
  isPinned?: boolean;
  category?: string;
  tags?: string[];
  viewCount?: number;
}

export interface ForumAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ForumComment {
  id: string;
  content: string;
  isEdited: boolean;
  authorId: string;
  author?: ForumAuthor;
  parentCommentId?: string;
  replies?: ForumComment[];
  reactions?: CommentReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface ForumReaction {
  id: string;
  type: 'like' | 'not_like' | 'funny' | 'love';
  userId: string;
  forumId: string;
  createdAt: string;
}

export interface CommentReaction {
  id: string;
  type: 'like' | 'helpful';
  userId: string;
  commentId: string;
  createdAt: string;
}

export interface Forum {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  expirationDate: Date | null;
  isActive: boolean;
  isPinned: boolean;
  category: string | null;
  tags: string[];
  viewCount: number;
  authorId: string;
  tenantId: string;
  author?: ForumAuthor;
  comments?: ForumComment[];
  reactions?: ForumReaction[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetAllForumsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ForumCreateResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description?: string;
    tenantId: string;
    authorId: string;
    createdAt: string;
  };
}

export interface ForumUpdateResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description?: string;
    tenantId: string;
    updatedAt: string;
  };
}

export interface ForumGetAllResponse {
  success: boolean;
  message: string;
  data: Forum[];
  pagination: PaginationMeta;
  stats: {
    totalForums: number;
    totalThreads: number;
    totalPosts: number;
    activeUsers: number;
  }
}

export interface ForumGetByIdResponse {
  success: boolean;
  message: string;
  data: Forum;
}

// ==================== API METHODS ====================

export const ForumsAPI = {
  /**
   * Crear un nuevo foro
   */
  async create(
    data: CreateForumDto,
    client?: AxiosInstance
  ): Promise<ForumCreateResponse> {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.post<ForumCreateResponse>(
      FORUMS_ENDPOINTS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Actualizar un foro existente
   */
  async update(
    forumId: string,
    data: Partial<CreateForumDto>,
    client?: AxiosInstance
  ): Promise<ForumUpdateResponse> {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.post<ForumUpdateResponse>(
      FORUMS_ENDPOINTS.UPDATE(forumId),
      data
    );
    return response.data;
  },

  /**
   * Obtener todos los foros de un curso con paginación
   */
  async getAllContents(
    courseId: string,
    options?: GetAllForumsOptions,
    client?: AxiosInstance
  ): Promise<ForumGetAllResponse> {
    const apiClientToUse = client || apiClient;

    const params = new URLSearchParams();

    if (options?.search) {
      params.append("search", options.search);
    }

    if (options?.page) {
      params.append("page", options.page.toString());
    }

    if (options?.limit) {
      params.append("limit", options.limit.toString());
    }

    const url = `${FORUMS_ENDPOINTS.BY_COURSE(courseId)}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await apiClientToUse.get<ForumGetAllResponse>(url);
    return response.data;
  },

  /**
   * Obtener un foro por su ID
   */
  async getById(
    forumId: string,
    client?: AxiosInstance
  ): Promise<ForumGetByIdResponse> {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.get<ForumGetByIdResponse>(
      FORUMS_ENDPOINTS.BY_ID(forumId)
    );
    return response.data;
  },
};