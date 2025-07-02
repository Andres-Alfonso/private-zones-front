// app/api/types/user.types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Información del perfil
  profile?: UserProfile;
  
  // Información de actividad
  loginCount: number;
  lastIpAddress?: string;
  twoFactorEnabled: boolean;
  
  // Información del tenant
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
    domain: string;
  };
}

export interface UserProfile {
  id: string;
  userId: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  timezone?: string;
  language: string;
  dateFormat: string;
  preferredCurrency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface CreateUserRequest {
  email: string;
  name: string;
  lastName: string;
  password: string;
  roles: string[];
  isActive?: boolean;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  
  // Información del perfil
  jobTitle?: string;
  department?: string;
  location?: string;
  timezone?: string;
  language?: string;
  
  // Configuración inicial
  sendWelcomeEmail?: boolean;
  requirePasswordChange?: boolean;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  password?: string;
  currentPassword?: string; // Para cambios de contraseña del usuario
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  department?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'loginCount';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersWithTwoFactor: number;
  newUsersThisMonth: number;
  averageLoginCount: number;
  topRoles: Array<{
    role: string;
    count: number;
  }>;
  topDepartments: Array<{
    department: string;
    count: number;
  }>;
}

// Validación
export interface UserFormData {
  email: string;
  name: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  roles: string[];
  isActive: boolean;
  phone: string;
  dateOfBirth: string;
  bio: string;
  jobTitle: string;
  department: string;
  location: string;
  timezone: string;
  language: string;
  sendWelcomeEmail: boolean;
  requirePasswordChange: boolean;
}

export interface UserValidationError {
  field: keyof UserFormData;
  message: string;
}

// Estados y tipos auxiliares
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
}

// Constantes
export const USER_ROLES = [
  { value: UserRole.ADMIN, label: 'Administrador', description: 'Acceso completo al sistema' },
  { value: UserRole.MODERATOR, label: 'Moderador', description: 'Gestión de contenido y usuarios' },
  { value: UserRole.INSTRUCTOR, label: 'Instructor', description: 'Creación y gestión de cursos' },
  { value: UserRole.STUDENT, label: 'Estudiante', description: 'Acceso a cursos y contenido' },
  { value: UserRole.VIEWER, label: 'Observador', description: 'Solo lectura' },
] as const;

export const USER_DEPARTMENTS = [
  'Tecnología',
  'Marketing',
  'Ventas',
  'Recursos Humanos',
  'Finanzas',
  'Operaciones',
  'Atención al Cliente',
  'Diseño',
  'Producto',
  'Legal',
  'Otro'
] as const;

export const USER_TIMEZONES = [
  { value: 'America/Bogota', label: 'Colombia (GMT-5)' },
  { value: 'America/Mexico_City', label: 'México (GMT-6)' },
  { value: 'America/Lima', label: 'Perú (GMT-5)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (GMT-3)' },
  { value: 'America/Santiago', label: 'Chile (GMT-3)' },
  { value: 'Europe/Madrid', label: 'España (GMT+1)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
] as const;

export const USER_LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
] as const;