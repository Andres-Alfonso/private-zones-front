// app/utils/tenantValidation.ts

import { TenantFormData, TenantValidationError, TenantPlan } from '~/api/types/tenant.types';

export interface TenantValidationResult {
  isValid: boolean;
  errors: TenantValidationError[];
}

// Reglas de validación específicas para tenants
export const TenantValidationRules = {
  name: {
    required: "El nombre del tenant es obligatorio",
    minLength: "El nombre debe tener al menos 2 caracteres",
    maxLength: "El nombre no puede tener más de 100 caracteres",
  },
  slug: {
    required: "El slug es obligatorio",
    minLength: "El slug debe tener al menos 3 caracteres",
    maxLength: "El slug no puede tener más de 50 caracteres",
    pattern: "El slug solo puede contener letras, números y guiones",
    reserved: "Este slug está reservado y no puede ser usado",
  },
  domain: {
    required: "El dominio es obligatorio",
    pattern: "El formato del dominio no es válido",
    reserved: "Este dominio está reservado",
  },
  contactEmail: {
    required: "El email de contacto es obligatorio",
    pattern: "El formato del email no es válido",
  },
  plan: {
    required: "Debe seleccionar un plan",
    invalid: "El plan seleccionado no es válido",
  },
  maxUsers: {
    required: "El número máximo de usuarios es obligatorio",
    invalidNumber: "Debe ser un número válido",
    minValue: "Debe permitir al menos 1 usuario",
    exceedsPlan: "Excede el límite del plan seleccionado",
  },
  storageLimit: {
    required: "El límite de almacenamiento es obligatorio",
    invalidNumber: "Debe ser un número válido",
    minValue: "Debe permitir al menos 1 GB",
    exceedsPlan: "Excede el límite del plan seleccionado",
  },
  billingEmail: {
    pattern: "El formato del email de facturación no es válido",
  },
  expiresAt: {
    invalidDate: "La fecha de expiración no es válida",
    pastDate: "La fecha de expiración no puede ser anterior a hoy",
  },
  contactPerson: {
    required: "El nombre de la persona de contacto es obligatorio",
    minLength: "El nombre debe tener al menos 2 caracteres",
  },
  phone: {
    required: "El teléfono es obligatorio",
    pattern: "El formato del teléfono no es válido",
  },
  address: {
    required: "La dirección es obligatoria",
    minLength: "La dirección debe tener al menos 5 caracteres",
  },
  city: {
    required: "La ciudad es obligatoria",
    minLength: "La ciudad debe tener al menos 2 caracteres",
  },
  country: {
    required: "El país es obligatorio",
    minLength: "El país debe tener al menos 2 caracteres",
  },
  postalCode: {
    required: "El código postal es obligatorio",
    pattern: "El formato del código postal no es válido",
  },
  primaryColor: {
    pattern: "El color primario debe ser un código hex válido",
  },
  secondaryColor: {
    pattern: "El color secundario debe ser un código hex válido",
  },
};

// Slugs reservados
const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'apps', 'assets', 'auth', 'blog', 'cdn', 'dashboard',
  'dev', 'docs', 'ftp', 'help', 'home', 'mail', 'main', 'manage', 'master',
  'media', 'my', 'new', 'news', 'old', 'portal', 'root', 'staging', 'static',
  'store', 'support', 'test', 'testing', 'www', 'secure', 'ssl', 'vpn'
];

// Dominios reservados
const RESERVED_DOMAINS = [
  'localhost', 'admin.', 'api.', 'app.', 'apps.', 'cdn.', 'dev.', 'ftp.',
  'mail.', 'secure.', 'ssl.', 'staging.', 'test.', 'www.'
];

// Funciones de validación individuales
export const validateTenantName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return TenantValidationRules.name.required;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return TenantValidationRules.name.minLength;
  }

  if (trimmedName.length > 100) {
    return TenantValidationRules.name.maxLength;
  }

  return null;
};

export const validateTenantSlug = (slug: string): string | null => {
  if (!slug || !slug.trim()) {
    return TenantValidationRules.slug.required;
  }

  const trimmedSlug = slug.trim().toLowerCase();

  if (trimmedSlug.length < 3) {
    return TenantValidationRules.slug.minLength;
  }

  if (trimmedSlug.length > 50) {
    return TenantValidationRules.slug.maxLength;
  }

  // Solo letras, números y guiones
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(trimmedSlug)) {
    return TenantValidationRules.slug.pattern;
  }

  // Verificar slugs reservados
  if (RESERVED_SLUGS.includes(trimmedSlug)) {
    return TenantValidationRules.slug.reserved;
  }

  return null;
};

