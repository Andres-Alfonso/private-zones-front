// app/routes/tenants/create.tsx

import { json, redirect, ActionFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, X, AlertCircle, Building2, Globe, User, MapPin, Palette } from 'lucide-react';
import { 
  TenantPlan, 
  TenantFormData, 
  CreateTenantRequest,
  TENANT_FEATURES,
  TenantErrorResponse
} from '~/api/types/tenant.types';
import { TenantsAPI } from '~/api/endpoints/tenants';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateTenantFormData, generateSlugFromName, validateSlug } from '~/utils/tenantValidation';
import NavbarCustomizer from '~/components/NavbarCustomizer';

interface ActionData {
  errors?: Record<string, string>; // Cambiar a objeto de errores
  generalError?: string;
  success?: boolean;
  tenantId?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // Validar formulario
  const validation = validateTenantFormData(formData);
  
  if (!validation.isValid) {
    // Convertir array de errores a objeto para facilitar el uso en el cliente
    const errorObject: Record<string, string> = {};
    validation.errors.forEach(error => {
      errorObject[error.field] = error.message;
    });
    
    return json<ActionData>({ 
      errors: errorObject 
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
      
      // Información de contacto
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      url_portal: formData.get('url_portal') as string,
      nit: formData.get('nit') as string,

      backgroundColorNavbar: formData.get('primaryColor') as string || '#0052cc',
      textColorNavbar: formData.get('secondaryColor') as string || '#ffffff',
      logoNavbar: formData.get('logo') as string || 'Mi App',
      showSearch: formData.get('showSearch') === 'on',
      showNotifications: formData.get('showNotifications') === 'on',
      showProfile: formData.get('showProfile') === 'on',
      
      // Configuración inicial
      primaryColor: formData.get('primaryColor') as string || '#0052cc',
      secondaryColor: formData.get('secondaryColor') as string || '#ffffff',
      timezone: formData.get('timezone') as string || 'America/Bogota',
      language: formData.get('language') as string || 'es',
    };

    const tenantResult = await TenantsAPI.create(tenantData);

    console.log('Tenant creation result:', tenantResult);
    
    // Verificar si es un error
    if ('error' in tenantResult) {
      // Manejar errores específicos del backend
      const errorMessage = getSpecificErrorMessage(tenantResult);
      const fieldErrors = getFieldErrors(tenantResult);
      
      return json<ActionData>({ 
        success: false,
        generalError: errorMessage,
        errors: fieldErrors
      });
    }

    // Es un Tenant exitoso
    return json<ActionData>({ 
      success: true,
      tenantId: tenantResult.id
    });
    
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    
    return json<ActionData>({ 
      generalError: 'Error inesperado al crear el tenant'
    }, { status: 500 });
  }
};

// Función helper para obtener mensajes específicos
function getSpecificErrorMessage(error: TenantErrorResponse): string {
  switch (error.error) {
    case 'SLUG_ALREADY_EXISTS':
      return `El identificador "${error.value}" ya está en uso. Elige otro identificador.`;
    case 'DOMAIN_ALREADY_EXISTS':
      return `El dominio "${error.value}" ya está en uso. Elige otro dominio.`;
    case 'RESERVED_SLUG':
      return `El identificador "${error.value}" contiene palabras reservadas. Elige otro identificador.`;
    case 'INVALID_DOMAIN':
      return `El dominio "${error.value}" no es válido para el entorno actual.`;
    case 'DATABASE_ERROR':
      return 'Error al guardar en la base de datos. Intenta nuevamente.';
    default:
      return error.message || 'Error al crear el tenant';
  }
}

// Función helper para convertir errores a errores de campo
function getFieldErrors(error: TenantErrorResponse): Record<string, string> {
  if (!error.field) {
    return {
      general: getSpecificErrorMessage(error)
    };
  }
  
  return {
    [error.field]: getSpecificErrorMessage(error)
  };
}

// Hook personalizado para manejar el debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
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
    url_portal: '',
    nit: '',
    city: '',
    country: '',
    postalCode: '',

    backgroundColorNavbar: '#0052cc',
    textColorNavbar: '#ffffff',
    logoNavbar: 'Mi App',
    showSearch: true,
    showNotifications: true,
    showProfile: true,
    
    primaryColor: '#0052cc',
    secondaryColor: '#ffffff',
    timezone: 'America/Bogota',
    language: 'es',
    currency: 'USD',
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  
  const isSubmitting = navigation.state === 'submitting';

  // Refs para evitar ciclos infinitos
  const previousNameRef = useRef('');
  const isInternalUpdateRef = useRef(false);

  // Debounce del nombre para evitar múltiples ejecuciones
  const debouncedName = useDebounce(formData.name || '', 300);

