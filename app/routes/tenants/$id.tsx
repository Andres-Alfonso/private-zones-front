// app/routes/tenants/$id.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { 
  Building2, Edit, Trash2, Globe, Users, HardDrive, Calendar, 
  Mail, Phone, MapPin, Palette, CheckCircle, XCircle, AlertCircle,
  ExternalLink, BarChart3, Settings, Eye, EyeOff, Zap
} from "lucide-react";
import { 
  Tenant, 
  TenantPlan, 
  SubscriptionStatus
} from "~/api/types/tenant.types";
// import { TenantsAPI } from "~/api/endpoints/tenants";

interface LoaderData {
  tenant: Tenant | null;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
  action?: 'toggle-active' | 'delete';
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const tenantId = params.id as string;
    
    if (!tenantId) {
      throw new Error('ID de tenant no proporcionado');
    }

    // En producción: const tenant = await TenantsAPI.getById(tenantId);
    
    // Datos simulados
    const mockTenant: Tenant = {
      id: tenantId,
      name: 'Empresa ABC Learning',
      slug: 'empresa-abc',
      domain: 'abc.klmsystem.test',
      contactEmail: 'admin@abc.com',
      plan: TenantPlan.PRO,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      isActive: true,
      maxUsers: 50,
      currentUsers: 35,
      storageLimit: 25,
      storageUsed: 18.5,
      customDomain: 'learning.abc.com',
      billingEmail: 'billing@abc.com',
      expiresAt: '2024-12-31T00:00:00Z',
      features: ['courses', 'analytics', 'chat_support', 'custom_branding', 'api_access'],
      config: {
        id: '1',
        tenantId: tenantId,
        primaryColor: '#0052cc',
        secondaryColor: '#ffffff',
        timezone: 'America/Bogota',
        language: 'es',
        currency: 'USD',
        showLearningModule: true,
        enableChatSupport: true,
        allowGamification: false,
        dateFormat: 'DD/MM/YYYY',
        logo: 'https://via.placeholder.com/150x50',
      },
      contactInfo: {
        id: '1',
        tenantId: tenantId,
        contactPerson: 'Juan Pérez',
        contactEmail: 'admin@abc.com',
        phone: '+57 300 123 4567',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        country: 'Colombia',
        postalCode: '11001',
        taxId: '900123456-1'
      }
    };

