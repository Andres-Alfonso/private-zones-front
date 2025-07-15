// app/utils/courseHelpers.ts
import React from 'react';
import { CourseFormData, CourseLevel, CourseStatus, CourseVisibility } from '~/api/types/course.types';

export function getCourseLevelColor(level: CourseLevel): string {
  switch (level) {
    case CourseLevel.BEGINNER:
      return 'text-green-600 bg-green-100';
    case CourseLevel.INTERMEDIATE:
      return 'text-yellow-600 bg-yellow-100';
    case CourseLevel.ADVANCED:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getCourseStatusColor(status: CourseStatus): string {
  switch (status) {
    case CourseStatus.DRAFT:
      return 'text-gray-600 bg-gray-100';
    case CourseStatus.PUBLISHED:
      return 'text-green-600 bg-green-100';
    case CourseStatus.ARCHIVED:
      return 'text-blue-600 bg-blue-100';
    case CourseStatus.SUSPENDED:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getCourseVisibilityColor(visibility: CourseVisibility): string {
  switch (visibility) {
    case CourseVisibility.PUBLIC:
      return 'text-green-600 bg-green-100';
    case CourseVisibility.PRIVATE:
      return 'text-gray-600 bg-gray-100';
    case CourseVisibility.RESTRICTED:
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} ${days === 1 ? 'día' : 'días'}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
  }
}

export function calculateCourseDuration(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function generateCourseSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-'); // Eliminar guiones duplicados
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Verificar tipo de archivo
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'El archivo debe ser una imagen' };
  }
  
  // Verificar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'El archivo es muy grande. Máximo 5MB permitido' };
  }
  
  // Verificar formatos aceptados
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Formato no soportado. Use JPG, PNG, WebP o GIF' };
  }
  
  return { isValid: true };
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen'));
    };
    
    img.src = url;
  });
}

export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspecto
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convertir a blob y crear nuevo archivo
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Si falla la compresión, devolver original
        }
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Hook para manejo de formulario con auto-guardado
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 30000 // 30 segundos por defecto
) {
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configurar nuevo auto-guardado
    timeoutRef.current = setTimeout(async () => {
      if (data && Object.keys(data as any).length > 0) {
        setIsSaving(true);
        try {
          await onSave(data);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Error en auto-guardado:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave]);

  return { lastSaved, isSaving };
}