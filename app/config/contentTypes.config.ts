// app/config/contentTypes.config.ts

import { Video, FileText, Image, Globe, Package } from "lucide-react";

export const CONTENT_TYPES = {
  video: {
    type: 'video',
    icon: Video,
    title: 'Video',
    description: 'Contenido de video (MP4, WebM, etc.)',
    features: ['Streaming', 'Controles de reproducción', 'Subtítulos'],
    formats: 'MP4, WebM, MOV (máx. 500MB)',
    accept: 'video/*,.mp4,.webm,.mov',
    maxSize: 500 * 1024 * 1024, // 500MB
    placeholder: 'https://ejemplo.com/video.mp4 o https://youtube.com/watch?v=...',
    supportsUrl: true,
    supportsFile: true
  },
  document: {
    type: 'document',
    icon: FileText,
    title: 'Documento',
    description: 'PDFs, presentaciones, documentos',
    features: ['Visualización en línea', 'Descarga', 'Búsqueda de texto'],
    formats: 'PDF, DOC, DOCX, PPT, PPTX (máx. 50MB)',
    accept: '.pdf,.doc,.docx,.ppt,.pptx',
    maxSize: 50 * 1024 * 1024, // 50MB
    placeholder: 'https://ejemplo.com/documento.pdf',
    supportsUrl: true,
    supportsFile: true
  },
  image: {
    type: 'image',
    icon: Image,
    title: 'Imagen',
    description: 'Imágenes, infografías, diagramas',
    features: ['Zoom', 'Galería', 'Descripción alt'],
    formats: 'JPG, PNG, GIF, SVG (máx. 10MB)',
    accept: 'image/*,.jpg,.jpeg,.png,.gif,.svg',
    maxSize: 10 * 1024 * 1024, // 10MB
    placeholder: 'https://ejemplo.com/imagen.jpg',
    supportsUrl: true,
    supportsFile: true
  },
  embed: {
    type: 'embed',
    icon: Globe,
    title: 'Contenido Embebido',
    description: 'CodePen, YouTube, simuladores',
    features: ['Interactivo', 'Responsive', 'Externo'],
    formats: 'CodePen, YouTube, Vimeo, simuladores, etc.',
    accept: '',
    maxSize: 0,
    placeholder: 'https://codepen.io/usuario/pen/codigo',
    supportsUrl: true,
    supportsFile: false
  },
  scorm: {
    type: 'scorm',
    icon: Package,
    title: 'Paquete SCORM',
    description: 'Contenido e-learning estándar',
    features: ['Seguimiento', 'Evaluaciones', 'Progreso'],
    formats: 'ZIP con estructura SCORM (máx. 100MB)',
    accept: '.zip',
    maxSize: 100 * 1024 * 1024, // 100MB
    placeholder: 'Selecciona archivo ZIP del paquete SCORM',
    supportsUrl: false,
    supportsFile: true
  }
} as const;

export type ContentTypeKey = keyof typeof CONTENT_TYPES;

export const getContentTypeConfig = (type: string) => {
  return CONTENT_TYPES[type as ContentTypeKey] || null;
};

export const getAllContentTypes = () => {
  return Object.values(CONTENT_TYPES);
};

// Validaciones comunes
export const validateFileSize = (file: File, contentType: string): boolean => {
  const config = getContentTypeConfig(contentType);
  if (!config) return false;
  
  return file.size <= config.maxSize;
};

export const validateFileExtension = (file: File, contentType: string): boolean => {
  const config = getContentTypeConfig(contentType);
  if (!config) return false;
  
  if (contentType === 'scorm') {
    return file.name.toLowerCase().endsWith('.zip');
  }
  
  // Para otros tipos, la validación se basa en el accept del input
  return true;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};