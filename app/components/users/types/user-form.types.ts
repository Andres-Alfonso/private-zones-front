// app/components/users/types/user-form.types.ts

export type FormTab = 'basic' | 'profile' | 'notifications';

export interface Tenant {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  tenantId?: string;
  general?: string;
  [key: string]: string | undefined;
}

export interface UserFormData {
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
  
  // Campos de auditoría (solo lectura)
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface LoaderData {
  tenantId?: string;
  tenants: Tenant[];
  roles: Role[];
}

export interface ActionData {
  errors?: FormErrors;
  values?: Partial<UserFormData>;
  success?: boolean;
}

export interface TabConfig {
  id: FormTab;
  name: string;
  icon: any;
  description: string;
}