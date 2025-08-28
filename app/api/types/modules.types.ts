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

export interface ModuleApiResponse {
  success: boolean;
  message: string;
  data: CourseModule;
}

// export interface ModuleItem {
//   id: string;
//   moduleId: string;
//   type: 'content' | 'forum' | 'task' | 'quiz' | 'survey' | 'activity';
//   referenceId: string;
//   order: number;
// }

export interface ModuleConfiguration {
  id: string;
  courseModuleId: string;
  isActive: boolean;
  order: number;
  approvalPercentage: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  thumbnailImagePath?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  configuration?: ModuleConfiguration;
  items?: ModuleItem[];
}

export interface CreateModuleData {
  courseId: string;
  title: string;
  description?: string;
  thumbnailImagePath?: string;
  configuration: {
    isActive: boolean;
    order: number;
    approvalPercentage: number;
    metadata: Record<string, any>;
  };
  items: {
    type: 'content' | 'forum' | 'task' | 'quiz' | 'survey' | 'activity';
    referenceId: string;
    order: number;
  }[];
}
