// app/api/types/course.types.ts

export interface Course {
  id: string;
  slug: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  configuration: CourseConfiguration;
  translations: CourseTranslation[];
  viewsConfig: CourseViewConfig[];
}

export interface CourseConfiguration {
  id: string;
  courseId: string;
  visibility: CourseVisibility;
  isActive: boolean;
  isPublicGroup: boolean;
  status: CourseStatus;
  
  // Imágenes
  coverImage?: string;
  menuImage?: string;
  thumbnailImage?: string;
  colorTitle: string;
  
  // Información académica
  acronym?: string;
  code?: string;
  category?: string;
  subcategory?: string;
  intensity: number;
  estimatedHours?: number;
  
  // Fechas
  startDate?: Date;
  endDate?: Date;
  enrollmentStartDate?: Date;
  enrollmentEndDate?: Date;
  
  // Inscripciones
  maxEnrollments?: number;
  requiresApproval: boolean;
  allowSelfEnrollment: boolean;
  invitationLink?: string;
  
  // Configuración
  order: number;
  metadata: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

export interface CourseTranslation {
  id: string;
  courseId: string;
  languageCode: string;
  title: string;
  description?: string;
  metadata: {
    tags?: string[];
    keywords?: string[];
    customFields?: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseViewConfig {
  id: string;
  courseId: string;
  viewType: CourseViewType;
  
  // Configuración de fondo
  backgroundType: BackgroundType;
  backgroundColor?: string;
  backgroundImagePath?: string;
  
  // Títulos personalizados
  customTitleEs?: string;
  customTitleEn?: string;
  titleColor?: string;
  
  // Configuración de covers
  coverTypeHeader?: CoverType;
  coverImageHeader?: string;
  coverVideoHeader?: string;
  coverTitleHeader?: string;
  coverDescriptionHeader?: string;
  
  coverTypeFooter?: CoverType;
  coverImageFooter?: string;
  coverVideoFooter?: string;
  coverTitleFooter?: string;
  coverDescriptionFooter?: string;
  
  // Configuración
  isActive: boolean;
  layoutConfig: {
    allowCoverHeader?: boolean;
    allowCoverFooter?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    customCSS?: string;
    additionalSettings?: Record<string, any>;
  };
  
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Utility types
export type CourseListItem = Pick<Course, 'id' | 'slug' | 'isActive' | 'createdAt'> & {
  title: string;
  description?: string;
  instructor?: string;
  category?: string;
  level?: CourseLevel;
  coverImage?: string;
  estimatedHours?: number;
  status: CourseStatus;
  visibility: CourseVisibility;
  enrollmentCount?: number;
  maxEnrollments?: number;
};

export type CourseFormStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface CourseFormStepConfig {
  id: CourseFormStep;
  name: string;
  icon: any; // LucideIcon
  isValid?: boolean;
  isCompleted?: boolean;
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
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

// Interfaces para formularios
export interface CourseFormData {
  // Información básica
  title: string;
  description: string;
  instructor: string;
  category: string;
  subcategory?: string;
  level: CourseLevel;

  // Información académica
  acronym?: string;
  code?: string;
  intensity: number;
  estimatedHours?: number;

  // Configuración
  visibility: CourseVisibility;
  status: CourseStatus;
  colorTitle: string;
  order: number;

  // Fechas
  startDate?: string;
  endDate?: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;

  // Inscripciones
  maxEnrollments?: number;
  requiresApproval: boolean;
  allowSelfEnrollment: boolean;
  invitationLink?: string;

  // Imágenes
  coverImage?: string;
  menuImage?: string;
  thumbnailImage?: string;

  // Traducciones
  titleEn?: string;
  descriptionEn?: string;
  tagsEs?: string;
  tagsEn?: string;
  keywordsEs?: string;
  keywordsEn?: string;
}

export interface CourseValidationError {
  field: keyof CourseFormData;
  message: string;
}

export enum CourseVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SUSPENDED = 'suspended'
}

export enum CourseIntensity {
  LOW = 'low',        // 1-5 horas
  MEDIUM = 'medium',  // 6-15 horas
  HIGH = 'high',      // 16-40 horas
  INTENSIVE = 'intensive' // 40+ horas
}

export enum CourseViewType {
  CONTENTS = 'contents',
  FORUMS = 'forums',
  TASKS = 'tasks',
  EVALUATIONS = 'evaluations',
  SURVEYS = 'surveys',
  THEMATIC_ROOMS = 'thematic_rooms',
  LIVE_SESSIONS = 'live_sessions',
  DIDACTIC_ACTIVITIES = 'didactic_activities'
}


export enum BackgroundType {
  COLOR = 'color',
  IMAGE = 'image',
}

export enum CoverType {
  IMAGE = 'image',
  VIDEO = 'video'
}

// Interfaces para formularios
export interface CourseFormData {
  // Información básica
  title: string;
  description: string;
  instructor: string;
  category: string;
  subcategory?: string;
  level: CourseLevel;

  // Información académica
  acronym?: string;
  code?: string;
  intensity: number;
  estimatedHours?: number;

  // Configuración
  visibility: CourseVisibility;
  status: CourseStatus;
  colorTitle: string;
  order: number;

  // Fechas
  startDate?: string;
  endDate?: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;

  // Inscripciones
  maxEnrollments?: number;
  requiresApproval: boolean;
  allowSelfEnrollment: boolean;
  invitationLink?: string;

  // Imágenes
  coverImage?: string;
  menuImage?: string;
  thumbnailImage?: string;

  // Traducciones
  titleEn?: string;
  descriptionEn?: string;
  tagsEs?: string;
  tagsEn?: string;
  keywordsEs?: string;
  keywordsEn?: string;
}

// Request para crear curso
export interface CreateCourseRequest {
  // Información básica
  title: string;
  description: string;
  instructor: string;
  category: string;
  subcategory?: string;
  level: CourseLevel;

  // Información académica
  acronym?: string;
  code?: string;
  intensity: number;
  estimatedHours?: number;

  // Configuración
  visibility: CourseVisibility;
  status: CourseStatus;
  colorTitle: string;
  order: number;

  // Fechas
  startDate?: string;
  endDate?: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;

  // Inscripciones
  maxEnrollments?: number;
  requiresApproval: boolean;
  allowSelfEnrollment: boolean;
  invitationLink?: string;

  // Imágenes
  coverImage?: string;
  menuImage?: string;
  thumbnailImage?: string;

  // Traducciones
  translations?: {
    es: {
      title: string;
      description: string;
      metadata: {
        tags: string[];
        keywords: string[];
      };
    };
    en?: {
      title: string;
      description: string;
      metadata: {
        tags: string[];
        keywords: string[];
      };
    };
  };

  // Configuración de vistas
  viewsConfig?: {
    [key in CourseViewType]?: {
      isActive: boolean;
      backgroundType: string;
      backgroundColor?: string;
      backgroundImagePath?: string;
      customTitle?: string;
      titleColor?: string;
      metadata?: Record<string, any>;
    };
  };
}