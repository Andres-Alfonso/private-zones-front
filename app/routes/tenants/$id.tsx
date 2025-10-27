// app/routes/tenants/$id.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { 
  Building2, Edit, Trash2, Globe, Users, HardDrive, Calendar, 
  Mail, Phone, MapPin, Palette, CheckCircle, XCircle, AlertCircle,
  ExternalLink, BarChart3, Settings, Eye, EyeOff, Zap, TrendingUp,
  Activity, Server, Database, Clock
} from "lucide-react";
import { 
  Tenant, 
  TenantPlan, 
  SubscriptionStatus
} from "~/api/types/tenant.types";
import { TenantsAPI } from "~/api/endpoints/tenants";

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

    const tenant = await TenantsAPI.getById(tenantId);

    return json<LoaderData>({ 
      tenant: tenant, 
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-200/50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Tenant no encontrado'}</p>
          <Link
            to="/tenants"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  const getPlanColor = (plan: TenantPlan) => {
    switch (plan) {
      case TenantPlan.FREE:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
      case TenantPlan.STARTER:
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case TenantPlan.PRO:
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      case TenantPlan.ENTERPRISE:
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800';
      case SubscriptionStatus.TRIAL:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800';
      case SubscriptionStatus.EXPIRED:
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800';
      case SubscriptionStatus.SUSPENDED:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
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

  const storagePercentage = (tenant.config?.storageUsed / tenant.config?.storageLimit) * 100;
  const usersPercentage = (tenant.config?.currentUsers / tenant.config?.maxUsers) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mensajes de estado */}
        {actionData?.error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-r-xl shadow-sm backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{actionData.error}</span>
            </div>
          </div>
        )}

        {actionData?.success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-xl shadow-sm backdrop-blur-sm">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700 font-medium">
                {actionData.action === 'toggle-active' && 'Estado del tenant actualizado exitosamente'}
                {actionData.action === 'delete' && 'Tenant eliminado exitosamente'}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header del tenant mejorado */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 w-full">
                {/* Información del tenant */}
                <div className="flex flex-col sm:flex-row items-start gap-6 w-full md:w-auto">
                  <div className="flex-shrink-0">
                    {tenant.config?.logo ? (
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <img
                          src={tenant.config.logo}
                          alt={tenant.name}
                          className="h-16 w-auto rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Building2 className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {tenant.name}
                      </h1>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border shadow-sm ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">{tenant.domain}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        <span>Creado: {formatDate(tenant.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {tenant.config?.status ? (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">
                          <XCircle className="h-4 w-4 mr-2" />
                          Inactivo
                        </span>
                      )}

                      <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                        <Activity className="h-4 w-4 mr-2" />
                        En línea
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones responsivas */}
                <div className="flex flex-wrap gap-3 items-center justify-start md:justify-end">
                  <Link
                    to={`/tenants/${tenant.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white/80 hover:bg-white hover:shadow-md transition-all duration-200 backdrop-blur-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>

                  <Form method="post" className="inline">
                    <input type="hidden" name="_action" value="toggle-active" />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex items-center px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 ${
                        tenant.config?.status
                          ? 'border-red-300 text-red-700 bg-red-50/80 hover:bg-red-100'
                          : 'border-green-300 text-green-700 bg-green-50/80 hover:bg-green-100'
                      } backdrop-blur-sm disabled:opacity-50`}
                    >
                      {tenant.config?.status ? (
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
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-xl text-sm font-medium text-red-700 bg-red-50/80 hover:bg-red-100 transition-all duration-200 backdrop-blur-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </div>


              {/* Acceso directo mejorado */}
              {tenant.isActive && (
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Tenant en línea y accesible</span>
                    </div>
                    <a
                      href={`https://${tenant.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white transition-all duration-200"
                    >
                      <span>https://{tenant.domain}</span>
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Métricas de uso mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {tenant.config?.currentUsers}
                    </div>
                    <div className="text-sm text-gray-500">de {tenant.config?.maxUsers}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Uso actual</span>
                    <span className="font-semibold text-gray-900">{Math.round(usersPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        usersPercentage > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        usersPercentage > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${Math.min(usersPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+12% vs mes anterior</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <HardDrive className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Almacenamiento</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                      {tenant.config?.storageUsed}GB
                    </div>
                    <div className="text-sm text-gray-500">de {tenant.config?.storageLimit}GB</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Uso actual</span>
                    <span className="font-semibold text-gray-900">{Math.round(storagePercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        storagePercentage > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        storagePercentage > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+8% vs mes anterior</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de contacto mejorada */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-green-50 to-teal-50 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Información de Contacto
                  </h2>
                </div>
              </div>
              
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Persona de contacto</label>
                      <p className="text-lg font-bold text-gray-900 mt-1">{tenant.contactInfo?.contactPerson}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email principal</label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Mail className="h-4 w-4 text-purple-500" />
                        <a href={`mailto:${tenant.contactEmail}`} className="text-purple-600 hover:text-purple-500 font-medium">
                          {tenant.contactEmail}
                        </a>
                      </div>
                    </div>

                    {tenant.billingEmail && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email de facturación</label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Mail className="h-4 w-4 text-orange-500" />
                          <a href={`mailto:${tenant.billingEmail}`} className="text-orange-600 hover:text-orange-500 font-medium">
                            {tenant.billingEmail}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Teléfono</label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <a href={`tel:${tenant.contactInfo?.phone}`} className="text-green-600 hover:text-green-500 font-medium">
                          {tenant.contactInfo?.phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl">
                      <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dirección</label>
                      <div className="flex items-start space-x-2 mt-2">
                        <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                        <div className="text-red-700 font-medium">
                          <p>{tenant.contactInfo?.address}</p>
                          <p>{tenant.contactInfo?.city}, {tenant.contactInfo?.country}</p>
                          <p>CP: {tenant.contactInfo?.postalCode}</p>
                        </div>
                      </div>
                    </div>

                    {tenant.contactInfo?.nit && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">NIT</label>
                        <p className="text-lg font-bold text-indigo-700 mt-1">{tenant.contactInfo.nit}</p>
                      </div>
                    )}

                    {tenant.contactInfo?.url_portal && (
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Portal</label>
                        <div className="flex items-center space-x-2 mt-2">
                          <ExternalLink className="h-4 w-4 text-cyan-500" />
                          <a href={tenant.contactInfo.url_portal} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-500 font-medium">
                            {tenant.contactInfo.url_portal}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración mejorada */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Configuración
                  </h2>
                </div>
              </div>
              
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Color Primario</label>
                    <div className="flex items-center space-x-3 mt-2">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                        style={{ backgroundColor: tenant.config?.primaryColor }}
                      ></div>
                      <span className="text-sm font-bold text-gray-900">{tenant.config?.primaryColor}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Idioma</label>
                    <p className="text-lg font-bold text-green-700 mt-2">{tenant.config?.language?.toUpperCase()}</p>
                  </div>

                  {/* <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Moneda</label>
                    <p className="text-lg font-bold text-yellow-700 mt-2">{tenant.config?.currency}</p>
                  </div> */}

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Zona horaria</label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <p className="text-sm font-bold text-purple-700">{tenant.config?.timezone}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Soporte de chat</label>
                    <p className="text-lg font-bold text-indigo-700 mt-2">
                      {tenant.config?.enableChatSupport ? 'Habilitado' : 'Deshabilitado'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Gamificación</label>
                    <p className="text-lg font-bold text-pink-700 mt-2">
                      {tenant.config?.allowGamification ? 'Habilitado' : 'Deshabilitado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral mejorado */}
          <div className="space-y-6">
            {/* Acciones rápidas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/tenants/${tenant.id}/edit`}
                  className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-white/80 hover:shadow-md transition-all duration-200 group"
                >
                  <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Editar información</span>
                </Link>

                <Link
                  to={`/tenants/${tenant.id}/stats`}
                  className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-white/80 hover:shadow-md transition-all duration-200 group"
                >
                  <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Ver estadísticas</span>
                </Link>

                <Link
                  to={`/tenants/${tenant.id}/settings`}
                  className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-white/80 hover:shadow-md transition-all duration-200 group"
                >
                  <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Configuración avanzada</span>
                </Link>

                <a
                  href={`https://${tenant.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg group"
                >
                  <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Visitar sitio</span>
                </a>
              </div>
            </div>

            {/* Características habilitadas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Características</h3>
              </div>
              
              <div className="space-y-3">
                {tenant.features && tenant.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Información de sistema */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                  <Server className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información del Sistema</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan actual</label>
                  <p className="text-sm font-bold text-blue-700 mt-1">
                    {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
                  <p className="text-sm font-bold text-green-700 mt-1">
                    {tenant.config?.status ? 'Activo' : 'Inactivo'}
                  </p>
                </div>

                {tenant.expiresAt && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expira</label>
                    <p className="text-sm font-bold text-orange-700 mt-1">
                      {formatDate(tenant.expiresAt)}
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Última actualización</label>
                  <p className="text-sm font-bold text-purple-700 mt-1">
                    {formatDate(tenant.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmación de eliminación mejorado */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Confirmar Eliminación
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar el tenant "{tenant.name}"? Esta acción no se puede deshacer y eliminará:
              </p>
              
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl mb-6">
                <ul className="text-sm text-red-700 space-y-1 font-medium">
                  <li>• Todos los datos del tenant</li>
                  <li>• {tenant.config?.currentUsers} usuarios</li>
                  <li>• {tenant.config?.storageUsed} GB de datos almacenados</li>
                  <li>• Toda la configuración y personalización</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  Cancelar
                </button>
                <Form method="post" className="flex-1">
                  <input type="hidden" name="_action" value="delete" />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-medium transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Eliminar Tenant
                  </button>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}