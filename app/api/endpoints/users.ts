// app/api/endpoints/users.ts

import apiClient from '../client';
import { API_CONFIG } from '../config';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserListResponse,
  UserFilters,
  UserStats,
  UserActivity,
  UserSession
} from '../types/user.types';

const USERS_ENDPOINTS = {
  BASE: '/v1/users',
  BY_ID: (id: string) => `/v1/users/${id}`,
  PROFILE: (id: string) => `/v1/users/${id}/profile`,
  CHANGE_PASSWORD: (id: string) => `/v1/users/${id}/change-password`,
  RESET_PASSWORD: (id: string) => `/v1/users/${id}/reset-password`,
  TOGGLE_ACTIVE: (id: string) => `/v1/users/${id}/toggle-active`,
  ASSIGN_ROLES: (id: string) => `/v1/users/${id}/roles`,
  ACTIVITIES: (id: string) => `/v1/users/${id}/activities`,
  SESSIONS: (id: string) => `/v1/users/${id}/sessions`,
  BULK_ACTIONS: '/v1/users/bulk',
  EXPORT: '/v1/users/export',
  STATS: '/v1/users/stats',
  ROLES: '/v1/users/roles',
  TENANTS: '/v1/users/tenants',
  VERIFY_EMAIL: (id: string) => `/v1/users/${id}/verify-email`,
  RESEND_VERIFICATION: (id: string) => `/v1/users/${id}/resend-verification`,
};

export const UsersAPI = {
  // Obtener todos los usuarios con filtros
  getAll: async (filters?: UserFilters): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = `${USERS_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.get(USERS_ENDPOINTS.STATS);
    return response.data;
  },

  // Obtener roles disponibles
  getRoles: async (): Promise<Array<{ id: string; name: string; description: string }>> => {
    const response = await apiClient.get(USERS_ENDPOINTS.ROLES);
    return response.data;
  },

  // Obtener tenants disponibles
  getTenants: async (): Promise<Array<{ id: string; name: string }>> => {
    const response = await apiClient.get(USERS_ENDPOINTS.TENANTS);
    return response.data;
  },

  // Obtener usuario por ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(USERS_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  // Crear nuevo usuario
  create: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post(USERS_ENDPOINTS.BASE, userData);
    return response.data;
  },

  // Actualizar usuario
  update: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put(USERS_ENDPOINTS.BY_ID(id), userData);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(USERS_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  // Activar/Desactivar usuario
  toggleActive: async (id: string): Promise<User> => {
    const response = await apiClient.patch(USERS_ENDPOINTS.TOGGLE_ACTIVE(id));
    return response.data;
  },

  // Cambiar contraseña (por admin)
  changePassword: async (id: string, newPassword: string, forceChange?: boolean): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(USERS_ENDPOINTS.CHANGE_PASSWORD(id), {
      password: newPassword,
      forceChange
    });
    return response.data;
  },

  // Resetear contraseña
  resetPassword: async (id: string): Promise<{ success: boolean; temporaryPassword: string }> => {
    const response = await apiClient.post(USERS_ENDPOINTS.RESET_PASSWORD(id));
    return response.data;
  },

  // Asignar roles
  assignRoles: async (id: string, roles: string[]): Promise<User> => {
    const response = await apiClient.put(USERS_ENDPOINTS.ASSIGN_ROLES(id), { roles });
    return response.data;
  },

  // Verificar email
  verifyEmail: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(USERS_ENDPOINTS.VERIFY_EMAIL(id));
    return response.data;
  },

  // Reenviar verificación de email
  resendVerification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(USERS_ENDPOINTS.RESEND_VERIFICATION(id));
    return response.data;
  },

  // Obtener actividades del usuario
  getActivities: async (id: string, page?: number, limit?: number): Promise<{ data: UserActivity[], total: number }> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const url = `${USERS_ENDPOINTS.ACTIVITIES(id)}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener sesiones del usuario
  getSessions: async (id: string): Promise<UserSession[]> => {
    const response = await apiClient.get(USERS_ENDPOINTS.SESSIONS(id));
    return response.data;
  },

  // Cerrar sesión específica
  closeSession: async (userId: string, sessionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${USERS_ENDPOINTS.SESSIONS(userId)}/${sessionId}`);
    return response.data;
  },

  // Cerrar todas las sesiones
  closeAllSessions: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${USERS_ENDPOINTS.SESSIONS(id)}/all`);
    return response.data;
  },

  // Acciones masivas
  bulkActions: async (action: 'delete' | 'activate' | 'deactivate' | 'assign-role', userIds: string[], data?: any): Promise<{ success: boolean; message: string; processed: number }> => {
    const response = await apiClient.post(USERS_ENDPOINTS.BULK_ACTIONS, {
      action,
      userIds,
      data
    });
    return response.data;
  },

  // Exportar usuarios
  exportUsers: async (filters?: UserFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    params.append('format', format);
    
    const response = await apiClient.get(`${USERS_ENDPOINTS.EXPORT}?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Actualizar perfil del usuario
  updateProfile: async (id: string, profileData: Partial<User['profile']>): Promise<User> => {
    const response = await apiClient.put(USERS_ENDPOINTS.PROFILE(id), profileData);
    return response.data;
  },

  // Subir avatar
  uploadAvatar: async (id: string, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post(`${USERS_ENDPOINTS.BY_ID(id)}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Eliminar avatar
  deleteAvatar: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${USERS_ENDPOINTS.BY_ID(id)}/avatar`);
    return response.data;
  },

  // Búsqueda avanzada de usuarios
  search: async (query: string, filters?: Partial<UserFilters>): Promise<User[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiClient.get(`${USERS_ENDPOINTS.BASE}/search?${params.toString()}`);
    return response.data;
  },

  // Validar email único
  validateEmail: async (email: string, excludeUserId?: string): Promise<{ isAvailable: boolean }> => {
    const params = new URLSearchParams();
    params.append('email', email);
    if (excludeUserId) params.append('exclude', excludeUserId);
    
    const response = await apiClient.get(`${USERS_ENDPOINTS.BASE}/validate-email?${params.toString()}`);
    return response.data;
  },

  // Obtener usuarios por rol
  getByRole: async (role: string): Promise<User[]> => {
    const response = await apiClient.get(`${USERS_ENDPOINTS.BASE}/by-role/${role}`);
    return response.data;
  },

  // Obtener usuarios por departamento
  getByDepartment: async (department: string): Promise<User[]> => {
    const response = await apiClient.get(`${USERS_ENDPOINTS.BASE}/by-department/${encodeURIComponent(department)}`);
    return response.data;
  },
};