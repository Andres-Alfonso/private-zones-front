// app/api/types/course.types.ts

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // en horas
  level: CourseLevel;
  category: string;
  price: number;
  thumbnail?: string;
  isActive: boolean;
  maxStudents: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  instructor: string;
  duration: number;
  level: CourseLevel;
  category: string;
  price: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  thumbnail?: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  isActive?: boolean;
}

export interface CourseListResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface CourseFilters {
  category?: string;
  level?: CourseLevel;
  instructor?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Validación
export interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: CourseLevel;
  category: string;
  price: string;
  maxStudents: string;
  startDate: string;
  endDate: string;
}

export interface CourseValidationError {
  field: keyof CourseFormData;
  message: string;
}