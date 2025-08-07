// app/types/tenant.types.ts

import { HomeAdditionalSettings } from "~/components/tenant/viewCustomizers/types";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  contactEmail: string | null;
  plan: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;

  // Campos adicionales para gestión
  maxUsers: number;
  currentUsers: number;
  storageLimit: number; // en GB
  storageUsed: number; // en GB
  customDomain?: string;
  billingEmail?: string;
  expiresAt?: string;
  features: string[]; // array de features habilitadas

  config?: TenantConfig;
  contactInfo?: TenantContactInfo;
  viewConfigs?: TenantViewConfig[];
  componentConfigs?: TenantComponentConfig[];
}

export interface TenantViewConfig {
  id: string;

  tenant: Tenant;

  viewType: string;

  title: string;

  description: string;

  allowBackground: boolean;

  backgroundType: string;

  backgroundImagePath: string;

  backgroundColor: string;

  welcomeTitle: string;

  welcomeMessage: string;

  introVideoUrl: string;

  tutorialVideoUrl: string;

  autoplayVideo: boolean;

  showVideoControls: boolean;

  instructionsText: string;

  helpText: string;

  disclaimerText: string;

  helpUrl: string;

  documentationUrl: string;

  supportUrl: string;

  additionalSettings: Record<string, any>;

  isActive?: boolean;
}

export interface TenantComponentConfig {
  id: string;
  tenant: Tenant;
  componentType?: string;
  componentName?: string;
  isVisible?: boolean;
  visibleOnViews?: string;
  hiddenOnViews?: string;
  position?: string;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  logoAlt?: string;
  title?: string;
  showUserAvatar?: boolean;
  showNotifications?: boolean;
  isActive?: boolean;
}

export interface TenantConfig {
  id: string;
  maxUsers: number;
  storageLimit: number; // en GB
  storageUsed: number; // en GB
  currentUsers: number;
  tenantId: string;
  status: boolean;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
  showLearningModule: boolean;
  enableChatSupport: boolean;
  allowGamification: boolean;
  timezone: string | null;
  language: string;
  dateFormat: string;
  currency: string;
  customCss?: string;
}

export interface TenantContactInfo {
  id: string;
  tenantId: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  taxId?: string;
  url_portal?: string; // URL del portal del tenant
  nit?: string; // NIT o número de identificación fiscal del tenant
}

export interface TenantValidationResponse {
  tenant: Tenant | null;
  isValid: boolean;
  isActive: boolean;
  error?: string;
  message?: string;
}

export interface TenantContext {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
  config: TenantConfig | null;
}

// Estados posibles del tenant
export enum TenantStatus {
  LOADING = "loading",
  VALID = "valid",
  INVALID = "invalid",
  INACTIVE = "inactive",
  NOT_FOUND = "not_found",
  ERROR = "error",
}

// Planes disponibles
export enum TenantPlan {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

// Errores específicos del tenant
export enum TenantError {
  DOMAIN_MISMATCH = 'DOMAIN_MISMATCH',
  SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',
  DOMAIN_ALREADY_EXISTS = 'DOMAIN_ALREADY_EXISTS',
  RESERVED_SLUG = 'RESERVED_SLUG',
  INVALID_DOMAIN = 'INVALID_DOMAIN',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TOGGLE_ERROR = 'TOGGLE_ERROR',
  GET_STATUS_ERROR = 'GET_STATUS_ERROR'
}

// Respuesta del toggle active
export interface ToggleActiveResponse {
  success: boolean;
  status: boolean;
  message?: string;
}

// Respuesta del get status
export interface TenantStatusResponse {
  status: boolean;
}

export interface TenantErrorResponse {
  error: TenantError;
  message: string;
  field?: string;  // Campo específico que causó el error
  value?: string;  // Valor que causó el error
  details?: string; // Detalles adicionales del error
}

// Estadísticas de tenants
export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  expiredTenants: number;
  totalUsers: number;
  totalRevenue: number;
  storageUsed: number;
  averageUsers: number;
}

// Planes disponibles
export enum TenantPlan {
  STARTER = "starter",
}

// Estados de suscripción
export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIAL = "trial",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

// Errores específicos del tenant
// export enum TenantError {
//   INVALID_PLAN = "INVALID_PLAN",
//   STORAGE_LIMIT_EXCEEDED = "STORAGE_LIMIT_EXCEEDED",
//   USER_LIMIT_EXCEEDED = "USER_LIMIT_EXCEEDED",
// }


export interface UpdateTenantRequest extends Partial<CreateTenantRequest> {
  isActive?: boolean;
}

export interface TenantFilters {
  search?: string;
  plan?: TenantPlan;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Interfaces para formularios
export interface CreateTenantRequest {
  name: string;
  slug: string;
  domain: string;
  contactEmail: string;
  plan: TenantPlan;
  maxUsers: number;
  storageLimit: number;
  billingEmail?: string;
  expiresAt?: string;
  features?: string[];

