// app/api/types/section.types.ts

export interface Section {
  id: string;
  slug: string;
  tenantId: string;
  thumbnailImagePath: string;
  order: number;
  name: string;
  description: string;
  allowBanner: boolean;
  courseCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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