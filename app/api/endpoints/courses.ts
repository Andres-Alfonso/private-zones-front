// app/api/endpoints/courses.ts

import { AxiosInstance } from 'axios';
import apiClient from '../client';
import { API_CONFIG } from '../config';
import { 
  Course, 
  CreateCourseRequest, 
  UpdateCourseRequest, 
  CourseListResponse,
  CourseFilters, 
  CourseBasic,
  CourseLayoutData,
  CourseUserProgress
} from '../types/course.types';

// Primero actualiza tu API_CONFIG para incluir los endpoints de courses
const COURSES_ENDPOINTS = {
  BASE: '/v1/courses',
  BY_ID: (id: string) => `/v1/courses/${id}`,
  BY_TENANT: '/v1/courses/tenant',
  CATEGORIES: '/v1/courses/categories',
  INSTRUCTORS: '/v1/courses/instructors',
  PROGRESS_USER: (id: string) => `/v1/courses/${id}/progress`,
};

export const CoursesAPI = {
  // Método para obtener cursos de un tenant
  async getByTenant(client?: AxiosInstance): Promise<CourseBasic[] | { error: string }> {
    try {
      const apiClientToUse = client || apiClient;
      const params = new URLSearchParams();
      const queryString = params.toString();

      const url = `${COURSES_ENDPOINTS.BY_TENANT}`;
    
      const response = await apiClientToUse.get(url);

      return await response.data;
    } catch (error) {
      console.error('Error al obtener cursos del tenant:', error);
      return { error: 'Error de conexión' };
    }
  },

  // Obtener todos los cursos con filtros
  getAll: async (filters?: CourseFilters, client?: AxiosInstance): Promise<CourseListResponse> => {
    const apiClientToUse = client || apiClient;
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = `${COURSES_ENDPOINTS.BASE}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClientToUse.get(url);
    return response.data;
  },

  // Obtener curso por ID
  getById: async (id: string, client?: AxiosInstance): Promise<CourseLayoutData> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.get(COURSES_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  getUserProgress: async (id: string, client?: AxiosInstance): Promise<CourseUserProgress> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.get(COURSES_ENDPOINTS.PROGRESS_USER(id));
    return response.data;
  },

  // Crear nuevo curso
  create: async (courseData: CreateCourseRequest, client?: AxiosInstance): Promise<Course> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.post(COURSES_ENDPOINTS.BASE, courseData);
    return response.data;
  },

  // Actualizar curso
  update: async (id: string, courseData: UpdateCourseRequest, client?: AxiosInstance): Promise<Course> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.put(COURSES_ENDPOINTS.BY_ID(id), courseData);
    return response.data;
  },

  // Eliminar curso
  delete: async (id: string, client?: AxiosInstance): Promise<{ success: boolean; message: string }> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.delete(COURSES_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  // Activar/Desactivar curso
  toggleActive: async (id: string, client?: AxiosInstance): Promise<Course> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.patch(`${COURSES_ENDPOINTS.BY_ID(id)}/toggle-active`);
    return response.data;
  },

  // Obtener categorías disponibles
  getCategories: async (client?: AxiosInstance): Promise<string[]> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.get(COURSES_ENDPOINTS.CATEGORIES);
    return response.data;
  },

  // Obtener instructores disponibles
  getInstructors: async (client?: AxiosInstance): Promise<Array<{ id: string; name: string; email: string }>> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.get(COURSES_ENDPOINTS.INSTRUCTORS);
    return response.data;
  },

  // Inscribir estudiante en curso
  enrollStudent: async (courseId: string, client?: AxiosInstance): Promise<{ success: boolean; message: string }> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.post(`${COURSES_ENDPOINTS.BY_ID(courseId)}/enroll`);
    return response.data;
  },

  // Desinscribir estudiante de curso
  unenrollStudent: async (courseId: string, client?: AxiosInstance): Promise<{ success: boolean; message: string }> => {
    const apiClientToUse = client || apiClient;
    const response = await apiClientToUse.delete(`${COURSES_ENDPOINTS.BY_ID(courseId)}/enroll`);
    return response.data;
  }
};