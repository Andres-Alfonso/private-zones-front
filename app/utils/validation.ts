// app/utils/validation.ts

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface TenantConfig {
  requireLastName: boolean;
  requirePhone: boolean;
  requireDocumentType: boolean;
  requireDocument: boolean;
  requireOrganization: boolean;
  requirePosition: boolean;
  requireGender: boolean;
  requireCity: boolean;
  requireAddress: boolean;
}

// Reglas de validación
export const ValidationRules = {
  email: {
    required: "El correo electrónico es obligatorio",
    invalid: "El formato del correo electrónico no es válido",
  },
  document: {
    required: "El documento es requerido",
    invalid: "El documento debe contener solo números (5-20 dígitos)"
  },
  password: {
    required: "La contraseña es obligatoria",
    minLength: "La contraseña debe tener al menos 8 caracteres",
    weak: "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
  },
  name: {
    required: "El nombre es obligatorio",
    minLength: "El nombre debe tener al menos 2 caracteres",
    maxLength: "El nombre no puede tener más de 50 caracteres",
  },
  confirmPassword: {
    required: "Debes confirmar la contraseña",
    notMatch: "Las contraseñas no coinciden",
  },
};

// Funciones de validación individuales
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return ValidationRules.email.required;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return ValidationRules.email.invalid;
  }

  return null;
};

export const validateDocument = (document: string): string | null => {
  if (!document || document.trim() === '') {
    return ValidationRules.document.required;
  }
  
  // Validar que solo contenga números y tenga entre 5 y 20 caracteres
  const documentRegex = /^[0-9]{5,20}$/;
  if (!documentRegex.test(document.trim())) {
    return ValidationRules.document.invalid;
  }
  
  return null;
};

// Validar si es email o documento
export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return ValidationRules.password.required;
  }

  if (password.length < 8) {
    return ValidationRules.password.minLength;
  }

  // Al menos una mayúscula, una minúscula y un número
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!strongPasswordRegex.test(password)) {
    return ValidationRules.password.weak;
  }

  return null;
};

export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return ValidationRules.name.required;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return ValidationRules.name.minLength;
  }

  if (trimmedName.length > 50) {
    return ValidationRules.name.maxLength;
  }

  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return ValidationRules.confirmPassword.required;
  }

  if (password !== confirmPassword) {
    return ValidationRules.confirmPassword.notMatch;
  }

  return null;
};

