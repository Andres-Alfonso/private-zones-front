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
  // Básicos
  email: string;
  password: string;
  name: string;
  lastName?: string;
  tenantId: string;
  isActive: boolean;
  roles: string[];

  // Perfil
  bio?: string;
  phoneNumber?: string;
  type_document?: string;
  documentNumber?: string;
  Organization?: string;
  Charge?: string;
  Genger?: string;
  City?: string;
  Country?: string;
  address?: string;
  dateOfBirth?: string;

  // Notificaciones
  enableNotifications: boolean;
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
}

export interface LoaderData {
  tenants: Tenant[];
  roles: Role[];
}

export interface ActionData {
  errors?: FormErrors;
  values?: Partial<UserFormData>;
}

export interface TabConfig {
  id: FormTab;
  name: string;
  icon: any;
  description: string;
}