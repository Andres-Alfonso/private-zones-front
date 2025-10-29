// app/api/types/user.types.ts

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  password?: string; // Viene encriptada, no la usamos
  tenantId: string;
  isActive: boolean;
  roles: Array<{
    id: string;
    name: string;
    description?: string;
  }>; // En el backend viene como 'roles'
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Configuración de perfil con los nombres exactos del backend
  profileConfig?: {
    id?: string;
    user?: any;
    avatarPath?: string | null;
    bio?: string;
    phoneNumber?: string;
    type_document?: string;
    documentNumber?: string;
    organization?: string;
    charge?: string;
    genger?: string | null; // Typo en el backend
    City?: string | null;   // Mayúscula en el backend
    Country?: string | null; // Mayúscula en el backend
    address?: string;
    dateOfBirth?: Date | string;
    createdAt?: string;
    updatedAt?: string;
  };
  
  // Configuración de notificaciones del backend
  notificationConfig?: {
    id?: string;
    user?: any;
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
    createdAt?: string;
    updatedAt?: string;
  };
  
  // Información del tenant (opcional)
  tenant?: {
    id: string;
    name: string;
    slug?: string;
    domain?: string;
    contactEmail?: string;
    plan?: string;
  };
}

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
export const userToFormData = (backendUser: BackendUser): UserFormData => {
  console.log('Convirtiendo usuario del backend:', backendUser);
  
  // Formatear fecha de nacimiento
  const formatDateOfBirth = (date: Date | string | undefined | null): string => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    } catch {
      return '';
    }
  };

  // Manejar roles (viene como 'roles' en el backend, necesitamos 'roleIds')
  const roleIds = backendUser.roles?.map(role => role.id) || []

  const formData: UserFormData = {
    id: backendUser.id,
    email: backendUser.email || '',
    name: backendUser.name || '',
    lastName: backendUser.lastName || '',
    password: '', // Nunca cargar contraseña por seguridad
    tenantId: backendUser.tenantId || '',
    roleIds: roleIds,
    isActive: backendUser.isActive ?? true,
    
    // Mapear profileConfig corrigiendo inconsistencias del backend
    profileConfig: {
      phoneNumber: backendUser.profileConfig?.phoneNumber || '',
      dateOfBirth: formatDateOfBirth(backendUser.profileConfig?.dateOfBirth),
      bio: backendUser.profileConfig?.bio || '',
      gender: backendUser.profileConfig?.genger || '', // Corrigiendo typo del backend
      charge: backendUser.profileConfig?.charge || '',
      type_document: backendUser.profileConfig?.type_document || '',
      documentNumber: backendUser.profileConfig?.documentNumber || '',
      organization: backendUser.profileConfig?.organization || '',
      address: backendUser.profileConfig?.address || '',
      city: backendUser.profileConfig?.City || '', // Corrigiendo mayúscula del backend
      country: backendUser.profileConfig?.Country || '', // Corrigiendo mayúscula del backend
    },
    
    // Mapear notificationConfig con valores por defecto
    notificationConfig: {
      enableNotifications: backendUser.notificationConfig?.enableNotifications ?? true,
      smsNotifications: backendUser.notificationConfig?.smsNotifications ?? false,
      browserNotifications: backendUser.notificationConfig?.browserNotifications ?? false,
      securityAlerts: backendUser.notificationConfig?.securityAlerts ?? true,
      accountUpdates: backendUser.notificationConfig?.accountUpdates ?? false,
      systemUpdates: backendUser.notificationConfig?.systemUpdates ?? true,
      marketingEmails: backendUser.notificationConfig?.marketingEmails ?? false,
      newsletterEmails: backendUser.notificationConfig?.newsletterEmails ?? false,
      reminders: backendUser.notificationConfig?.reminders ?? true,
      mentions: backendUser.notificationConfig?.mentions ?? true,
      directMessages: backendUser.notificationConfig?.directMessages ?? true,
    },
    
    // Campos de auditoría
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    lastLoginAt: backendUser.lastLoginAt,
  };

  console.log('Usuario convertido para formulario:', formData);
  return formData;
};

// Función para convertir datos del formulario al formato que espera el backend
export const formDataToBackendUser = (formData: UserFormData): CreateUserRequest | UpdateUserRequest => {
  console.log('Convirtiendo formulario a formato backend:', formData);
  
  const backendData = {
    email: formData.email,
    name: formData.name,
    lastName: formData.lastName,
    tenantId: formData.tenantId,
    roleIds: formData.roleIds, // El backend espera 'roleIds' en las requests
    isActive: formData.isActive ?? true,
    
    profileConfig: {
      phoneNumber: formData.profileConfig?.phoneNumber || '',
      dateOfBirth: formData.profileConfig?.dateOfBirth || '',
      bio: formData.profileConfig?.bio || '',
      gender: formData.profileConfig?.gender || '', // Se envía como 'gender' al backend
      charge: formData.profileConfig?.charge || '',
      type_document: formData.profileConfig?.type_document || '',
      documentNumber: formData.profileConfig?.documentNumber || '',
      organization: formData.profileConfig?.organization || '',
      address: formData.profileConfig?.address || '',
      city: formData.profileConfig?.city || '', // Se envía como 'city' al backend
      country: formData.profileConfig?.country || '', // Se envía como 'country' al backend
    },
    
    notificationConfig: {
      enableNotifications: formData.notificationConfig?.enableNotifications ?? true,
      smsNotifications: formData.notificationConfig?.smsNotifications ?? false,
      browserNotifications: formData.notificationConfig?.browserNotifications ?? false,
      securityAlerts: formData.notificationConfig?.securityAlerts ?? true,
      accountUpdates: formData.notificationConfig?.accountUpdates ?? false,
      systemUpdates: formData.notificationConfig?.systemUpdates ?? true,
      marketingEmails: formData.notificationConfig?.marketingEmails ?? false,
      newsletterEmails: formData.notificationConfig?.newsletterEmails ?? false,
      reminders: formData.notificationConfig?.reminders ?? true,
      mentions: formData.notificationConfig?.mentions ?? true,
      directMessages: formData.notificationConfig?.directMessages ?? true,
    },
  };

  // Solo incluir contraseña si se proporciona
  if (formData.password && formData.password.trim() !== '') {
    (backendData as any).password = formData.password;
  }

  console.log('Datos convertidos para backend:', backendData);
  return backendData;
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
  error?: string;
  flashMessage?: string; // Mensaje de éxito o error
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



export interface ProfileData {
  id: string;
  name: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  profileConfig?: {
    id: string;
    avatarPath?: string;
    bio?: string;
    phoneNumber?: string;
    type_document?: string;
    documentNumber?: string;
    organization?: string;
    charge?: string;
    gender?: string;
    city?: string;
    country?: string;
    address?: string;
    dateOfBirth?: string;
    createdAt: string;
    updatedAt: string;
  };
}