export const validateTenantDomain = (domain: string): string | null => {
  if (!domain || !domain.trim()) {
    return TenantValidationRules.domain.required;
  }

  const trimmedDomain = domain.trim().toLowerCase();

  // Patrón básico para dominios
  const domainPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;
  if (!domainPattern.test(trimmedDomain)) {
    return TenantValidationRules.domain.pattern;
  }

  // Verificar dominios reservados
  const hasReservedPrefix = RESERVED_DOMAINS.some(reserved => 
    trimmedDomain.startsWith(reserved)
  );
  if (hasReservedPrefix) {
    return TenantValidationRules.domain.reserved;
  }

  return null;
};

export const validateEmail = (email: string, required: boolean = true): string | null => {
  if (!email || !email.trim()) {
    return required ? TenantValidationRules.contactEmail.required : null;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return TenantValidationRules.contactEmail.pattern;
  }

  return null;
};

export const validateTenantPlan = (plan: string): string | null => {
  if (!plan) {
    return TenantValidationRules.plan.required;
  }

  if (!Object.values(TenantPlan).includes(plan as TenantPlan)) {
    return TenantValidationRules.plan.invalid;
  }

  return null;
};

export const validateMaxUsers = (maxUsers: string, plan: TenantPlan): string | null => {
  if (!maxUsers || !maxUsers.trim()) {
    return TenantValidationRules.maxUsers.required;
  }

  const maxUsersNumber = Number(maxUsers);

  if (isNaN(maxUsersNumber)) {
    return TenantValidationRules.maxUsers.invalidNumber;
  }

  if (maxUsersNumber < 1) {
    return TenantValidationRules.maxUsers.minValue;
  }

  return null;
};

export const validateStorageLimit = (storageLimit: string, plan: TenantPlan): string | null => {
  if (!storageLimit || !storageLimit.trim()) {
    return TenantValidationRules.storageLimit.required;
  }

  const storageLimitNumber = Number(storageLimit);

  if (isNaN(storageLimitNumber)) {
    return TenantValidationRules.storageLimit.invalidNumber;
  }

  if (storageLimitNumber < 1) {
    return TenantValidationRules.storageLimit.minValue;
  }

  return null;
};

export const validateExpirationDate = (expiresAt: string): string | null => {
  if (!expiresAt || !expiresAt.trim()) {
    return null; // La fecha de expiración es opcional
  }

  const expirationDate = new Date(expiresAt);

  if (isNaN(expirationDate.getTime())) {
    return TenantValidationRules.expiresAt.invalidDate;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expirationDate < today) {
    return TenantValidationRules.expiresAt.pastDate;
  }

  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return TenantValidationRules.phone.required;
  }

  // Patrón básico para teléfonos internacionales
  const phonePattern = /^\+?[\d\s\-\(\)]{7,20}$/;
  if (!phonePattern.test(phone.trim())) {
    return TenantValidationRules.phone.pattern;
  }

  return null;
};

export const validatePostalCode = (postalCode: string, country: string): string | null => {
  if (!postalCode || !postalCode.trim()) {
    return TenantValidationRules.postalCode.required;
  }

  // Patrones básicos por país (se puede expandir)
  const patterns: { [key: string]: RegExp } = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
    ES: /^\d{5}$/,
    // Patrón genérico para otros países
    default: /^[\w\s-]{3,10}$/
  };

  const pattern = patterns[country.toUpperCase()] || patterns.default;
  if (!pattern.test(postalCode.trim())) {
    return TenantValidationRules.postalCode.pattern;
  }

  return null;
};

export const validateHexColor = (color: string): string | null => {
  if (!color || !color.trim()) {
    return null; // Los colores son opcionales
  }

  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexPattern.test(color.trim())) {
    return TenantValidationRules.primaryColor.pattern;
  }

  return null;
};

