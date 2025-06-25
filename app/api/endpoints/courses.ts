// app/api/endpoints/courses.ts

import apiClient from '../client';
import { API_CONFIG } from '../config';
import { 
  Course, 
  CreateCourseRequest, 
  UpdateCourseRequest, 
  CourseListResponse,
  CourseFilters 
} from '../types/course.types';

// Primero actualiza tu API_CONFIG para incluir los endpoints de courses
const COURSES_ENDPOINTS = {
  BASE: '/v1/courses',
  BY_ID: (id: string) => `/v1/courses/${id}`,
  CATEGORIES: '/v1/courses/categories',
  INSTRUCTORS: '/v1/courses/instructors',
};

export const CoursesAPI = {
  // Obtener todos los cursos con filtros
  getAll: async (filters?: CourseFilters): Promise<CourseListResponse> => {
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
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener curso por ID
  getById: async (id: string): Promise<Course> => {
    const response = await apiClient.get(COURSES_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  // Crear nuevo curso
  create: async (courseData: CreateCourseRequest): Promise<Course> => {
    const response = await apiClient.post(COURSES_ENDPOINTS.BASE, courseData);
    return response.data;
  },

  // Actualizar curso
  update: async (id: string, courseData: UpdateCourseRequest): Promise<Course> => {
    const response = await apiClient.put(COURSES_ENDPOINTS.BY_ID(id), courseData);
    return response.data;
  },

  // Eliminar curso
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(COURSES_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  // Activar/Desactivar curso
  toggleActive: async (id: string): Promise<Course> => {
    const response = await apiClient.patch(`${COURSES_ENDPOINTS.BY_ID(id)}/toggle-active`);
    return response.data;
  },

  // Obtener categorías disponibles
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get(COURSES_ENDPOINTS.CATEGORIES);
    return response.data;
  },

  // Obtener instructores disponibles
  getInstructors: async (): Promise<Array<{ id: string; name: string; email: string }>> => {
    const response = await apiClient.get(COURSES_ENDPOINTS.INSTRUCTORS);
    return response.data;
  },

  // Inscribir estudiante en curso
  enrollStudent: async (courseId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`${COURSES_ENDPOINTS.BY_ID(courseId)}/enroll`);
    return response.data;
  },

  // Desinscribir estudiante de curso
  unenrollStudent: async (courseId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`${COURSES_ENDPOINTS.BY_ID(courseId)}/enroll`);
    return response.data;
  }
};