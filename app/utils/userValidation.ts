// app/utils/userValidation.ts

import { UserFormData, UserValidationError, UserRole } from '~/api/types/user.types';

export interface UserValidationResult {
  isValid: boolean;
  errors: UserValidationError[];
}

// Reglas de validación específicas para usuarios
export const UserValidationRules = {
  email: {
    required: "El email es obligatorio",
    invalid: "El formato del email no es válido",
    exists: "Este email ya está en uso",
  },
  name: {
    required: "El nombre es obligatorio",
    minLength: "El nombre debe tener al menos 2 caracteres",
    maxLength: "El nombre no puede tener más de 50 caracteres",
  },
  lastName: {
    required: "El apellido es obligatorio",
    minLength: "El apellido debe tener al menos 2 caracteres",
    maxLength: "El apellido no puede tener más de 50 caracteres",
  },
  password: {
    required: "La contraseña es obligatoria",
    minLength: "La contraseña debe tener al menos 8 caracteres",
    weak: "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
    noSpecialChars: "La contraseña debe contener al menos un carácter especial",
  },
  confirmPassword: {
    required: "Debes confirmar la contraseña",
    notMatch: "Las contraseñas no coinciden",
  },
  roles: {
    required: "Debe asignar al menos un rol",
    invalid: "Uno o más roles no son válidos",
  },
  phone: {
    invalid: "El formato del teléfono no es válido",
  },
  dateOfBirth: {
    invalid: "La fecha de nacimiento no es válida",
    future: "La fecha de nacimiento no puede ser futura",
    tooOld: "La fecha de nacimiento no puede ser anterior a 1900",
  },
  bio: {
    maxLength: "La biografía no puede tener más de 500 caracteres",
  },
  jobTitle: {
    maxLength: "El cargo no puede tener más de 100 caracteres",
  },
  department: {
    maxLength: "El departamento no puede tener más de 100 caracteres",
  },
  location: {
    maxLength: "La ubicación no puede tener más de 100 caracteres",
  },
};

// Funciones de validación individuales
export const validateUserEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return UserValidationRules.email.required;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return UserValidationRules.email.invalid;
  }

  return null;
};

export const validateUserName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return UserValidationRules.name.required;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return UserValidationRules.name.minLength;
  }

  if (trimmedName.length > 50) {
    return UserValidationRules.name.maxLength;
  }

  return null;
};

export const validateUserLastName = (lastName: string): string | null => {
  if (!lastName || !lastName.trim()) {
    return UserValidationRules.lastName.required;
  }

  const trimmedLastName = lastName.trim();

  if (trimmedLastName.length < 2) {
    return UserValidationRules.lastName.minLength;
  }

  if (trimmedLastName.length > 50) {
    return UserValidationRules.lastName.maxLength;
  }

  return null;
};

export const validateUserPassword = (password: string, isRequired: boolean = true): string | null => {
  if (!password || !password.trim()) {
    return isRequired ? UserValidationRules.password.required : null;
  }

  if (password.length < 8) {
    return UserValidationRules.password.minLength;
  }

  // Al menos una mayúscula, una minúscula y un número
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!strongPasswordRegex.test(password)) {
    return UserValidationRules.password.weak;
  }

  // Al menos un carácter especial
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/;
  if (!specialCharRegex.test(password)) {
    return UserValidationRules.password.noSpecialChars;
  }

  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return UserValidationRules.confirmPassword.required;
  }

  if (password !== confirmPassword) {
    return UserValidationRules.confirmPassword.notMatch;
  }

  return null;
};

export const validateUserRoles = (roles: string[]): string | null => {
  if (!roles || roles.length === 0) {
    return UserValidationRules.roles.required;
  }

  const validRoles = Object.values(UserRole);
  const invalidRoles = roles.filter(role => !validRoles.includes(role as UserRole));
  
  if (invalidRoles.length > 0) {
    return UserValidationRules.roles.invalid;
  }

  return null;
};

