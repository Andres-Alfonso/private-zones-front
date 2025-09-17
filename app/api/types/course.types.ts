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

export interface CourseModuleLayoutData {
    id: string;
    title: string;
    description: string;
    thumbnailImagePath: string;
    items: ModuleItemLayoutData[];
    stats?: {
        totalItems: number;
        completedItems: number;
        totalDuration: number;
    };
}

interface ModuleItemLayoutData {
    id: string;
    type: 'content' | 'forum' | 'task' | 'quiz' | 'survey' | 'activity';
    referenceId: string;
    order: number;
    title: string;
    description?: string;
    duration?: number;
    isCompleted?: boolean;
    isLocked?: boolean;
    isActive?: boolean;
}

export interface CourseUserProgress{
  overallProgress: number;
  completedItems: string[];
  lastAccessDate: string;
  timeSpent: number;
  currentModuleId?: string;
  currentItemId?: string;
}

// Tipos para el layout de curso
export interface CourseLayoutData {
    id: string;
    slug: string;
    isActive: boolean;
    configuration: {
      code: string;
      acronym: string;
        coverImage: string;
        menuImage: string;
        thumbnailImage: string;
        colorTitle: string;
        visibility: 'public' | 'private' | 'restricted';
        status: 'draft' | 'published' | 'archived' | 'suspended';
        category: string;
        estimatedHours: number;
        intensity: number;
        startDate: string;
        endDate: string;
        maxEnrollments: number;
    };
    translations: Array<{
        languageCode: string;
        title: string;
        description: string;
    }>;
    modules: CourseModuleLayoutData[];
    viewsConfig: Array<{
        viewType: string;
        backgroundType: 'color' | 'image';
        backgroundColor: string;
        backgroundImagePath: string;
        customTitleEs: string;
        titleColor: string;
        coverTypeHeader: 'image' | 'video';
        coverImageHeader: string;
        coverTitleHeader: string;
        coverDescriptionHeader: string;
        layoutConfig: {
            allowCoverHeader: boolean;
            showTitle: boolean;
            showDescription: boolean;
        };
    }>;
    enrollmentInfo: {
        isEnrolled: boolean;
        enrollmentDate: string;
        progress: number;
        completedModules: number;
        totalModules: number;
    };
    instructor: {
        id: string;
        name: string;
        avatar?: string;
        title?: string;
    };
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

export interface CourseBasic {
  id: string;
  tenantId: string;
  sections: any[];
  title: string;
  slug: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  translations: CourseTranslation[];
}

export interface CourseFromAPI {
  id: string;
  slug: string;
  tenantId: string;
  sections: any[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  translations: CourseTranslation[]; // ARRAY de traducciones
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

export interface CoursePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CoursesResponse {
  data: Course[];
  pagination: CoursePagination;
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
  tenantId: string;
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