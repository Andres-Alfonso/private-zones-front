// app/api/types/section.types.ts

export interface Section {
  id: string;
  slug: string;
  tenantId: string;
  thumbnailImagePath: string;
  bannerPath: string;
  order: number;
  name: string;
  description: string;
  allowBanner: boolean;
  courseCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
    name: string;
    slug: string;
    thumbnailImagePath: string;
    bannerPath: string;
    order: number;
    description: string;
    allowBanner: boolean;
}

// Errores específicos del tenant
export enum SectionError {
  DOMAIN_MISMATCH = 'DOMAIN_MISMATCH',
  SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',
  DOMAIN_ALREADY_EXISTS = 'DOMAIN_ALREADY_EXISTS',
  RESERVED_SLUG = 'RESERVED_SLUG',
  INVALID_DOMAIN = 'INVALID_DOMAIN',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SECTION_NOT_FOUND = 'SECTION_NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TOGGLE_ERROR = 'TOGGLE_ERROR',
  GET_STATUS_ERROR = 'GET_STATUS_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface SectionListResponse {
  data: Section[];
  total: number;
  page: number;
  limit: number;
}

export interface SectionFilters {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SectionErrorResponse {
  error: SectionError;
  message: string;
  field?: string;  // Campo específico que causó el error
  value?: string;  // Valor que causó el error
  details?: string; // Detalles adicionales del error
}