export const validateUserPhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return null; // El teléfono es opcional
  }

  // Patrón básico para teléfonos internacionales
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
  if (!phoneRegex.test(phone.trim())) {
    return UserValidationRules.phone.invalid;
  }

  return null;
};

export const validateDateOfBirth = (dateOfBirth: string): string | null => {
  if (!dateOfBirth || !dateOfBirth.trim()) {
    return null; // La fecha de nacimiento es opcional
  }

  const birthDate = new Date(dateOfBirth);

  if (isNaN(birthDate.getTime())) {
    return UserValidationRules.dateOfBirth.invalid;
  }

  const today = new Date();
  if (birthDate > today) {
    return UserValidationRules.dateOfBirth.future;
  }

  const year1900 = new Date('1900-01-01');
  if (birthDate < year1900) {
    return UserValidationRules.dateOfBirth.tooOld;
  }

  return null;
};

export const validateUserBio = (bio: string): string | null => {
  if (!bio || !bio.trim()) {
    return null; // La biografía es opcional
  }

  if (bio.trim().length > 500) {
    return UserValidationRules.bio.maxLength;
  }

  return null;
};

export const validateJobTitle = (jobTitle: string): string | null => {
  if (!jobTitle || !jobTitle.trim()) {
    return null; // El cargo es opcional
  }

  if (jobTitle.trim().length > 100) {
    return UserValidationRules.jobTitle.maxLength;
  }

  return null;
};

export const validateDepartment = (department: string): string | null => {
  if (!department || !department.trim()) {
    return null; // El departamento es opcional
  }

  if (department.trim().length > 100) {
    return UserValidationRules.department.maxLength;
  }

  return null;
};

export const validateLocation = (location: string): string | null => {
  if (!location || !location.trim()) {
    return null; // La ubicación es opcional
  }

  if (location.trim().length > 100) {
    return UserValidationRules.location.maxLength;
  }

  return null;
};