  // Auto-generar slug cuando cambia el nombre
  useEffect(() => {
    if (debouncedName === previousNameRef.current) return;
    
    if (debouncedName && !isSlugManuallyEdited) {
      const generatedSlug = generateSlugFromName(debouncedName);
      
      if (generatedSlug !== formData.slug) {
        isInternalUpdateRef.current = true;
        setFormData(prev => ({ ...prev, slug: generatedSlug }));
        
        setTimeout(() => {
          isInternalUpdateRef.current = false;
        }, 0);
      }
    }
    
    previousNameRef.current = debouncedName;
  }, [debouncedName, isSlugManuallyEdited, formData.slug]);

  // Validar slug en tiempo real
  useEffect(() => {
    if (formData.slug) {
      const slugError = validateSlug(formData.slug);
      if (slugError) {
        setClientErrors(prev => ({ ...prev, slug: slugError }));
      } else {
        setClientErrors(prev => ({ ...prev, slug: '' }));
      }
    }
  }, [formData.slug]);

  // Redirigir si se creó exitosamente
  useEffect(() => {
    if (actionData?.success && actionData?.tenantId) {
      navigate(`/tenants/${actionData.tenantId}`);
    }
  }, [actionData, navigate]);

  // Combinar errores del servidor y del cliente
  const allErrors = {
    ...clientErrors,
    ...(actionData?.errors || {})
  };

  // Obtener error por campo
  const getErrorByField = (field: string): string | null => {
    const error = allErrors[field];
    return error && error.trim() !== '' ? error : null;
  };

  // Manejar cambios en el formulario
  const handleChange = useCallback((field: string, value: string | boolean) => {
    // Si están editando el slug manualmente, marcarlo como editado
    if (field === 'slug' && !isInternalUpdateRef.current) {
      setIsSlugManuallyEdited(true);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores cuando el usuario empiece a escribir/cambiar
    if (allErrors[field]) {
      setClientErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [allErrors]);

  const handleRegenerateSlug = useCallback(() => {
    if (formData.name) {
      const newSlug = generateSlugFromName(formData.name);
      isInternalUpdateRef.current = true;
      setFormData(prev => ({ ...prev, slug: newSlug }));
      setIsSlugManuallyEdited(false);
      
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    }
  }, [formData.name]);

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

              <div className="relative">
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
                  helperText={
                    isSlugManuallyEdited 
                      ? "Slug personalizado. Usa solo letras, números y guiones." 
                      : "Se genera automáticamente desde el nombre. Puedes editarlo manualmente."
                  }
                />
                
                {/* Botón para regenerar slug */}
                {isSlugManuallyEdited && formData.name && (
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="absolute right-2 top-8 text-xs text-blue-600 hover:text-blue-800 underline"
                    disabled={isSubmitting}
                  >
                    Regenerar
                  </button>
                )}
              </div>
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
                {getErrorByField('plan') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorByField('plan')}</p>
                )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Input
                type="text"
                id="url_portal"
                name="url_portal"
                label="Dirección del Portal"
                required
                error={getErrorByField('url_portal')}
                disabled={isSubmitting}
                placeholder="https://portal.empresa-abc.com"
                value={formData.url_portal}
                onChange={(e) => handleChange('url_portal', e.target.value)}
              />

              <Input
                type="text"
                id="nit"
                name="nit"
                label="Nit"
                required
                error={getErrorByField('nit')}
                disabled={isSubmitting}
                placeholder="123456789"
                value={formData.nit}
                onChange={(e) => handleChange('nit', e.target.value)}
              />
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                error={getErrorByField('postalCode')}
                disabled={isSubmitting}
                placeholder="11001"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
            </div> */}
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


        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Palette className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">Personalizador de Navbar</h2>
            </div>
          </div>

          <NavbarCustomizer
            // Pasar los valores actuales del formulario
            backgroundColor={formData.backgroundColorNavbar || '#0052cc'}
            textColor={formData.textColorNavbar || '#ffffff'}
            logo={formData.logoNavbar || 'Mi App'}
            showSearch={formData.showSearch || true}
            showNotifications={formData.showNotifications || true}
            showProfile={formData.showProfile || true}
            
            // Callback para manejar cambios
            onChange={handleChange}
            
            // Estado de carga
            isSubmitting={isSubmitting}
            
            // Errores de validación
            errors={allErrors}
          />
        </div>

        {/* Campos hidden para el navbar */}
        <input type="hidden" name="backgroundColorNavbar" value={formData.backgroundColorNavbar} />
        <input type="hidden" name="textColorNavbar" value={formData.textColorNavbar} />
        <input type="hidden" name="logoNavbar" value={formData.logoNavbar} />
        <input type="hidden" name="showSearch" value={formData.showSearch ? 'on' : ''} />
        <input type="hidden" name="showNotifications" value={formData.showNotifications ? 'on' : ''} />
        <input type="hidden" name="showProfile" value={formData.showProfile ? 'on' : ''} />

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