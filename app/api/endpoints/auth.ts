import apiClient from '../client';
import { API_CONFIG } from '../config';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth.types';

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
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER, 
      userData
    );
    return response.data;
  },
  
  // Cerrar sesión
  logout: async (): Promise<void> => {
    await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  },
  
  // Refrescar token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH, 
      { refreshToken }
    );
    return response.data;
  },
};