// Validación completa del formulario de usuario
export const validateUserForm = (formData: UserFormData, isEdit: boolean = false): UserValidationResult => {
  const errors: UserValidationError[] = [];

  // Validar email
  const emailError = validateUserEmail(formData.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  // Validar nombre
  const nameError = validateUserName(formData.name);
  if (nameError) {
    errors.push({ field: 'name', message: nameError });
  }

  // Validar apellido
  const lastNameError = validateUserLastName(formData.lastName);
  if (lastNameError) {
    errors.push({ field: 'lastName', message: lastNameError });
  }

  // Validar contraseña (solo si es requerida)
  const isPasswordRequired = !isEdit || (formData.password && formData.password.trim() !== '');
  const passwordError = validateUserPassword(formData.password, isPasswordRequired);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  // Validar confirmación de contraseña (solo si hay contraseña)
  if (formData.password && formData.password.trim() !== '') {
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) {
      errors.push({ field: 'confirmPassword', message: confirmPasswordError });
    }
  }

  // Validar roles
  const rolesError = validateUserRoles(formData.roles);
  if (rolesError) {
    errors.push({ field: 'roles', message: rolesError });
  }

  // Validar campos opcionales
  const phoneError = validateUserPhone(formData.phone);
  if (phoneError) {
    errors.push({ field: 'phone', message: phoneError });
  }

  const dateOfBirthError = validateDateOfBirth(formData.dateOfBirth);
  if (dateOfBirthError) {
    errors.push({ field: 'dateOfBirth', message: dateOfBirthError });
  }

  const bioError = validateUserBio(formData.bio);
  if (bioError) {
    errors.push({ field: 'bio', message: bioError });
  }

  const jobTitleError = validateJobTitle(formData.jobTitle);
  if (jobTitleError) {
    errors.push({ field: 'jobTitle', message: jobTitleError });
  }

  const departmentError = validateDepartment(formData.department);
  if (departmentError) {
    errors.push({ field: 'department', message: departmentError });
  }

  const locationError = validateLocation(formData.location);
  if (locationError) {
    errors.push({ field: 'location', message: locationError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función para validar FormData (para usar en actions de Remix)
export const validateUserFormData = (formData: FormData, isEdit: boolean = false): UserValidationResult => {
  const userData: UserFormData = {
    email: formData.get('email') as string || '',
    name: formData.get('name') as string || '',
    lastName: formData.get('lastName') as string || '',
    password: formData.get('password') as string || '',
    confirmPassword: formData.get('confirmPassword') as string || '',
    roles: formData.getAll('roles') as string[],
    isActive: formData.get('isActive') === 'on',
    phone: formData.get('phone') as string || '',
    dateOfBirth: formData.get('dateOfBirth') as string || '',
    bio: formData.get('bio') as string || '',
    jobTitle: formData.get('jobTitle') as string || '',
    department: formData.get('department') as string || '',
    location: formData.get('location') as string || '',
    timezone: formData.get('timezone') as string || '',
    language: formData.get('language') as string || '',
    sendWelcomeEmail: formData.get('sendWelcomeEmail') === 'on',
    requirePasswordChange: formData.get('requirePasswordChange') === 'on',
  };

  return validateUserForm(userData, isEdit);
};

// Utilidad para obtener errores por campo
export const getUserErrorByField = (
  errors: UserValidationError[],
  field: keyof UserFormData
): string | null => {
  const error = errors.find((err) => err.field === field);
  return error ? error.message : null;
};

// Funciones de utilidad adicionales
export const formatUserName = (user: { name: string; lastName: string }): string => {
  return `${user.name} ${user.lastName}`.trim();
};

export const formatUserRoles = (roles: string[]): string => {
  return roles.map(role => 
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  ).join(', ');
};

export const calculateUserAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) return null;
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const isUserActive = (user: { isActive: boolean; lastLoginAt?: string }): boolean => {
  if (!user.isActive) return false;
  
  // Considerar activo si se conectó en los últimos 30 días
  if (!user.lastLoginAt) return false;
  
  const lastLogin = new Date(user.lastLoginAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return lastLogin > thirtyDaysAgo;
};

export const getUserStatus = (user: { isActive: boolean; isEmailVerified: boolean; lastLoginAt?: string }): {
  status: 'active' | 'inactive' | 'pending' | 'dormant';
  label: string;
  color: string;
} => {
  if (!user.isActive) {
    return { status: 'inactive', label: 'Inactivo', color: 'bg-red-100 text-red-800' };
  }
  
  if (!user.isEmailVerified) {
    return { status: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
  }
  
  if (!user.lastLoginAt) {
    return { status: 'pending', label: 'Sin activar', color: 'bg-gray-100 text-gray-800' };
  }
  
  const lastLogin = new Date(user.lastLoginAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  if (lastLogin < thirtyDaysAgo) {
    return { status: 'dormant', label: 'Inactivo', color: 'bg-orange-100 text-orange-800' };
  }
  
  return { status: 'active', label: 'Activo', color: 'bg-green-100 text-green-800' };
};

// Validación específica para campos de perfil
export const validateProfileData = (data: {
  jobTitle?: string;
  department?: string;
  location?: string;
  bio?: string;
}): UserValidationResult => {
  const errors: UserValidationError[] = [];

  if (data.jobTitle) {
    const jobTitleError = validateJobTitle(data.jobTitle);
    if (jobTitleError) {
      errors.push({ field: 'jobTitle', message: jobTitleError });
    }
  }

  if (data.department) {
    const departmentError = validateDepartment(data.department);
    if (departmentError) {
      errors.push({ field: 'department', message: departmentError });
    }
  }

  if (data.location) {
    const locationError = validateLocation(data.location);
    if (locationError) {
      errors.push({ field: 'location', message: locationError });
    }
  }

  if (data.bio) {
    const bioError = validateUserBio(data.bio);
    if (bioError) {
      errors.push({ field: 'bio', message: bioError });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};