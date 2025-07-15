// app/utils/courseValidation.ts

import { CourseFormData, CourseValidationError, CourseLevel } from '~/api/types/course.types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface CourseValidationResult {
  isValid: boolean;
  errors: CourseValidationError[];
}

export function validateCourseStep(
  step: number, 
  formData: Partial<CourseFormData>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  switch (step) {
    case 1: // Información Básica
      if (!formData.title || formData.title.trim().length < 5) {
        errors.push({ field: 'title', message: 'El título debe tener al menos 5 caracteres' });
      }
      
      if (!formData.description || formData.description.trim().length < 20) {
        errors.push({ field: 'description', message: 'La descripción debe tener al menos 20 caracteres' });
      }
      
      if (!formData.instructor || formData.instructor.trim().length < 2) {
        errors.push({ field: 'instructor', message: 'El instructor es obligatorio' });
      }
      
      if (!formData.category || formData.category.trim().length < 2) {
        errors.push({ field: 'category', message: 'La categoría es obligatoria' });
      }
      
      if (!formData.level) {
        errors.push({ field: 'level', message: 'Selecciona un nivel de dificultad' });
      }
      break;

    case 2: // Configuración Académica
      if (formData.acronym && formData.acronym.length > 10) {
        errors.push({ field: 'acronym', message: 'Las siglas no pueden exceder 10 caracteres' });
      }
      
      if (formData.estimatedHours && (isNaN(Number(formData.estimatedHours)) || Number(formData.estimatedHours) <= 0)) {
        errors.push({ field: 'estimatedHours', message: 'Las horas estimadas deben ser un número mayor a 0' });
      }
      
      if (!formData.intensity || formData.intensity < 1 || formData.intensity > 4) {
        warnings.push({ field: 'intensity', message: 'Considera seleccionar una intensidad para ayudar a los estudiantes' });
      }
      break;

    case 3: // Fechas y Inscripciones
      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
        errors.push({ field: 'endDate', message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
      }
      
      if (formData.enrollmentStartDate && formData.enrollmentEndDate && 
          new Date(formData.enrollmentStartDate) >= new Date(formData.enrollmentEndDate)) {
        errors.push({ field: 'enrollmentEndDate', message: 'La fecha de fin de inscripciones debe ser posterior al inicio' });
      }
      
      if (formData.maxEnrollments && (isNaN(Number(formData.maxEnrollments)) || Number(formData.maxEnrollments) <= 0)) {
        errors.push({ field: 'maxEnrollments', message: 'El número máximo de estudiantes debe ser mayor a 0' });
      }
      
      if (formData.invitationLink && !isValidUrl(formData.invitationLink)) {
        errors.push({ field: 'invitationLink', message: 'El enlace de invitación debe ser una URL válida' });
      }
      break;

    case 4: // Imágenes y Diseño
      if (formData.coverImage && !isValidUrl(formData.coverImage)) {
        warnings.push({ field: 'coverImage', message: 'Verifica que la URL de la imagen de portada sea válida' });
      }
      
      if (formData.menuImage && !isValidUrl(formData.menuImage)) {
        warnings.push({ field: 'menuImage', message: 'Verifica que la URL de la imagen del menú sea válida' });
      }
      
      if (formData.thumbnailImage && !isValidUrl(formData.thumbnailImage)) {
        warnings.push({ field: 'thumbnailImage', message: 'Verifica que la URL de la imagen miniatura sea válida' });
      }
      break;

    case 5: // Traducciones
      if (formData.titleEn && formData.titleEn.trim().length < 5) {
        warnings.push({ field: 'titleEn', message: 'El título en inglés debería tener al menos 5 caracteres' });
      }
      
      if (formData.descriptionEn && formData.descriptionEn.trim().length < 20) {
        warnings.push({ field: 'descriptionEn', message: 'La descripción en inglés debería tener al menos 20 caracteres' });
      }
      break;

    case 6: // Configuración de Vistas
      // Las validaciones para vistas son opcionales
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getStepCompletionStatus(
  step: number, 
  formData: Partial<CourseFormData>
): 'incomplete' | 'valid' | 'invalid' {
  const validation = validateCourseStep(step, formData);
  
  if (!validation.isValid) {
    return 'invalid';
  }
  
  // Verificar si el paso tiene la información mínima requerida
  switch (step) {
    case 1:
      return (formData.title && formData.description && formData.instructor && 
              formData.category && formData.level) ? 'valid' : 'incomplete';
    case 2:
      return 'valid'; // Este paso es completamente opcional
    case 3:
      return 'valid'; // Este paso es completamente opcional
    case 4:
      return 'valid'; // Este paso es completamente opcional
    case 5:
      return 'valid'; // Este paso es completamente opcional
    case 6:
      return 'valid'; // Este paso es completamente opcional
    default:
      return 'incomplete';
  }
}

// Reglas de validación específicas para cursos
export const CourseValidationRules = {
  title: {
    required: "El título del curso es obligatorio",
    minLength: "El título debe tener al menos 5 caracteres",
    maxLength: "El título no puede tener más de 100 caracteres",
  },
  description: {
    required: "La descripción del curso es obligatoria",
    minLength: "La descripción debe tener al menos 20 caracteres",
    maxLength: "La descripción no puede tener más de 2000 caracteres",
  },
  instructor: {
    required: "El instructor es obligatorio",
    minLength: "El nombre del instructor debe tener al menos 2 caracteres",
    maxLength: "El nombre del instructor no puede tener más de 100 caracteres",
  },
  duration: {
    required: "La duración del curso es obligatoria",
    invalidNumber: "La duración debe ser un número válido",
    minValue: "La duración debe ser mayor a 0 horas",
    maxValue: "La duración no puede ser mayor a 1000 horas",
  },
  category: {
    required: "La categoría del curso es obligatoria",
    minLength: "La categoría debe tener al menos 2 caracteres",
  },
  price: {
    required: "El precio del curso es obligatorio",
    invalidNumber: "El precio debe ser un número válido",
    minValue: "El precio debe ser mayor o igual a 0",
    maxValue: "El precio no puede ser mayor a $10,000",
  },
  maxStudents: {
    required: "El número máximo de estudiantes es obligatorio",
    invalidNumber: "El número máximo de estudiantes debe ser un número válido",
    minValue: "Debe permitir al menos 1 estudiante",
    maxValue: "No puede permitir más de 10,000 estudiantes",
  },
  startDate: {
    required: "La fecha de inicio es obligatoria",
    invalidDate: "La fecha de inicio no es válida",
    pastDate: "La fecha de inicio no puede ser anterior a hoy",
  },
  endDate: {
    required: "La fecha de fin es obligatoria",
    invalidDate: "La fecha de fin no es válida",
    beforeStartDate: "La fecha de fin debe ser posterior a la fecha de inicio",
  },
  thumbnail: {
    invalidUrl: "La URL de la imagen no es válida",
  },
};

// Funciones de validación individuales
export const validateCourseTitle = (title: string): string | null => {
  if (!title || !title.trim()) {
    return CourseValidationRules.title.required;
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 5) {
    return CourseValidationRules.title.minLength;
  }

  if (trimmedTitle.length > 100) {
    return CourseValidationRules.title.maxLength;
  }

  return null;
};

export const validateCourseDescription = (description: string): string | null => {
  if (!description || !description.trim()) {
    return CourseValidationRules.description.required;
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription.length < 20) {
    return CourseValidationRules.description.minLength;
  }

  if (trimmedDescription.length > 2000) {
    return CourseValidationRules.description.maxLength;
  }

  return null;
};

export const validateCourseInstructor = (instructor: string): string | null => {
  if (!instructor || !instructor.trim()) {
    return CourseValidationRules.instructor.required;
  }

  const trimmedInstructor = instructor.trim();

  if (trimmedInstructor.length < 2) {
    return CourseValidationRules.instructor.minLength;
  }

  if (trimmedInstructor.length > 100) {
    return CourseValidationRules.instructor.maxLength;
  }

  return null;
};

export const validateCourseDuration = (duration: string): string | null => {
  if (!duration || !duration.trim()) {
    return CourseValidationRules.duration.required;
  }

  const durationNumber = Number(duration);

  if (isNaN(durationNumber)) {
    return CourseValidationRules.duration.invalidNumber;
  }

  if (durationNumber <= 0) {
    return CourseValidationRules.duration.minValue;
  }

  if (durationNumber > 1000) {
    return CourseValidationRules.duration.maxValue;
  }

  return null;
};

export const validateCourseCategory = (category: string): string | null => {
  if (!category || !category.trim()) {
    return CourseValidationRules.category.required;
  }

  if (category.trim().length < 2) {
    return CourseValidationRules.category.minLength;
  }

  return null;
};

export const validateCoursePrice = (price: string): string | null => {
  if (!price || !price.trim()) {
    return CourseValidationRules.price.required;
  }

  const priceNumber = Number(price);

  if (isNaN(priceNumber)) {
    return CourseValidationRules.price.invalidNumber;
  }

  if (priceNumber < 0) {
    return CourseValidationRules.price.minValue;
  }

  if (priceNumber > 10000) {
    return CourseValidationRules.price.maxValue;
  }

  return null;
};

export const validateMaxStudents = (maxStudents: string): string | null => {
  if (!maxStudents || !maxStudents.trim()) {
    return CourseValidationRules.maxStudents.required;
  }

  const maxStudentsNumber = Number(maxStudents);

  if (isNaN(maxStudentsNumber)) {
    return CourseValidationRules.maxStudents.invalidNumber;
  }

  if (maxStudentsNumber < 1) {
    return CourseValidationRules.maxStudents.minValue;
  }

  if (maxStudentsNumber > 10000) {
    return CourseValidationRules.maxStudents.maxValue;
  }

  return null;
};

export const validateStartDate = (startDate: string): string | null => {
  if (!startDate || !startDate.trim()) {
    return CourseValidationRules.startDate.required;
  }

  const startDateObj = new Date(startDate);

  if (isNaN(startDateObj.getTime())) {
    return CourseValidationRules.startDate.invalidDate;
  }

  // Permitir fechas desde hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (startDateObj < today) {
    return CourseValidationRules.startDate.pastDate;
  }

  return null;
};

export const validateEndDate = (endDate: string, startDate: string): string | null => {
  if (!endDate || !endDate.trim()) {
    return CourseValidationRules.endDate.required;
  }

  const endDateObj = new Date(endDate);

  if (isNaN(endDateObj.getTime())) {
    return CourseValidationRules.endDate.invalidDate;
  }

  if (startDate) {
    const startDateObj = new Date(startDate);
    if (!isNaN(startDateObj.getTime()) && endDateObj <= startDateObj) {
      return CourseValidationRules.endDate.beforeStartDate;
    }
  }

  return null;
};

export const validateThumbnailUrl = (thumbnail: string): string | null => {
  if (!thumbnail || !thumbnail.trim()) {
    return null; // El thumbnail es opcional
  }

  try {
    new URL(thumbnail);
    return null;
  } catch {
    return CourseValidationRules.thumbnail.invalidUrl;
  }
};

// Validación completa del formulario de curso
export const validateCourseForm = (formData: CourseFormData): CourseValidationResult => {
  const errors: CourseValidationError[] = [];

  // Validar cada campo
  const titleError = validateCourseTitle(formData.title);
  if (titleError) {
    errors.push({ field: 'title', message: titleError });
  }

  const descriptionError = validateCourseDescription(formData.description);
  if (descriptionError) {
    errors.push({ field: 'description', message: descriptionError });
  }

  const instructorError = validateCourseInstructor(formData.instructor);
  if (instructorError) {
    errors.push({ field: 'instructor', message: instructorError });
  }

  // const durationError = validateCourseDuration(formData.duration);
  // if (durationError) {
  //   errors.push({ field: 'duration', message: durationError });
  // }

  const categoryError = validateCourseCategory(formData.category);
  if (categoryError) {
    errors.push({ field: 'category', message: categoryError });
  }

  // const priceError = validateCoursePrice(formData.price);
  // if (priceError) {
  //   errors.push({ field: 'price', message: priceError });
  // }

  // const maxStudentsError = validateMaxStudents(formData.maxStudents);
  // if (maxStudentsError) {
  //   errors.push({ field: 'maxStudents', message: maxStudentsError });
  // }

  // const startDateError = validateStartDate(formData.startDate);
  // if (startDateError) {
  //   errors.push({ field: 'startDate', message: startDateError });
  // }

  // const endDateError = validateEndDate(formData.endDate, formData.startDate);
  // if (endDateError) {
  //   errors.push({ field: 'endDate', message: endDateError });
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función para validar FormData (para usar en actions de Remix)
export const validateCourseFormData = (formData: FormData): CourseValidationResult => {
  const courseData: CourseFormData = {
    title: formData.get('title') as string || '',
    description: formData.get('description') as string || '',
    instructor: formData.get('instructor') as string || '',
    // duration: formData.get('duration') as string || '',
    level: formData.get('level') as CourseLevel || CourseLevel.BEGINNER,
    category: formData.get('category') as string || '',
    // price: formData.get('price') as string || '',
    // maxStudents: formData.get('maxStudents') as string || '',
    startDate: formData.get('startDate') as string || '',
    endDate: formData.get('endDate') as string || '',
  };

  return validateCourseForm(courseData);
};

// Utilidad para obtener errores por campo (compatible con el resto del sistema)
export const getCourseErrorByField = (
  errors: CourseValidationError[],
  field: keyof CourseFormData
): string | null => {
  const error = errors.find((err) => err.field === field);
  return error ? error.message : null;
};

// Funciones de utilidad adicionales
export const formatCourseDuration = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutos`;
  } else if (hours === 1) {
    return '1 hora';
  } else if (hours < 24) {
    return `${hours} horas`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} día${days > 1 ? 's' : ''}${remainingHours > 0 ? ` y ${remainingHours} hora${remainingHours > 1 ? 's' : ''}` : ''}`;
  }
};

export const calculateCourseProgress = (completedLessons: number, totalLessons: number): number => {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
};

export const formatCoursePrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Categorías predefinidas (podrías cargarlas desde el API)
export const COURSE_CATEGORIES = [
  'Frontend',
  'Backend', 
  'Full Stack',
  'Diseño',
  'DevOps',
  'Data Science',
  'Machine Learning',
  'Mobile',
  'Testing',
  'Cybersecurity',
  'Cloud Computing',
  'Blockchain',
  'Game Development',
  'AI & Automation'
] as const;

export type CourseCategoryType = typeof COURSE_CATEGORIES[number];