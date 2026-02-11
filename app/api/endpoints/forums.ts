// app/api/endpoints/forums.ts
import { AxiosInstance } from "axios";
import apiClient from "../client";

const FORUMS_ENDPOINTS = {
  BASE: '/v1/forums',
  BY_ID: (id: string) => `/v1/forums/${id}`,
  BY_COURSE: (courseId: string) => `/v1/forums/course/${courseId}`,
  CREATE: '/v1/forums/create',
  UPDATE: (id: string) => `/v1/forums/update/${id}`,
  
  // Vistas
  INCREMENT_VIEW: (id: string) => `/v1/forums/${id}/view`,
  
  // Reacciones del foro
  ADD_REACTION: (id: string) => `/v1/forums/${id}/reactions`,
  REMOVE_REACTION: (id: string) => `/v1/forums/${id}/reactions`,
  
  // Comentarios
  ADD_COMMENT: (id: string) => `/v1/forums/${id}/comments`,
  UPDATE_COMMENT: (commentId: string) => `/v1/forums/comments/${commentId}`,
  DELETE_COMMENT: (commentId: string) => `/v1/forums/comments/${commentId}`,
  
  // Reacciones de comentarios
  ADD_COMMENT_REACTION: (commentId: string) => `/v1/forums/comments/${commentId}/reactions`,
  REMOVE_COMMENT_REACTION: (commentId: string) => `/v1/forums/comments/${commentId}/reactions`,
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

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CreateReactionDto {
  type: 'like' | 'not_like' | 'funny' | 'love';
}

export interface CreateCommentReactionDto {
  type: 'like' | 'helpful';
}

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface CommentResponse extends BaseResponse {
  data: ForumComment;
}

export interface ReactionResponse extends BaseResponse {
  data: ForumReaction;
}

export interface CommentReactionResponse extends BaseResponse {
  data: CommentReaction;
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
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.get<ForumGetByIdResponse>(
        FORUMS_ENDPOINTS.BY_ID(forumId)
      );
      return response.data;
    } catch (error) {
      // console.error('Error en getById:', error);
      return {
        "success": false,
        "message": "Error al obtener el foro",
        "data": null as any
      };
    }
  },

  /**
   * Incrementar contador de vistas del foro
   */
  async incrementViewCount(
    forumId: string,
    client?: AxiosInstance
  ): Promise<BaseResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.post<BaseResponse>(
        FORUMS_ENDPOINTS.INCREMENT_VIEW(forumId)
      );
      return response.data;
    } catch (error) {
      console.error('Error al incrementar vistas:', error);
      return {
        success: false,
        message: "Error al incrementar vistas"
      };
    }
  },

  // ==================== REACCIONES DEL FORO ====================

  /**
   * Agregar una reacción al foro
   */
  async addReaction(
    forumId: string,
    data: CreateReactionDto,
    client?: AxiosInstance
  ): Promise<ReactionResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.post<ReactionResponse>(
        FORUMS_ENDPOINTS.ADD_REACTION(forumId),
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error al agregar reacción:', error);
      throw error;
    }
  },

  /**
   * Eliminar la reacción del usuario del foro
   */
  async removeReaction(
    forumId: string,
    client?: AxiosInstance
  ): Promise<BaseResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.delete<BaseResponse>(
        FORUMS_ENDPOINTS.REMOVE_REACTION(forumId)
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar reacción:', error);
      throw error;
    }
  },

  // ==================== COMENTARIOS ====================

  /**
   * Agregar un comentario al foro
   */
  async addComment(
    forumId: string,
    data: CreateCommentDto,
    client?: AxiosInstance
  ): Promise<CommentResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.post<CommentResponse>(
        FORUMS_ENDPOINTS.ADD_COMMENT(forumId),
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error;
    }
  },

  /**
   * Actualizar un comentario existente
   */
  async updateComment(
    commentId: string,
    data: UpdateCommentDto,
    client?: AxiosInstance
  ): Promise<CommentResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.patch<CommentResponse>(
        FORUMS_ENDPOINTS.UPDATE_COMMENT(commentId),
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  },

  /**
   * Eliminar un comentario
   */
  async deleteComment(
    commentId: string,
    client?: AxiosInstance
  ): Promise<BaseResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.delete<BaseResponse>(
        FORUMS_ENDPOINTS.DELETE_COMMENT(commentId)
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  },

  // ==================== REACCIONES DE COMENTARIOS ====================

  /**
   * Agregar una reacción a un comentario
   */
  async addCommentReaction(
    commentId: string,
    data: CreateCommentReactionDto,
    client?: AxiosInstance
  ): Promise<CommentReactionResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.post<CommentReactionResponse>(
        FORUMS_ENDPOINTS.ADD_COMMENT_REACTION(commentId),
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error al agregar reacción al comentario:', error);
      throw error;
    }
  },

  /**
   * Eliminar la reacción del usuario de un comentario
   */
  async removeCommentReaction(
    commentId: string,
    client?: AxiosInstance
  ): Promise<BaseResponse> {
    try {
      const apiClientToUse = client || apiClient;
      const response = await apiClientToUse.delete<BaseResponse>(
        FORUMS_ENDPOINTS.REMOVE_COMMENT_REACTION(commentId)
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar reacción del comentario:', error);
      throw error;
    }
  },
};