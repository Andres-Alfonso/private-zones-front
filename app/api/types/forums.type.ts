// app/api/types/forum.types.ts

export interface ForumBasic {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  expirationDate: Date | null;
  isActive: boolean;
  isPinned: boolean;
  category: string | null;
  tags: string[];
  viewCount: number;
  authorId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateForumDto {
  title: string;
  description?: string;
  thumbnail?: string;
  expirationDate?: Date;
  isActive?: boolean;
  isPinned?: boolean;
  category?: string;
  tags?: string[];
}

export interface UpdateForumDto {
  title?: string;
  description?: string;
  thumbnail?: string;
  expirationDate?: Date;
  isActive?: boolean;
  isPinned?: boolean;
  category?: string;
  tags?: string[];
}

export interface ForumFilters {
  category?: string;
  isActive?: boolean;
  isPinned?: boolean;
  authorId?: string;
}