// app/api/types/content.types.ts

export interface ContentFormData {
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  courseId: string;
  metadata: Record<string, any>;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
}

export interface FormErrors {
  title?: string;
  description?: string;
  contentType?: string;
  contentUrl?: string;
  courseId?: string;
  file?: string;
  general?: string;
}

export interface ContentItem {
  id: string;
  tenantId: string;
  title: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Tipos específicos para metadatos según el tipo de contenido
export interface VideoMetadata {
  duration?: number;
  quality?: '720p' | '1080p' | '4k';
  language?: string;
  hasSubtitles?: boolean;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface DocumentMetadata {
  pages?: number;
  format?: 'pdf' | 'doc' | 'ppt' | 'xls';
  downloadable?: boolean;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ImageMetadata {
  resolution?: string;
  format?: 'jpg' | 'png' | 'gif' | 'svg';
  altText?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface EmbedMetadata {
  platform?: 'youtube' | 'vimeo' | 'codepen' | 'jsfiddle' | 'other';
  interactive?: boolean;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ScormMetadata {
  version?: '1.2' | '2004';
  estimatedTime?: number;
  activities?: number;
  hasEvaluation?: boolean;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export enum ContentType {
  VIDEO = 'video',
  IMAGE = 'image',
  DOCUMENT = 'document',
  EMBED = 'embed',
  SCORM = 'scorm'
}

export interface ContentBase {
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl: string;
  tenantId: string;
  metadata?: Record<string, any>;
}

export interface Content extends ContentBase {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt?: string; // ISO date string, opcional
}

export interface ContentResponse {
  success: boolean;
  message: string;
  data: Content;
}
