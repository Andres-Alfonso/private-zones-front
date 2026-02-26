// types/modules.ts
export interface ModuleItem {
  id: string;
  courseId: string;
  tenantId: string;
  title: string;
  thumbnailImagePath: string | null;
  description: string | null;
  configuration: {
    isActive: boolean;
    order: number;
  }
  items?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleFilters {
  search?: string;
  contentType?: string;
  page: number;
  limit: number;
}

export interface AvailableResource {
    id: string;
    title: string;
    subtitle?: string;
}

export interface AvailableItems {
    content:  AvailableResource[];
    forum:    AvailableResource[];
    task:     AvailableResource[];
    quiz:     AvailableResource[];
    survey:   AvailableResource[];
    activity: AvailableResource[];
}

export type ModuleItemType = "content" | "forum" | "task" | "quiz" | "survey" | "activity";


export interface ModuleItemData {
    id: string;
    type: ModuleItemType;
    referenceId: string;
    order: number;
    content?: {
        id: string;
        title: string;
        contentType: string;
        contentUrl: string;
        description?: string;
    } | null;
}

export interface ModuleDetail {
    id: string;
    title: string;
    description?: string;
    courseId: string;
    thumbnailImagePath?: string;
    createdAt: string;
    updatedAt: string;
    configuration?: {
        isActive: boolean;
        order: number;
        approvalPercentage: number;
    };
    items: ModuleItemData[];
    course?: {
        id: string;
        tenantId: string;
    };
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

export interface ModuleItemsApiResponse {
  success: boolean;
  message: string;
  data: ModuleDetail;
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
  // items: {
  //   type: 'content' | 'forum' | 'task' | 'quiz' | 'survey' | 'activity';
  //   referenceId: string;
  //   order: number;
  // }[];
}
