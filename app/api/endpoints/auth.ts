// app/api/endpoints/auth.ts
import apiClient from '../client';
import { API_CONFIG } from '../config';
import { LoginRequest, LoginResponse, RegisterRequest, UserProfileResponse } from '../types/auth.types';

export const AuthAPI = {
  // Iniciar sesión
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN, 
      credentials
    );
    return response.data;
  },

  // Registrar usuario
  register: async (userData: RegisterRequest): Promise<{ msg: string }> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER, 
      userData
    );
    return response.data;
  },
  
  // Cerrar sesión
  logout: async (refreshToken: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGOUT, 
      { refreshToken }
    );
    return response.data;
  },
  
  // Refrescar token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH, 
      { refreshToken }
    );
    return response.data;
  },

  // Cerrar todas las sesiones
  logoutAll: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT_ALL);
    return response.data;
  },

  // Obtener perfil del usuario
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
    return response.data;
  },
};