// app/utils/sectionValidation.ts

export interface SectionValidationError {
  field: string;
  message: string;
}

export interface SectionValidationResult {
  isValid: boolean;
  errors: SectionValidationError[];
}

export interface SectionFormData {
  name: string;
  slug: string;
  description: string;
  thumbnailImagePath: string;
  order: number;
  allowBanner: boolean;
  bannerPath: string;
}

// Reglas de validación específicas para secciones
export const SectionValidationRules = {
  name: {
    required: "El nombre de la sección es obligatorio",
    minLength: "El nombre debe tener al menos 2 caracteres",
    maxLength: "El nombre no puede tener más de 100 caracteres",
  },
  slug: {
    required: "El slug es obligatorio",
    minLength: "El slug debe tener al menos 2 caracteres",
    maxLength: "El slug no puede tener más de 50 caracteres",
    pattern: "El slug solo puede contener letras, números y guiones",
    reserved: "Este slug está reservado y no puede ser usado",
  },
  description: {
    maxLength: "La descripción no puede tener más de 500 caracteres",
  },
  order: {
    required: "El orden es obligatorio",
    invalidNumber: "El orden debe ser un número válido",
    minValue: "El orden debe ser mayor a 0",
    maxValue: "El orden no puede ser mayor a 999",
  },
  thumbnailImagePath: {
    invalidUrl: "La URL de la imagen no es válida",
    maxLength: "La URL no puede tener más de 500 caracteres",
  },
  bannerPath: {
    invalidUrl: "La URL del banner no es válida",
    maxLength: "La URL no puede tener más de 500 caracteres",
  },
};

// Slugs reservados para secciones
const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'auth', 'dashboard', 'help', 'home', 'manage', 'new', 
  'edit', 'create', 'delete', 'settings', 'config', 'system', 'root', 'public',
  'private', 'secure', 'test', 'dev', 'staging', 'production', 'www', 'mail',
  'ftp', 'cdn', 'assets', 'static', 'media', 'uploads', 'downloads', 'files'
];

// Funciones de validación individuales
export const validateSectionName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return SectionValidationRules.name.required;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return SectionValidationRules.name.minLength;
  }

  if (trimmedName.length > 100) {
    return SectionValidationRules.name.maxLength;
  }

  return null;
};

export const validateSectionSlug = (slug: string): string | null => {
  if (!slug || !slug.trim()) {
    return SectionValidationRules.slug.required;
  }

  const trimmedSlug = slug.trim().toLowerCase();

  if (trimmedSlug.length < 2) {
    return SectionValidationRules.slug.minLength;
  }

  if (trimmedSlug.length > 50) {
    return SectionValidationRules.slug.maxLength;
  }

  // Solo letras, números y guiones
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(trimmedSlug)) {
    return SectionValidationRules.slug.pattern;
  }

  // No puede empezar o terminar con guión
  if (trimmedSlug.startsWith('-') || trimmedSlug.endsWith('-')) {
    return SectionValidationRules.slug.pattern;
  }

  // No puede tener guiones consecutivos
  if (trimmedSlug.includes('--')) {
    return SectionValidationRules.slug.pattern;
  }

  // Verificar slugs reservados
  if (RESERVED_SLUGS.includes(trimmedSlug)) {
    return SectionValidationRules.slug.reserved;
  }

  return null;
};

export const validateSectionDescription = (description: string): string | null => {
  if (!description) {
    return null; // La descripción es opcional
  }

  if (description.length > 500) {
    return SectionValidationRules.description.maxLength;
  }

  return null;
};

export const validateSectionOrder = (order: string | number): string | null => {
  if (order === '' || order === null || order === undefined) {
    return SectionValidationRules.order.required;
  }

  const orderNumber = typeof order === 'string' ? parseInt(order, 10) : order;

  if (isNaN(orderNumber)) {
    return SectionValidationRules.order.invalidNumber;
  }

  if (orderNumber < 1) {
    return SectionValidationRules.order.minValue;
  }

  if (orderNumber > 999) {
    return SectionValidationRules.order.maxValue;
  }

  return null;
};

export const validateImageUrl = (url: string, fieldName: 'thumbnailImagePath' | 'bannerPath'): string | null => {
  if (!url || !url.trim()) {
    return null; // Las URLs de imagen son opcionales
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length > 500) {
    return fieldName === 'thumbnailImagePath' 
      ? SectionValidationRules.thumbnailImagePath.maxLength
      : SectionValidationRules.bannerPath.maxLength;
  }

  // Validar que sea una URL válida
  try {
    new URL(trimmedUrl);
  } catch {
    // Si no es una URL válida, verificar si es una ruta relativa válida
    const relativePathPattern = /^\/[a-zA-Z0-9._\-\/]*\.(jpg|jpeg|png|gif|webp|svg)$/i;
    if (!relativePathPattern.test(trimmedUrl)) {
      return fieldName === 'thumbnailImagePath' 
        ? SectionValidationRules.thumbnailImagePath.invalidUrl
        : SectionValidationRules.bannerPath.invalidUrl;
    }
  }

  return null;
};

