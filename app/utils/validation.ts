// app/utils/validation.ts

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Reglas de validación
export const ValidationRules = {
  email: {
    required: "El correo electrónico es obligatorio",
    invalid: "El formato del correo electrónico no es válido",
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
export const validateLoginForm = (formData: FormData): ValidationResult => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: "password", message: passwordError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRegisterForm = (formData: FormData): ValidationResult => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const agreeTerms = formData.get("agree-terms") as string;

  const errors: ValidationError[] = [];

  // Validar email
  const emailError = validateEmail(email);
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }

  // Validar contraseña
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: "password", message: passwordError });
  }

  // Validar confirmación de contraseña
  const confirmPasswordError = validateConfirmPassword(
    password,
    confirmPassword
  );
  if (confirmPasswordError) {
    errors.push({ field: "confirm-password", message: confirmPasswordError });
  }

  // Validar nombre
  const firstNameError = validateName(firstName);
  if (firstNameError) {
    errors.push({ field: "first-name", message: firstNameError });
  }

  // Validar apellido
  const lastNameError = validateName(lastName);
  if (lastNameError) {
    errors.push({ field: "last-name", message: lastNameError });
  }

  // Validar términos y condiciones
  if (!agreeTerms) {
    errors.push({
      field: "agree-terms",
      message: "Debes aceptar los términos y condiciones",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utilidad para obtener errores por campo
export const getErrorByField = (
  errors: ValidationError[],
  field: string
): string | null => {
  const error = errors.find((err) => err.field === field);
  return error ? error.message : null;
};
