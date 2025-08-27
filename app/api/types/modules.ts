// types/modules.ts
export interface ModuleItem {
  id: string;
  tenantId: string;
  title: string;
  thumbnailUrl: string | null;
  description: string | null;
  configuration: {
    isActive: boolean;
    order: number;
  }
  createdAt: string;
  updatedAt: string;
}

export interface ModuleFilters {
  search?: string;
  contentType?: string;
  page: number;
  limit: number;
}

export interface ModulePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ModulesResponse {
  data: ModuleItem[];
  pagination: ModulePagination;
}