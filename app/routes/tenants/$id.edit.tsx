// app/routes/tenants/$id.edit.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Building2, Globe, User, MapPin, Palette, Trash2 } from 'lucide-react';
import { 
  Tenant,
  TenantPlan, 
  TenantFormData, 
  UpdateTenantRequest,
  TENANT_FEATURES,
  SubscriptionStatus,
  TenantErrorResponse
} from '~/api/types/tenant.types';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateTenantFormData } from '~/utils/tenantValidation';
import { TenantsAPI } from '~/api/endpoints/tenants';

interface LoaderData {
  tenant: Tenant | null;
  error: string | null;
}

interface ActionData {
  errors?: Record<string, string>; // Cambiar a objeto para consistencia
  generalError?: string;
  success?: boolean;
}

function isTenantErrorResponse(result: Tenant | TenantErrorResponse): result is TenantErrorResponse {
  return 'error' in result && 'message' in result;
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const tenantId = params.id as string;
    
    if (!tenantId) {
      throw new Error('ID de tenant no proporcionado');
    }
    
    const result = await TenantsAPI.getById(tenantId);

    // Check if the result is an error response
    if (isTenantErrorResponse(result)) {
      return json<LoaderData>({ 
        tenant: null, 
        error: result.message 
      });
    }

    // If we get here, result is a Tenant
    return json<LoaderData>({ 
      tenant: result, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading tenant for edit:', error);
    return json<LoaderData>({ 
      tenant: null, 
      error: error.message || 'Error al cargar el tenant'
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const tenantId = params.id as string;

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
    const updateData: UpdateTenantRequest = {
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
      isActive: formData.get('isActive') === 'on', // Corregir el checkbox
      
      // Información de contacto
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      postalCode: formData.get('postalCode') as string,
      
      // Configuración
      primaryColor: formData.get('primaryColor') as string || '#0052cc',
      secondaryColor: formData.get('secondaryColor') as string || '#ffffff',
      timezone: formData.get('timezone') as string || 'America/Bogota',
      language: formData.get('language') as string || 'es',
      currency: formData.get('currency') as string || 'USD',
    };

    const result = await TenantsAPI.update(tenantId, updateData);
    
    // Verificar si es un error
    if (isTenantErrorResponse(result)) {
      const errorMessage = getSpecificErrorMessage(result);
      const fieldErrors = getFieldErrors(result);
      
      return json<ActionData>({ 
        success: false,
        generalError: errorMessage,
        errors: fieldErrors
      });
    }
    
    return json<ActionData>({ 
      success: true
    });
    
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    
    return json<ActionData>({ 
      generalError: 'Error inesperado al actualizar el tenant'
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
      return error.message || 'Error al actualizar el tenant';
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

export default function EditTenant() {
  const { tenant, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<TenantFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const isSubmitting = navigation.state === 'submitting';

  // Cargar datos del tenant en el formulario
  useEffect(() => {
    if (tenant) {
      const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };

      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        domain: tenant.domain || '',
        contactEmail: tenant.contactEmail || '',
        // plan: tenant.plan || TenantPlan.FREE,
        maxUsers: tenant.config?.maxUsers?.toString() || '',
        storageLimit: tenant.config?.storageLimit?.toString() || '',
        billingEmail: tenant.billingEmail || '',
        expiresAt: formatDate(tenant.expiresAt),
        status: tenant.config?.status,
        features: tenant.features || [],
        
        contactPerson: tenant.contactInfo?.contactPerson || '',
        phone: tenant.contactInfo?.phone || '',
        address: tenant.contactInfo?.address || '',
        city: tenant.contactInfo?.city || '',
        country: tenant.contactInfo?.country || '',
        postalCode: tenant.contactInfo?.postalCode || '',
        
        primaryColor: tenant.config?.primaryColor || '#0052cc',
        secondaryColor: tenant.config?.secondaryColor || '#ffffff',
        timezone: tenant.config?.timezone || 'America/Bogota',
        language: tenant.config?.language || 'es',
        currency: tenant.config?.currency || 'USD',
      });
    }
  }, [tenant]);

  // Redirigir si se actualizó exitosamente
  useEffect(() => {
    if (actionData?.success) {
      navigate(`/tenants/${tenant?.id}`);
    }
  }, [actionData, navigate, tenant?.id]);

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600 mb-6">{error || 'Tenant no encontrado'}</p>
        <button
          onClick={() => navigate('/tenants')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

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
  const handleChange = (field: keyof TenantFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (allErrors[field]) {
      setClientErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Editar Tenant</h1>
            <p className="text-gray-600 mt-1">
              Modifica la información del tenant "{tenant.name}"
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/tenants`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de cambios sin guardar */}
      {hasChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Tienes cambios sin guardar. Asegúrate de guardar antes de salir.
        </div>
      )}

      {/* Mensajes de estado */}
      {actionData?.generalError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.generalError}
        </div>
      )}

      {/* Formulario */}
      <Form method="post" className="space-y-8" noValidate>
        {/* Estado del tenant */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Estado del Tenant</h2>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div className="flex items-center">
              <input
                id="status"
                name="status"
                type="checkbox"
                defaultChecked={tenant.config?.status}
                onChange={(e) => handleChange('status', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
                Tenant activo y operativo
              </label>
            </div>

            {/* Información de uso */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Información de Uso Actual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Usuarios actuales:</span>
                  <span className="ml-2 font-medium">{tenant.config?.currentUsers || 0} / {tenant.config?.maxUsers || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Almacenamiento usado:</span>
                  <span className="ml-2 font-medium">{tenant.config?.storageUsed || 0} / {tenant.config?.storageLimit || 0} GB</span>
                </div>
                <div>
                  <span className="text-gray-600">Creado:</span>
                  <span className="ml-2 font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="ml-2 font-medium">{new Date(tenant.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />

              <Input
                type="text"
                id="slug"
                name="slug"
                label="Slug (identificador único)"
                required
                error={getErrorByField('slug')}
                disabled={true} // Slug no debería ser editable
                placeholder="empresa-abc"
                value={formData.slug || ''}
                onChange={(e) => handleChange('slug', e.target.value)}
                helperText="El slug no puede ser modificado después de la creación"
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
                value={formData.domain || ''}
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
                value={formData.contactEmail || ''}
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
                  value={formData.plan || TenantPlan.FREE}
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
                value={formData.maxUsers || ''}
                onChange={(e) => handleChange('maxUsers', e.target.value)}
                helperText={`Actuales: ${tenant.config?.currentUsers || 0}`}
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
                value={formData.storageLimit || ''}
                onChange={(e) => handleChange('storageLimit', e.target.value)}
                helperText={`Usado: ${tenant.config?.storageUsed || 0} GB`}
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
                value={formData.billingEmail || ''}
                onChange={(e) => handleChange('billingEmail', e.target.value)}
              />

              <Input
                type="date"
                id="expiresAt"
                name="expiresAt"
                label="Fecha de Expiración (opcional)"
                error={getErrorByField('expiresAt')}
                disabled={isSubmitting}
                value={formData.expiresAt || ''}
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
                value={formData.contactPerson || ''}
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
                value={formData.phone || ''}
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
              value={formData.address || ''}
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
                value={formData.city || ''}
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
                  value={formData.country || ''}
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
                value={formData.postalCode || ''}
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
                value={formData.primaryColor || '#0052cc'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
              />

              <Input
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                label="Color Secundario"
                error={getErrorByField('secondaryColor')}
                disabled={isSubmitting}
                value={formData.secondaryColor || '#ffffff'}
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
                  value={formData.language || 'es'}
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
                  value={formData.currency || 'USD'}
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
                value={formData.timezone || ''}
                onChange={(e) => handleChange('timezone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/tenants/${tenant.id}`)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}