  adminFirstName: string,
  adminLastName: string,
  adminEmail: string,
  adminPassword: string,
  
  // Información de contacto
  contactPerson: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  postalCode?: string;
  url_portal?: string; // URL del portal del tenant
  nit?: string; // NIT o número de identificación fiscal del tenant

  backgroundColorNavbar: string;
  textColorNavbar: string;
  logoNavbar: string;
  showNotifications: boolean;
  showProfile: boolean;
  
  // Configuración inicial
  primaryColor?: string;
  secondaryColor?: string;
  timezone?: string;
  language?: string;
  currency?: string;

  homeSettings?: ViewConfiguration;
  videoCallSettings?: ViewConfiguration;
  metricsSettings?: ViewConfiguration;
  groupsSettings?: ViewConfiguration;
  sectionsSettings?: ViewConfiguration;
  faqSettings?: ViewConfiguration;

  allowSelfRegistration: boolean;
  allowGoogleLogin: boolean;
  allowFacebookLogin: boolean;
  loginMethod: LoginMethod;
  allowValidationStatusUsers: boolean;
  
  // Campos requeridos en registro
  requireLastName: boolean;
  requirePhone: boolean;
  requireDocumentType: boolean;
  requireDocument: boolean;
  requireOrganization: boolean;
  requirePosition: boolean;
  requireGender: boolean;
  requireCity: boolean;
  requireAddress: boolean;

  enableEmailNotifications: boolean;

  // registrationSettings: RegistrationSettings;
  // notificationSettings: NotificationSettings;
}

export interface TenantListResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
  error?: string;
  message?: string;
}

export interface TenantFormData {
  // Datos básicos del tenant (existen en la estructura real)
  name: string;
  slug: string;
  domain: string;
  contactEmail: string;
  plan?: TenantPlan;
  
  // Config - datos que SÍ existen
  maxUsers: string;
  storageLimit: string;
  status: boolean;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  
  // ContactInfo - datos que SÍ existen  
  contactPerson: string;
  phone: string;
  address: string;
  url_portal: string;
  nit: string;
  
  // Config adicional que existe en los datos reales
  showLearningModule?: boolean;
  enableChatSupport?: boolean;
  allowGamification?: boolean;
  allowUserPasswordChange?: boolean;
  enableEmailNotifications?: boolean;
  faviconPath?: string;
  logoPath?: string;
  loginBackgroundPath?: string;
  iconPath?: string;
  allowSelfRegistration?: boolean;
  allowGoogleLogin?: boolean;
  allowFacebookLogin?: boolean;
  loginMethod?: string;
  allowValidationStatusUsers?: boolean;
  requireLastName?: boolean;
  requirePhone?: boolean;
  requireDocumentType?: boolean;
  requireDocument?: boolean;
  requireOrganization?: boolean;
  requirePosition?: boolean;
  requireGender?: boolean;
  requireCity?: boolean;
  requireAddress?: boolean;
  
  // Propiedades para el formulario de admin (solo para creación)
  adminFirstName?: string;
  adminLastName?: string;
  adminEmail?: string;
  adminPassword?: string;
  
  // Propiedades para navbar customizer (UI específicas - no en DB)
  backgroundColorNavbar?: string;
  textColorNavbar?: string;
  logoNavbar?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  
  // Propiedades opcionales que podrían agregarse después
  city?: string;
  country?: string;
  postalCode?: string;
  language?: string;
  currency?: string;
  billingEmail?: string;
  expiresAt?: string;
  features?: string[];

  termsEs?: string;
  termsEn?: string;
  privacyEs?: string;
  privacyEn?: string;
}

export enum LoginMethod {
  EMAIL = 'email',
  DOCUMENT = 'document',
  BOTH = 'both',
}

export interface RegistrationSettings {
  allowSelfRegistration: boolean;
  allowGoogleLogin: boolean;
  allowFacebookLogin: boolean;
  loginMethod: LoginMethod;
  allowValidationStatusUsers: boolean;
  
  // Campos requeridos en registro
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

export interface NotificationSettings {
  enableEmailNotifications: boolean;
}

export interface ViewConfiguration {
  type: string;
  customBackground: boolean;
  backgroundType: 'imagen' | 'color';
  backgroundImage: string;
  backgroundColor: string;
  additionalSettings?: HomeAdditionalSettings;
}

export interface TenantValidationError {
  field: keyof TenantFormData;
  message: string;
}

// Features disponibles
export const TENANT_FEATURES = [
  'courses',
  'analytics',
  'chat_support',
  'custom_branding',
  'api_access',
  'sso',
  'advanced_reporting',
  'white_label',
  'custom_integrations',
  'priority_support'
] as const;

export type TenantFeature = typeof TENANT_FEATURES[number];