// Validar formulario completo
export const validateSectionForm = (formData: FormData): SectionValidationResult => {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const order = formData.get('order') as string;
  const thumbnailImagePath = formData.get('thumbnailImagePath') as string;
  const bannerPath = formData.get('bannerPath') as string;
  const tenantId = formData.get('tenantId') as string;

  const errors: SectionValidationError[] = [];

  // Validar tenantId
  if (!tenantId || !tenantId.trim()) {
    errors.push({ field: 'tenantId', message: 'El ID del tenant es obligatorio' });
  }

  // Validar nombre
  const nameError = validateSectionName(name);
  if (nameError) {
    errors.push({ field: 'name', message: nameError });
  }

  // Validar slug
  const slugError = validateSectionSlug(slug);
  if (slugError) {
    errors.push({ field: 'slug', message: slugError });
  }

  // Validar descripción
  const descriptionError = validateSectionDescription(description);
  if (descriptionError) {
    errors.push({ field: 'description', message: descriptionError });
  }

  // Validar orden
  const orderError = validateSectionOrder(order);
  if (orderError) {
    errors.push({ field: 'order', message: orderError });
  }

  // Validar imagen thumbnail
  // const thumbnailError = validateImageUrl(thumbnailImagePath, 'thumbnailImagePath');
  // if (thumbnailError) {
  //   errors.push({ field: 'thumbnailImagePath', message: thumbnailError });
  // }

  // Validar imagen banner
  const bannerError = validateImageUrl(bannerPath, 'bannerPath');
  if (bannerError) {
    errors.push({ field: 'bannerPath', message: bannerError });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para validar directamente un objeto SectionFormData
export const validateSectionFormData = (data: SectionFormData): SectionValidationResult => {
  const errors: SectionValidationError[] = [];

  // Validar nombre
  const nameError = validateSectionName(data.name);
  if (nameError) {
    errors.push({ field: 'name', message: nameError });
  }

  // Validar slug
  const slugError = validateSectionSlug(data.slug);
  if (slugError) {
    errors.push({ field: 'slug', message: slugError });
  }

  // Validar descripción
  const descriptionError = validateSectionDescription(data.description);
  if (descriptionError) {
    errors.push({ field: 'description', message: descriptionError });
  }

  // Validar orden
  const orderError = validateSectionOrder(data.order);
  if (orderError) {
    errors.push({ field: 'order', message: orderError });
  }

  // Validar imagen thumbnail
  const thumbnailError = validateImageUrl(data.thumbnailImagePath, 'thumbnailImagePath');
  if (thumbnailError) {
    errors.push({ field: 'thumbnailImagePath', message: thumbnailError });
  }

  // Validar imagen banner
  const bannerError = validateImageUrl(data.bannerPath, 'bannerPath');
  if (bannerError) {
    errors.push({ field: 'bannerPath', message: bannerError });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utilidad para obtener errores por campo
export const getErrorByField = (
  errors: SectionValidationError[],
  field: keyof SectionFormData
): string | null => {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
};

// Función para generar slug automáticamente desde el nombre
export const generateSlugFromName = (name: string | undefined): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .trim()
    // Normalizar caracteres con acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar caracteres especiales comunes
    .replace(/[&]/g, 'y')
    .replace(/[ñ]/g, 'n')
    // Remover caracteres no válidos (solo letras, números, espacios y guiones)
    .replace(/[^a-z0-9\s-]/g, '')
    // Reemplazar múltiples espacios con uno solo
    .replace(/\s+/g, ' ')
    // Reemplazar espacios con guiones
    .replace(/\s/g, '-')
    // Reemplazar múltiples guiones con uno solo
    .replace(/-+/g, '-')
    // Remover guiones al inicio y final
    .replace(/^-+|-+$/g, '');
};

// Validar que el slug sea único (se usaría con una consulta a la base de datos)
export const validateSlugUniqueness = async (slug: string, excludeId?: string): Promise<string | null> => {
  // En una implementación real, aquí se haría una consulta a la base de datos
  // para verificar si el slug ya existe
  
  // Ejemplo mock:
  // const existingSection = await SectionAPI.findBySlug(slug);
  // if (existingSection && existingSection.id !== excludeId) {
  //   return 'Este slug ya está en uso por otra sección';
  // }
  
  return null;
};

// Validar que el orden sea único (se usaría con una consulta a la base de datos)
export const validateOrderUniqueness = async (order: number, tenantId: string, excludeId?: string): Promise<string | null> => {
  // En una implementación real, aquí se haría una consulta a la base de datos
  // para verificar si el orden ya existe para ese tenant
  
  // Ejemplo mock:
  // const existingSection = await SectionAPI.findByOrder(order, tenantId);
  // if (existingSection && existingSection.id !== excludeId) {
  //   return 'Ya existe una sección con este orden';
  // }
  
  return null;
};

// Función para limpiar y preparar los datos del formulario
export const sanitizeSectionFormData = (formData: FormData): SectionFormData => {
  return {
    name: (formData.get('name') as string || '').trim(),
    slug: (formData.get('slug') as string || '').trim().toLowerCase(),
    description: (formData.get('description') as string || '').trim(),
    thumbnailImagePath: (formData.get('thumbnailImagePath') as string || '').trim(),
    order: parseInt(formData.get('order') as string || '1', 10),
    allowBanner: formData.get('allowBanner') === 'on',
    bannerPath: (formData.get('bannerPath') as string || '').trim(),
  };
};

// Función para validar archivos de imagen subidos
export const validateImageFile = (file: File): string | null => {
  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WebP';
  }

  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB en bytes
  if (file.size > maxSize) {
    return 'El archivo es muy grande. El tamaño máximo es 10MB';
  }

  return null;
};

// Función para validar dimensiones de imagen (se usaría con FileReader)
export const validateImageDimensions = (file: File, maxWidth: number = 2000, maxHeight: number = 2000): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve(`Las dimensiones de la imagen son muy grandes. Máximo ${maxWidth}x${maxHeight} píxeles`);
      } else {
        resolve(null);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('Error al cargar la imagen');
    };
    
    img.src = url;
  });
};