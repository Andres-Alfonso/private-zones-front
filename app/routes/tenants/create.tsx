// app/routes/tenants/create.tsx

import { json, redirect, ActionFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Building2, Globe, User, MapPin, Palette } from 'lucide-react';
import { 
  TenantPlan, 
  TenantFormData, 
  CreateTenantRequest,
  TENANT_FEATURES
} from '~/api/types/tenant.types';
// import { TenantsAPI } from '~/api/endpoints/tenants';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateTenantFormData, getTenantErrorByField, generateSlugFromName } from '~/utils/tenantValidation';

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
  tenantId?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // Validar formulario
  const validation = validateTenantFormData(formData);
  
  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  try {
    const tenantData: CreateTenantRequest = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      domain: formData.get('domain') as string,
      contactEmail: formData.get('contactEmail') as string,
      plan: formData.get('plan') as TenantPlan,
      maxUsers: Number(formData.get('maxUsers')),
      storageLimit: Number(formData.get('storageLimit')),
      billingEmail: formData.get('billingEmail') as string || undefined,
      expiresAt: formData.get('expiresAt') as string || undefined,
      features: formData.getAll('features') as string[],
      
      // Información de contacto
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      postalCode: formData.get('postalCode') as string,
      
      // Configuración inicial
      primaryColor: formData.get('primaryColor') as string || '#0052cc',
      secondaryColor: formData.get('secondaryColor') as string || '#ffffff',
      timezone: formData.get('timezone') as string || 'America/Bogota',
      language: formData.get('language') as string || 'es',
      currency: formData.get('currency') as string || 'USD',
    };

    // En producción: const tenant = await TenantsAPI.create(tenantData);
    
    // Simulamos una respuesta exitosa
    const mockTenant = { id: 'new-tenant-id', ...tenantData };
    
    return json<ActionData>({ 
      success: true,
      tenantId: mockTenant.id
    });
    
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    
    let generalError = 'Error al crear el tenant';
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 409) {
        generalError = 'Ya existe un tenant con ese slug o dominio';
      } else if (status === 400 && errorData?.message) {
        generalError = errorData.message;
      } else if (errorData?.message) {
        generalError = errorData.message;
      }
    }
    
    return json<ActionData>({ 
      generalError 
    }, { status: 500 });
  }
};