// Validación completa del formulario de tenant
export const validateTenantForm = (formData: TenantFormData): TenantValidationResult => {
  const errors: TenantValidationError[] = [];

  // Validar campos básicos
  const nameError = validateTenantName(formData.name);
  if (nameError) {
    errors.push({ field: 'name', message: nameError });
  }

  const slugError = validateTenantSlug(formData.slug);
  if (slugError) {
    errors.push({ field: 'slug', message: slugError });
  }

  const domainError = validateTenantDomain(formData.domain);
  if (domainError) {
    errors.push({ field: 'domain', message: domainError });
  }

  const contactEmailError = validateEmail(formData.contactEmail, true);
  if (contactEmailError) {
    errors.push({ field: 'contactEmail', message: contactEmailError });
  }

  const planError = validateTenantPlan(formData.plan);
  if (planError) {
    errors.push({ field: 'plan', message: planError });
  }

  // Validar límites con el plan seleccionado
  const maxUsersError = validateMaxUsers(formData.maxUsers, formData.plan);
  if (maxUsersError) {
    errors.push({ field: 'maxUsers', message: maxUsersError });
  }

  const storageLimitError = validateStorageLimit(formData.storageLimit, formData.plan);
  if (storageLimitError) {
    errors.push({ field: 'storageLimit', message: storageLimitError });
  }

  // Validar email de facturación (opcional)
  if (formData.billingEmail) {
    const billingEmailError = validateEmail(formData.billingEmail, false);
    if (billingEmailError) {
      errors.push({ field: 'billingEmail', message: billingEmailError });
    }
  }

  // Validar fecha de expiración (opcional)
  if (formData.expiresAt) {
    const expirationError = validateExpirationDate(formData.expiresAt);
    if (expirationError) {
      errors.push({ field: 'expiresAt', message: expirationError });
    }
  }

  // Validar información de contacto
  const contactPersonError = validateTenantName(formData.contactPerson);
  if (contactPersonError) {
    errors.push({ field: 'contactPerson', message: contactPersonError });
  }

  const phoneError = validatePhone(formData.phone);
  if (phoneError) {
    errors.push({ field: 'phone', message: phoneError });
  }

  // Validar dirección
  if (!formData.address?.trim()) {
    errors.push({ field: 'address', message: TenantValidationRules.address.required });
  } else if (formData.address.trim().length < 5) {
    errors.push({ field: 'address', message: TenantValidationRules.address.minLength });
  }

  // if (!formData.city?.trim()) {
  //   errors.push({ field: 'city', message: TenantValidationRules.city.required });
  // } else if (formData.city.trim().length < 2) {
  //   errors.push({ field: 'city', message: TenantValidationRules.city.minLength });
  // }

  // if (!formData.country?.trim()) {
  //   errors.push({ field: 'country', message: TenantValidationRules.country.required });
  // } else if (formData.country.trim().length < 2) {
  //   errors.push({ field: 'country', message: TenantValidationRules.country.minLength });
  // }

  // const postalCodeError = validatePostalCode(formData.postalCode, formData.country);
  // if (postalCodeError) {
  //   errors.push({ field: 'postalCode', message: postalCodeError });
  // }

  // Validar colores (opcionales)
  if (formData.primaryColor) {
    const primaryColorError = validateHexColor(formData.primaryColor);
    if (primaryColorError) {
      errors.push({ field: 'primaryColor', message: primaryColorError });
    }
  }

  if (formData.secondaryColor) {
    const secondaryColorError = validateHexColor(formData.secondaryColor);
    if (secondaryColorError) {
      errors.push({ field: 'secondaryColor', message: secondaryColorError });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función para validar FormData (para usar en actions de Remix)
export const validateTenantFormData = (formData: FormData): TenantValidationResult => {
  const tenantData: TenantFormData = {
    name: formData.get('name') as string || '',
    slug: formData.get('slug') as string || '',
    domain: formData.get('domain') as string || '',
    contactEmail: formData.get('contactEmail') as string || '',
    plan: formData.get('plan') as TenantPlan || TenantPlan.FREE,
    maxUsers: formData.get('maxUsers') as string || '',
    storageLimit: formData.get('storageLimit') as string || '',
    billingEmail: formData.get('billingEmail') as string || '',
    expiresAt: formData.get('expiresAt') as string || '',
    features: formData.getAll('features') as string[],
    status: formData.get('status') === 'on',

    adminFirstName: formData.get('adminFirstName') as string || '',
    adminLastName: formData.get('adminLastName') as string || '',
    adminPassword: formData.get('adminPassword') as string || '',
    adminEmail: formData.get('adminEmail') as string || '',
    url_portal: formData.get('url_portal') as string || '',
    nit: formData.get('nit') as string || '',
    
    contactPerson: formData.get('contactPerson') as string || '',
    phone: formData.get('phone') as string || '',
    address: formData.get('address') as string || '',
    city: formData.get('city') as string || '',
    country: formData.get('country') as string || '',
    postalCode: formData.get('postalCode') as string || '',
    
    primaryColor: formData.get('primaryColor') as string || '',
    secondaryColor: formData.get('secondaryColor') as string || '',
    timezone: formData.get('timezone') as string || '',
    language: formData.get('language') as string || '',
    currency: formData.get('currency') as string || '',
  };

  return validateTenantForm(tenantData);
};

// Utilidad para obtener errores por campo
// Reemplaza tu función por esta:
export const getTenantErrorByField = (
  errors: Record<string, string>,
  field: keyof TenantFormData
): string | null => {
  return errors[field] || null;
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

// Validar que el slug sea válido
export const validateSlug = (slug: string): string | null => {
  if (!slug) return 'El slug es requerido';
  if (slug.length < 2) return 'El slug debe tener al menos 2 caracteres';
  if (slug.length > 50) return 'El slug no puede tener más de 50 caracteres';
  if (!/^[a-z0-9-]+$/.test(slug)) return 'El slug solo puede contener letras minúsculas, números y guiones';
  if (slug.startsWith('-') || slug.endsWith('-')) return 'El slug no puede empezar o terminar con guión';
  if (slug.includes('--')) return 'El slug no puede contener guiones consecutivos';
  return null;
};