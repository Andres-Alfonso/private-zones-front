// app/api/endpoints/auth.ts
import { createApiClient } from "../client";
import apiClient from '../client';
import { API_CONFIG } from '../config';
import { LoginRequest, LoginResponse, RegisterRequest, UserProfileResponse } from '../types/auth.types';


function getCurrentDomain(): string {
    if (typeof window === 'undefined') {
        return 'localhost'; // Para SSR
    }

    const hostname = window.location.hostname;

    // En desarrollo, manejar casos como cardio.klmsystem.test
    if (hostname.includes('.test') || hostname.includes('.local')) {
        return hostname;
    }

    // En producción, usar el hostname completo
    return hostname;
}

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

  // Nuevo método para obtener datos actualizados del usuario
  async getCurrentUser(accessToken: string) {

    const apiClient = createApiClient(getCurrentDomain());

    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error getting current user');
    }

    return response.json();
  },
};