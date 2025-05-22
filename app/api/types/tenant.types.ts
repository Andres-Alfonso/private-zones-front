// app/types/tenant.types.ts

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  contactEmail: string | null;
  plan: string | null;
  createdAt: string;
  isActive: boolean;
  config?: TenantConfig;
  contactInfo?: TenantContactInfo;
}

export interface TenantConfig {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  showLearningModule: boolean;
  enableChatSupport: boolean;
  allowGamification: boolean;
  timezone: string | null;
}

export interface TenantContactInfo {
  id: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  address: string;
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
  NOT_FOUND = "TENANT_NOT_FOUND",
  INACTIVE = "TENANT_INACTIVE",
  EXPIRED = "TENANT_EXPIRED",
  SUSPENDED = "TENANT_SUSPENDED",
  DOMAIN_MISMATCH = "DOMAIN_MISMATCH",
  NETWORK_ERROR = "NETWORK_ERROR",
}
