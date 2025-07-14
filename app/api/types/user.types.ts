// app/api/types/user.types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  phoneNumber?: string; // Cambiado de 'phone' a 'phoneNumber' para coincidir con UserFormData
  dateOfBirth?: string;
  bio?: string;
  roleIds: string[]; // Cambiado de 'roles' a 'roleIds' para coincidir con UserFormData
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Información del perfil expandida
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

  // Campos adicionales del perfil para coincidir con UserFormData
  gender?: string;
  charge?: string;
  type_document?: string;
  documentNumber?: string;
  organization?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  
  // Información profesional
  jobTitle?: string;
  department?: string;
  location?: string;
  timezone?: string;
  language: string;
  dateFormat: string;
  preferredCurrency: string;
  
  // Información personal adicional
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  charge?: string;
  type_document?: string;
  documentNumber?: string;
  organization?: string;
  address?: string;
  city?: string;
  country?: string;
  
  // Notificaciones expandidas para coincidir con UserFormData
  notifications: {
    enableNotifications: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
    smsNotifications: boolean;
    browserNotifications: boolean;
    securityAlerts: boolean;
    accountUpdates: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
    newsletterEmails: boolean;
    reminders: boolean;
    mentions: boolean;
    directMessages: boolean;
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
  tenantId: string;
  roleIds: string[];
  isActive?: boolean;

  profileConfig: {
    // Información personal
    phoneNumber?: string;
    dateOfBirth?: string;
    bio?: string;
    gender?: string;
    charge?: string;
    type_document?: string;
    documentNumber?: string;
    organization?: string;
    address?: string;
    city?: string;
    country?: string;
  },

  // Información del perfil profesional
  // jobTitle?: string;
  // department?: string;
  // location?: string;
  // timezone?: string;
  // language?: string;

  // Configuración inicial
  // sendWelcomeEmail?: boolean;
  // requirePasswordChange?: boolean;

  notificationConfig: { 
    // Preferencias de notificación
    enableNotifications?: boolean;
    smsNotifications?: boolean;
    browserNotifications?: boolean;
    securityAlerts?: boolean;
    accountUpdates?: boolean;
    systemUpdates?: boolean;
    marketingEmails?: boolean;
    newsletterEmails?: boolean;
    reminders?: boolean;
    mentions?: boolean;
    directMessages?: boolean;
  },

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
  id?: string; // Agregado para edición
  email: string;
  name: string;
  lastName: string;
  password: string;
  tenantId: string;
  roleIds: string[];
  isActive?: boolean;

  profileConfig: {
    // Información personal
    phoneNumber?: string;
    dateOfBirth?: string;
    bio?: string;
    gender?: string;
    charge?: string;
    type_document?: string;
    documentNumber?: string;
    organization?: string;
    address?: string;
    city?: string;
    country?: string;
  };

  notificationConfig: { 
    // Preferencias de notificación
    enableNotifications?: boolean;
    smsNotifications?: boolean;
    browserNotifications?: boolean;
    securityAlerts?: boolean;
    accountUpdates?: boolean;
    systemUpdates?: boolean;
    marketingEmails?: boolean;
    newsletterEmails?: boolean;
    reminders?: boolean;
    mentions?: boolean;
    directMessages?: boolean;
  };
  
  // Campos de auditoría (solo lectura)
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// Función auxiliar para convertir User a UserFormData
export const userToFormData = (user: User): UserFormData => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    password: "", // Por seguridad, nunca cargar la contraseña
    tenantId: user.tenantId,
    roleIds: user.roleIds,
    isActive: user.isActive,
    
    profileConfig: {
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      bio: user.bio,
      gender: user.gender,
      charge: user.charge,
      type_document: user.type_document,
      documentNumber: user.documentNumber,
      organization: user.organization,
      address: user.address,
      city: user.city,
      country: user.country,
    },
    
    notificationConfig: {
      enableNotifications: user.profile?.notifications?.enableNotifications,
      smsNotifications: user.profile?.notifications?.smsNotifications,
      browserNotifications: user.profile?.notifications?.browserNotifications,
      securityAlerts: user.profile?.notifications?.securityAlerts,
      accountUpdates: user.profile?.notifications?.accountUpdates,
      systemUpdates: user.profile?.notifications?.systemUpdates,
      marketingEmails: user.profile?.notifications?.marketingEmails,
      newsletterEmails: user.profile?.notifications?.newsletterEmails,
      reminders: user.profile?.notifications?.reminders,
      mentions: user.profile?.notifications?.mentions,
      directMessages: user.profile?.notifications?.directMessages,
    },
    
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
};

// Función auxiliar para convertir UserFormData a User (para envío a API)
export const formDataToUser = (formData: UserFormData): Partial<User> => {
  return {
    id: formData.id,
    email: formData.email,
    name: formData.name,
    lastName: formData.lastName,
    tenantId: formData.tenantId,
    roleIds: formData.roleIds,
    isActive: formData.isActive,
    
    // Campos del perfil principal
    phoneNumber: formData.profileConfig.phoneNumber,
    dateOfBirth: formData.profileConfig.dateOfBirth,
    bio: formData.profileConfig.bio,
    gender: formData.profileConfig.gender,
    charge: formData.profileConfig.charge,
    type_document: formData.profileConfig.type_document,
    documentNumber: formData.profileConfig.documentNumber,
    organization: formData.profileConfig.organization,
    address: formData.profileConfig.address,
    city: formData.profileConfig.city,
    country: formData.profileConfig.country,
    
    // El perfil se actualizará por separado si es necesario
    profile: {
      notifications: {
        enableNotifications: formData.notificationConfig.enableNotifications ?? false,
        email: true, // Valor por defecto
        push: true, // Valor por defecto
        sms: formData.notificationConfig.smsNotifications ?? false,
        smsNotifications: formData.notificationConfig.smsNotifications ?? false,
        browserNotifications: formData.notificationConfig.browserNotifications ?? false,
        securityAlerts: formData.notificationConfig.securityAlerts ?? true,
        accountUpdates: formData.notificationConfig.accountUpdates ?? true,
        systemUpdates: formData.notificationConfig.systemUpdates ?? true,
        marketingEmails: formData.notificationConfig.marketingEmails ?? false,
        newsletterEmails: formData.notificationConfig.newsletterEmails ?? false,
        reminders: formData.notificationConfig.reminders ?? true,
        mentions: formData.notificationConfig.mentions ?? true,
        directMessages: formData.notificationConfig.directMessages ?? true,
      }
    } as UserProfile
  };
};

// Tipos para el loader - user debe ser UserFormData para el formulario
export interface EditLoaderData {
  user: UserFormData;
  tenants: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string; description?: string }>;
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