// Validadores para formularios completos
export const validateLoginForm = (
  formData: FormData, 
  loginMethod: 'email' | 'document' | 'both' = 'email'
): ValidationResult => {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  const errors: ValidationError[] = [];

  // Validar el identificador según el loginMethod
  if (!identifier || identifier.trim() === '') {
    const fieldName = loginMethod === 'document' ? 'documento' : 
                     loginMethod === 'email' ? 'correo electrónico' : 
                     'documento o correo electrónico';
    errors.push({ 
      field: "identifier", 
      message: `El ${fieldName} es requerido` 
    });
  } else {
    // Validar según el método de login configurado
    switch(loginMethod) {
      case 'document':
        const documentError = validateDocument(identifier);
        if (documentError) {
          errors.push({ field: "identifier", message: documentError });
        }
        break;
        
      case 'email':
        const emailError = validateEmail(identifier);
        if (emailError) {
          errors.push({ field: "identifier", message: emailError });
        }
        break;
        
      case 'both':
        // Validar si es email o documento
        const isEmailFormat = isEmail(identifier);
        
        if (isEmailFormat) {
          const emailError = validateEmail(identifier);
          if (emailError) {
            errors.push({ field: "identifier", message: emailError });
          }
        } else {
          const documentError = validateDocument(identifier);
          if (documentError) {
            errors.push({ 
              field: "identifier", 
              message: "Debe ingresar un correo electrónico válido o un documento válido (5-20 dígitos numéricos)" 
            });
          }
        }
        break;
    }
  }

  // Validar contraseña
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: "password", message: passwordError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export function validateRegisterForm(
  formData: FormData, 
  tenantConfig?: TenantConfig
): ValidationResult {
  const errors: ValidationError[] = [];

  // Obtener valores del formulario
  const firstName = formData.get('first-name') as string;
  const lastName = formData.get('last-name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm-password') as string;
  const phone = formData.get('phone') as string;
  const documentType = formData.get('document-type') as string;
  const document = formData.get('document') as string;
  const organization = formData.get('organization') as string;
  const position = formData.get('position') as string;
  const gender = formData.get('gender') as string;
  const city = formData.get('city') as string;
  const address = formData.get('address') as string;
  const agreeTerms = formData.get('agree-terms') as string;

  // Validación de nombre (siempre requerido)
  if (!firstName || firstName.trim().length === 0) {
    errors.push({
      field: 'first-name',
      message: 'El nombre es requerido'
    });
  } else if (firstName.trim().length < 2) {
    errors.push({
      field: 'first-name',
      message: 'El nombre debe tener al menos 2 caracteres'
    });
  } else if (firstName.trim().length > 50) {
    errors.push({
      field: 'first-name',
      message: 'El nombre no puede tener más de 50 caracteres'
    });
  }

  // Validación de apellido (si es requerido)
  if (tenantConfig?.requireLastName) {
    if (!lastName || lastName.trim().length === 0) {
      errors.push({
        field: 'last-name',
        message: 'El apellido es requerido'
      });
    } else if (lastName.trim().length < 2) {
      errors.push({
        field: 'last-name',
        message: 'El apellido debe tener al menos 2 caracteres'
      });
    } else if (lastName.trim().length > 50) {
      errors.push({
        field: 'last-name',
        message: 'El apellido no puede tener más de 50 caracteres'
      });
    }
  }

  // Validación de email (siempre requerido)
  if (!email || email.trim().length === 0) {
    errors.push({
      field: 'email',
      message: 'El correo electrónico es requerido'
    });
  } else if (!isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Ingresa un correo electrónico válido'
    });
  }

  // Validación de contraseña (siempre requerida)
  if (!password || password.length === 0) {
    errors.push({
      field: 'password',
      message: 'La contraseña es requerida'
    });
  } else if (!isValidPassword(password)) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
    });
  }

  // Validación de confirmación de contraseña
  if (!confirmPassword || confirmPassword.length === 0) {
    errors.push({
      field: 'confirm-password',
      message: 'Confirma tu contraseña'
    });
  } else if (password !== confirmPassword) {
    errors.push({
      field: 'confirm-password',
      message: 'Las contraseñas no coinciden'
    });
  }

  // Validación de teléfono (si es requerido)
  if (tenantConfig?.requirePhone) {
    if (!phone || phone.trim().length === 0) {
      errors.push({
        field: 'phone',
        message: 'El teléfono es requerido'
      });
    } else if (!isValidPhone(phone)) {
      errors.push({
        field: 'phone',
        message: 'Ingresa un número de teléfono válido'
      });
    }
  }

  // Validación de tipo de identificación (si es requerido)
  if (tenantConfig?.requireDocumentType) {
    if (!documentType || documentType.trim().length === 0) {
      errors.push({
        field: 'document-type',
        message: 'El tipo de identificación es requerido'
      });
    }
  }

  // Validación de número de identificación (si es requerido)
  if (tenantConfig?.requireDocument) {
    if (!document || document.trim().length === 0) {
      errors.push({
        field: 'document',
        message: 'El número de identificación es requerido'
      });
    } else if (document.trim().length < 3) {
      errors.push({
        field: 'document',
        message: 'El número de identificación debe tener al menos 3 caracteres'
      });
    } else if (document.trim().length > 20) {
      errors.push({
        field: 'document',
        message: 'El número de identificación no puede tener más de 20 caracteres'
      });
    }
  }

  // Validación de organización (si es requerida)
  if (tenantConfig?.requireOrganization) {
    if (!organization || organization.trim().length === 0) {
      errors.push({
        field: 'organization',
        message: 'La organización es requerida'
      });
    } else if (organization.trim().length < 2) {
      errors.push({
        field: 'organization',
        message: 'La organización debe tener al menos 2 caracteres'
      });
    }
  }

  // Validación de cargo (si es requerido)
  if (tenantConfig?.requirePosition) {
    if (!position || position.trim().length === 0) {
      errors.push({
        field: 'position',
        message: 'El cargo es requerido'
      });
    } else if (position.trim().length < 2) {
      errors.push({
        field: 'position',
        message: 'El cargo debe tener al menos 2 caracteres'
      });
    }
  }

  // Validación de género (si es requerido)
  if (tenantConfig?.requireGender) {
    if (!gender || gender.trim().length === 0) {
      errors.push({
        field: 'gender',
        message: 'El género es requerido'
      });
    }
  }

  // Validación de ciudad (si es requerida)
  if (tenantConfig?.requireCity) {
    if (!city || city.trim().length === 0) {
      errors.push({
        field: 'city',
        message: 'La ciudad es requerida'
      });
    } else if (city.trim().length < 2) {
      errors.push({
        field: 'city',
        message: 'La ciudad debe tener al menos 2 caracteres'
      });
    }
  }

  // Validación de dirección (si es requerida)
  if (tenantConfig?.requireAddress) {
    if (!address || address.trim().length === 0) {
      errors.push({
        field: 'address',
        message: 'La dirección es requerida'
      });
    } else if (address.trim().length < 5) {
      errors.push({
        field: 'address',
        message: 'La dirección debe tener al menos 5 caracteres'
      });
    }
  }

  // Validación de términos y condiciones (siempre requerido)
  if (!agreeTerms || agreeTerms !== 'on') {
    errors.push({
      field: 'agree-terms',
      message: 'Debes aceptar los términos y condiciones'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función auxiliar para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función auxiliar para validar contraseña
function isValidPassword(password: string): boolean {
  // Al menos 8 caracteres, una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Función auxiliar para validar teléfono
function isValidPhone(phone: string): boolean {
  // Acepta varios formatos de teléfono
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Función auxiliar para obtener error por campo
// export function getErrorByField(errors: ValidationError[], fieldName: string): string | undefined {
//   const error = errors.find(error => error.field === fieldName);
//   return error?.message;
// }

// Utilidad para obtener errores por campo
export const getErrorByField = (
  errors: ValidationError[],
  field: string
): string | null => {
  const error = errors.find((err) => err.field === field);
  return error ? error.message : null;
};