export default function CreateTenant() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<TenantFormData>>({
    name: '',
    slug: '',
    domain: '',
    contactEmail: '',
    plan: TenantPlan.FREE,
    maxUsers: '',
    storageLimit: '',
    billingEmail: '',
    expiresAt: '',
    features: [],
    
    contactPerson: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    
    primaryColor: '#0052cc',
    secondaryColor: '#ffffff',
    timezone: 'America/Bogota',
    language: 'es',
    currency: 'USD',
  });

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  // Auto-generar slug cuando cambia el nombre
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const generatedSlug = generateSlugFromName(formData.name);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, formData.slug]);

  // Auto-configurar límites según el plan
  // useEffect(() => {
  //   if (formData.plan) {
  //     const limits = PLAN_LIMITS[formData.plan];
  //     setFormData(prev => ({
  //       ...prev,
  //       maxUsers: limits.maxUsers === -1 ? '1000' : limits.maxUsers.toString(),
  //       storageLimit: limits.storageLimit.toString(),
  //       features: limits.features,
  //     }));
  //   }
  // }, [formData.plan]);

  // Redirigir si se creó exitosamente
  useEffect(() => {
    if (actionData?.success && actionData?.tenantId) {
      navigate(`/tenants/${actionData.tenantId}`);
    }
  }, [actionData, navigate]);

  // Obtener error por campo
  const getErrorByField = (field: string): string | null => {
    return getTenantErrorByField(errors, field as any);
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof TenantFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Verificar si una feature está disponible para el plan actual
  // const isFeatureAvailable = (feature: string): boolean => {
  //   if (!formData.plan) return false;
  //   return PLAN_LIMITS[formData.plan].features.includes(feature as any);
  // };

  // Lista de países
  const countries = [
    'Colombia', 'España', 'México', 'Argentina', 'Chile', 'Perú', 
    'Estados Unidos', 'Canadá', 'Brasil', 'Uruguay', 'Venezuela'
  ];

  // Lista de idiomas
  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
  ];

  // Lista de monedas
  const currencies = [
    { code: 'USD', name: 'USD - Dólar estadounidense' },
    { code: 'EUR', name: 'EUR - Euro' },
    { code: 'COP', name: 'COP - Peso colombiano' },
    { code: 'MXN', name: 'MXN - Peso mexicano' },
    { code: 'ARS', name: 'ARS - Peso argentino' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Tenant</h1>
            <p className="text-gray-600 mt-1">
              Complete la información para configurar un nuevo tenant en la plataforma
            </p>
          </div>
          <button
            onClick={() => navigate('/tenants')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
            <span>Cancelar</span>
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {actionData?.generalError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.generalError}
        </div>
      )}

      {/* Formulario */}
      <Form method="post" className="space-y-8" noValidate>
        {/* Información básica */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">Información Básica</h2>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            {/* Nombre y Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                id="name"
                name="name"
                label="Nombre del Tenant"
                required
                error={getErrorByField('name')}
                disabled={isSubmitting}
                placeholder="Ej: Empresa ABC"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />

              <Input
                type="text"
                id="slug"
                name="slug"
                label="Slug (identificador único)"
                required
                error={getErrorByField('slug')}
                disabled={isSubmitting}
                placeholder="empresa-abc"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                helperText="Solo letras, números y guiones. Se genera automáticamente desde el nombre."
              />
            </div>

            {/* Dominio y Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                id="domain"
                name="domain"
                label="Dominio"
                required
                error={getErrorByField('domain')}
                disabled={isSubmitting}
                placeholder="empresa-abc.klmsystem.test"
                value={formData.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                helperText="Dominio principal para acceder al tenant"
              />

              <Input
                type="email"
                id="contactEmail"
                name="contactEmail"
                label="Email de Contacto"
                required
                error={getErrorByField('contactEmail')}
                disabled={isSubmitting}
                placeholder="admin@empresa-abc.com"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
              />
            </div>

            {/* Plan y Configuración */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan *
                </label>
                <select
                  id="plan"
                  name="plan"
                  required
                  disabled={isSubmitting}
                  value={formData.plan}
                  onChange={(e) => handleChange('plan', e.target.value as TenantPlan)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={TenantPlan.FREE}>Free</option>
                  <option value={TenantPlan.STARTER}>Starter</option>
                  <option value={TenantPlan.PRO}>Pro</option>
                  <option value={TenantPlan.ENTERPRISE}>Enterprise</option>
                </select>
              </div>

              <Input
                type="number"
                id="maxUsers"
                name="maxUsers"
                label="Máximo de Usuarios"
                required
                min="1"
                error={getErrorByField('maxUsers')}
                disabled={isSubmitting}
                value={formData.maxUsers}
                onChange={(e) => handleChange('maxUsers', e.target.value)}
              />

              <Input
                type="number"
                id="storageLimit"
                name="storageLimit"
                label="Límite de Almacenamiento (GB)"
                required
                min="1"
                error={getErrorByField('storageLimit')}
                disabled={isSubmitting}
                value={formData.storageLimit}
                onChange={(e) => handleChange('storageLimit', e.target.value)}
              />
            </div>

            {/* Emails adicionales y fecha de expiración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="email"
                id="billingEmail"
                name="billingEmail"
                label="Email de Facturación (opcional)"
                error={getErrorByField('billingEmail')}
                disabled={isSubmitting}
                placeholder="billing@empresa-abc.com"
                value={formData.billingEmail}
                onChange={(e) => handleChange('billingEmail', e.target.value)}
              />

              <Input
                type="date"
                id="expiresAt"
                name="expiresAt"
                label="Fecha de Expiración (opcional)"
                error={getErrorByField('expiresAt')}
                disabled={isSubmitting}
                value={formData.expiresAt}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">Información de Contacto</h2>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                id="contactPerson"
                name="contactPerson"
                label="Persona de Contacto"
                required
                error={getErrorByField('contactPerson')}
                disabled={isSubmitting}
                placeholder="Juan Pérez"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
              />

              <Input
                type="tel"
                id="phone"
                name="phone"
                label="Teléfono"
                required
                error={getErrorByField('phone')}
                disabled={isSubmitting}
                placeholder="+57 300 123 4567"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <Input
              type="text"
              id="address"
              name="address"
              label="Dirección"
              required
              error={getErrorByField('address')}
              disabled={isSubmitting}
              placeholder="Calle 123 #45-67"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                type="text"
                id="city"
                name="city"
                label="Ciudad"
                required
                error={getErrorByField('city')}
                disabled={isSubmitting}
                placeholder="Bogotá"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  disabled={isSubmitting}
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar país</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {getErrorByField('country') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorByField('country')}</p>
                )}
              </div>

              <Input
                type="text"
                id="postalCode"
                name="postalCode"
                label="Código Postal"
                required
                error={getErrorByField('postalCode')}
                disabled={isSubmitting}
                placeholder="11001"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Palette className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">Configuración</h2>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            {/* Colores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="color"
                id="primaryColor"
                name="primaryColor"
                label="Color Primario"
                error={getErrorByField('primaryColor')}
                disabled={isSubmitting}
                value={formData.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
              />

              <Input
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                label="Color Secundario"
                error={getErrorByField('secondaryColor')}
                disabled={isSubmitting}
                value={formData.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
              />
            </div>

            {/* Configuración regional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  id="language"
                  name="language"
                  disabled={isSubmitting}
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  id="currency"
                  name="currency"
                  disabled={isSubmitting}
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>{curr.name}</option>
                  ))}
                </select>
              </div>

              <Input
                type="text"
                id="timezone"
                name="timezone"
                label="Zona Horaria"
                disabled={isSubmitting}
                placeholder="America/Bogota"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">Características</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona las características disponibles según el plan elegido
            </p>
          </div>
          
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TENANT_FEATURES.map((feature) => (
                <Checkbox
                  key={feature}
                  id={`feature-${feature}`}
                  name="features"
                  value={feature}
                  label={feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  checked={formData.features?.includes(feature) || false}
                  // disabled={!isFeatureAvailable(feature) || isSubmitting}
                  onChange={(e) => {
                    const newFeatures = e.target.checked 
                      ? [...(formData.features || []), feature]
                      : (formData.features || []).filter(f => f !== feature);
                    handleChange('features', newFeatures);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/tenants')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Crear Tenant</span>
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}