    return json<LoaderData>({ 
      tenant: mockTenant, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading tenant:', error);
    return json<LoaderData>({ 
      tenant: null, 
      error: error.message || 'Error al cargar el tenant'
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get('_action') as string;
  const tenantId = params.id as string;

  try {
    switch (action) {
      case 'toggle-active':
        // await TenantsAPI.toggleActive(tenantId);
        return json<ActionData>({ 
          success: true, 
          action: 'toggle-active' 
        });

      case 'delete':
        // await TenantsAPI.delete(tenantId);
        return json<ActionData>({ 
          success: true, 
          action: 'delete' 
        });

      default:
        throw new Error('Acción no válida');
    }
  } catch (error: any) {
    return json<ActionData>({ 
      error: error.message || 'Error al procesar la acción'
    });
  }
};

export default function TenantDetail() {
  const { tenant, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600 mb-6">{error || 'Tenant no encontrado'}</p>
        <Link
          to="/tenants"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  const getPlanColor = (plan: TenantPlan) => {
    switch (plan) {
      case TenantPlan.FREE:
        return 'bg-gray-100 text-gray-800';
      case TenantPlan.STARTER:
        return 'bg-blue-100 text-blue-800';
      case TenantPlan.PRO:
        return 'bg-purple-100 text-purple-800';
      case TenantPlan.ENTERPRISE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatus.TRIAL:
        return 'bg-yellow-100 text-yellow-800';
      case SubscriptionStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.SUSPENDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const storagePercentage = (tenant.storageUsed / tenant.storageLimit) * 100;
  const usersPercentage = (tenant.currentUsers / tenant.maxUsers) * 100;

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {actionData.action === 'toggle-active' && 'Estado del tenant actualizado exitosamente'}
          {actionData.action === 'delete' && 'Tenant eliminado exitosamente'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header del tenant */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {tenant.config?.logo ? (
                    <img 
                      src={tenant.config.logo} 
                      alt={tenant.name}
                      className="h-16 w-auto"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                    {/* <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(tenant.plan)}`}>
                      {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                    </span> */}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <span>{tenant.domain}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Creado: {formatDate(tenant.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.subscriptionStatus)}`}>
                      {tenant.subscriptionStatus.charAt(0).toUpperCase() + tenant.subscriptionStatus.slice(1)}
                    </span> */}
                    
                    {tenant.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-2">
                <Link
                  to={`/tenants/${tenant.id}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>

                <Form method="post" className="inline">
                  <input type="hidden" name="_action" value="toggle-active" />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                      tenant.isActive
                        ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    } disabled:opacity-50`}
                  >
                    {tenant.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Activar
                      </>
                    )}
                  </button>
                </Form>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </button>
              </div>
            </div>

            {/* Acceso directo */}
            {tenant.isActive && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Acceso directo al tenant:</span>
                  <a
                    href={`https://${tenant.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    <span>https://{tenant.domain}</span>
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Métricas de uso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Usuarios</h3>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {tenant.currentUsers} / {tenant.maxUsers}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uso actual</span>
                  <span>{Math.round(usersPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${usersPercentage > 80 ? 'bg-red-500' : usersPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(usersPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">Almacenamiento</h3>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {tenant.storageUsed} / {tenant.storageLimit} GB
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uso actual</span>
                  <span>{Math.round(storagePercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${storagePercentage > 80 ? 'bg-red-500' : storagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                {/* <User className="h-5 w-5 text-blue-600" /> */}
                <h2 className="text-lg font-medium text-gray-900">Información de Contacto</h2>
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Persona de contacto</label>
                    <p className="text-sm text-gray-900">{tenant.contactInfo?.contactPerson}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email principal</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${tenant.contactEmail}`} className="text-sm text-blue-600 hover:text-blue-500">
                        {tenant.contactEmail}
                      </a>
                    </div>
                  </div>

                  {tenant.billingEmail && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email de facturación</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${tenant.billingEmail}`} className="text-sm text-blue-600 hover:text-blue-500">
                          {tenant.billingEmail}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${tenant.contactInfo?.phone}`} className="text-sm text-blue-600 hover:text-blue-500">
                        {tenant.contactInfo?.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dirección</label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-900">
                        <p>{tenant.contactInfo?.address}</p>
                        <p>{tenant.contactInfo?.city}, {tenant.contactInfo?.country}</p>
                        <p>CP: {tenant.contactInfo?.postalCode}</p>
                      </div>
                    </div>
                  </div>

                  {tenant.contactInfo?.taxId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID fiscal</label>
                      <p className="text-sm text-gray-900">{tenant.contactInfo.taxId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-medium text-gray-900">Configuración</h2>
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Colores</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: tenant.config?.primaryColor }}
                    ></div>
                    <span className="text-sm text-gray-900">{tenant.config?.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Idioma</label>
                  <p className="text-sm text-gray-900">{tenant.config?.language?.toUpperCase()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Moneda</label>
                  <p className="text-sm text-gray-900">{tenant.config?.currency}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Zona horaria</label>
                  <p className="text-sm text-gray-900">{tenant.config?.timezone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Soporte de chat</label>
                  <p className="text-sm text-gray-900">
                    {tenant.config?.enableChatSupport ? 'Habilitado' : 'Deshabilitado'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Gamificación</label>
                  <p className="text-sm text-gray-900">
                    {tenant.config?.allowGamification ? 'Habilitado' : 'Deshabilitado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                to={`/tenants/${tenant.id}/edit`}
                className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                <span>Editar información</span>
              </Link>

              <Link
                to={`/tenants/${tenant.id}/stats`}
                className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Ver estadísticas</span>
              </Link>

              <Link
                to={`/tenants/${tenant.id}/settings`}
                className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                <span>Configuración avanzada</span>
              </Link>

              <a
                href={`https://${tenant.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visitar sitio</span>
              </a>
            </div>
          </div>

          {/* Características habilitadas */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-medium text-gray-900">Características</h3>
            </div>
            
            <div className="space-y-2">
              {tenant.features.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Información de suscripción */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Suscripción</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Plan actual</label>
                {/* <p className="text-sm font-semibold text-gray-900">
                  {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                </p> */}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                {/* <p className="text-sm text-gray-900">
                  {tenant.subscriptionStatus.charAt(0).toUpperCase() + tenant.subscriptionStatus.slice(1)}
                </p> */}
              </div>

              {tenant.expiresAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Expira</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(tenant.expiresAt)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Última actualización</label>
                <p className="text-sm text-gray-900">
                  {formatDate(tenant.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el tenant "{tenant.name}"? Esta acción no se puede deshacer y eliminará:
            </p>
            
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Todos los datos del tenant</li>
              <li>• {tenant.currentUsers} usuarios</li>
              <li>• {tenant.storageUsed} GB de datos almacenados</li>
              <li>• Toda la configuración y personalización</li>
            </ul>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <Form method="post" className="flex-1">
                <input type="hidden" name="_action" value="delete" />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar Tenant
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}