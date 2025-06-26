// app/routes/tenants/_index.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, Users, 
  Building2, Globe, Calendar, AlertCircle, MoreHorizontal,
  Download, Upload, TrendingUp, TrendingDown
} from "lucide-react";
import { 
  Tenant, 
  TenantPlan, 
  SubscriptionStatus, 
  TenantFilters,
  TenantListResponse,
  TenantStats
} from "~/api/types/tenant.types";
import { TenantsAPI } from "~/api/endpoints/tenants";

interface LoaderData {
  tenants: TenantListResponse;
  stats: TenantStats;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
  action?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const filters: TenantFilters = {
      search: url.searchParams.get('search') || undefined,
      plan: url.searchParams.get('plan') as TenantPlan || undefined,
      isActive: url.searchParams.get('active') ? url.searchParams.get('active') === 'true' : undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
    };

    const tenants = await TenantsAPI.getAllTenants(filters);
    const { data, total, page, limit } = tenants;

    console.log('Tenants loaded:', tenants);

    // En producción: const stats = await TenantsAPI.getStats();
    
    // Datos simulados
    // const mockTenants: Tenant[] = [
    //   {
    //     id: '1',
    //     name: 'Empresa ABC',
    //     slug: 'empresa-abc',
    //     domain: 'abc.klmsystem.test',
    //     contactEmail: 'admin@abc.com',
    //     plan: TenantPlan.PRO,
    //     createdAt: '2024-01-15T00:00:00Z',
    //     updatedAt: '2024-01-20T00:00:00Z',
    //     isActive: true,
    //     maxUsers: 50,
    //     currentUsers: 35,
    //     storageLimit: 25,
    //     storageUsed: 18.5,
    //     customDomain: 'learning.abc.com',
    //     billingEmail: 'billing@abc.com',
    //     expiresAt: '2024-12-31T00:00:00Z',
    //     features: ['courses', 'analytics', 'chat_support', 'custom_branding'],
    //   },
    //   {
    //     id: '2',
    //     name: 'StartUp XYZ',
    //     slug: 'startup-xyz',
    //     domain: 'xyz.klmsystem.test',
    //     contactEmail: 'contact@xyz.com',
    //     plan: TenantPlan.PRO,
    //     createdAt: '2024-02-01T00:00:00Z',
    //     updatedAt: '2024-02-10T00:00:00Z',
    //     isActive: true,
    //     maxUsers: 25,
    //     currentUsers: 12,
    //     storageLimit: 10,
    //     storageUsed: 3.2,
    //     expiresAt: '2024-07-01T00:00:00Z',
    //     features: ['courses', 'analytics'],
    //   },
    //   {
    //     id: '3',
    //     name: 'Corporación DEF',
    //     slug: 'corporacion-def',
    //     domain: 'def.klmsystem.test',
    //     contactEmail: 'it@def.com',
    //     plan: TenantPlan.ENTERPRISE,
    //     createdAt: '2023-12-01T00:00:00Z',
    //     updatedAt: '2024-01-25T00:00:00Z',
    //     isActive: false,
    //     maxUsers: 500,
    //     currentUsers: 0,
    //     storageLimit: 200,
    //     storageUsed: 45.8,
    //     features: ['courses', 'analytics', 'chat_support', 'custom_branding', 'sso', 'white_label'],
    //   }
    // ];

    const mockStats: TenantStats = {
      totalTenants: 3,
      activeTenants: 2,
      trialTenants: 1,
      expiredTenants: 0,
      totalUsers: 47,
      totalRevenue: 25000,
      storageUsed: 67.5,
      averageUsers: 15.67,
    };

    // const response: TenantListResponse = {
    //   data: tenants,
    //   total: 3,
    //   page: 1,
    //   limit: 20,
    // };

    return json<LoaderData>({ 
      tenants: tenants,
      stats: mockStats,
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading tenants:', error);
    return json<LoaderData>({ 
      tenants: { data: [], total: 0, page: 1, limit: 20 },
      stats: { totalTenants: 0, activeTenants: 0, trialTenants: 0, expiredTenants: 0, totalUsers: 0, totalRevenue: 0, storageUsed: 0, averageUsers: 0 },
      error: error.message || 'Error al cargar los tenants' 
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('_action') as string;
  const tenantId = formData.get('tenantId') as string;

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

      case 'bulk-delete':
        const tenantIds = formData.getAll('selectedTenants') as string[];
        // await Promise.all(tenantIds.map(id => TenantsAPI.delete(id)));
        return json<ActionData>({ 
          success: true, 
          action: 'bulk-delete' 
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

export default function TenantsIndex() {
  const { tenants, stats, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  const isSubmitting = navigation.state === 'submitting';

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localSearch) {
      newParams.set('search', localSearch);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Manejar filtros
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Manejar selección
  const handleSelectTenant = (tenantId: string) => {
    setSelectedTenants(prev => 
      prev.includes(tenantId) 
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTenants(
      selectedTenants.length === tenants.data.length 
        ? [] 
        : tenants.data.map(t => t.id)
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

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
          {actionData.action === 'bulk-delete' && 'Tenants eliminados exitosamente'}
        </div>
      )}

      {/* Panel de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Tenants</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Tenants Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeTenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tenants..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </Form>

            <select
              value={searchParams.get('status') || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value={SubscriptionStatus.ACTIVE}>Activo</option>
              <option value={SubscriptionStatus.TRIAL}>Trial</option>
              <option value={SubscriptionStatus.EXPIRED}>Expirado</option>
              <option value={SubscriptionStatus.SUSPENDED}>Suspendido</option>
            </select>

            <select
              value={searchParams.get('active') || ''}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-3">
            {selectedTenants.length > 0 && (
              <Form method="post" className="inline">
                <input type="hidden" name="_action" value="bulk-delete" />
                {selectedTenants.map(id => (
                  <input key={id} type="hidden" name="selectedTenants" value={id} />
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar ({selectedTenants.length})</span>
                </button>
              </Form>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>

            <Link
              to="/tenants/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Tenant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabla de tenants */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTenants.length === tenants.data.length && tenants.data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Almacenamiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.data.map((tenant) => (
                <TenantRow
                  key={tenant.id}
                  tenant={tenant}
                  isSelected={selectedTenants.includes(tenant.id)}
                  onSelect={() => handleSelectTenant(tenant.id)}
                  isSubmitting={isSubmitting}
                />
              ))}
            </tbody>
          </table>
        </div>

        {tenants.data.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tenants</h3>
            <p className="text-gray-600 mb-6">
              {searchParams.toString() 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay tenants creados'
              }
            </p>
            <Link
              to="/tenants/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primer tenant
            </Link>
          </div>
        )}
      </div>

      {/* Paginación */}
      {tenants.total > tenants.limit && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              disabled={tenants.page <= 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.ceil(tenants.total / tenants.limit) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`px-3 py-2 text-sm rounded-md ${
                  page === tenants.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={tenants.page >= Math.ceil(tenants.total / tenants.limit)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

// Componente para una fila de tenant en la tabla
function TenantRow({ 
  tenant, 
  isSelected, 
  onSelect, 
  isSubmitting 
}: { 
  tenant: Tenant, 
  isSelected: boolean, 
  onSelect: () => void,
  isSubmitting: boolean 
}) {
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
      month: 'short',
      day: 'numeric'
    });
  };

  const storagePercentage = (tenant.storageUsed / tenant.storageLimit) * 100;

  return (
    <tr className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
      </td>

      <td className="px-6 py-4">
        <div>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                <Link 
                  to={`/tenants/${tenant.id}`}
                  className="hover:text-blue-600"
                >
                  {tenant.name}
                </Link>
              </div>
              <div className="text-sm text-gray-500">{tenant.slug}</div>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Globe className="h-3 w-3 mr-1" />
                {tenant.domain}
              </div>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-900">
        <div>
          <div className="font-medium">
            {tenant.config?.currentUsers ?? 0} / {tenant.config?.maxUsers ?? 0}
          </div>
          <div className="text-gray-500 text-xs">
            {tenant.config?.maxUsers
              ? Math.round((tenant.config.currentUsers / tenant.config.maxUsers) * 100)
              : 0
            }% ocupado
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-900">
        <div>
          <div className="font-medium">{tenant.config?.storageUsed} / {tenant.config?.storageLimit} GB</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full ${storagePercentage > 80 ? 'bg-red-500' : storagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(tenant.createdAt)}
        </div>
      </td>

      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Link
            to={`/tenants/${tenant.id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
          <Link
            to={`/tenants/${tenant.id}/edit`}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit className="h-4 w-4" />
          </Link>

          <Form method="post" className="inline">
            <input type="hidden" name="_action" value="toggle-active" />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${tenant.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
            >
              {tenant.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Form>

          <Form 
            method="post" 
            className="inline"
            onSubmit={(e) => {
              if (!confirm('¿Estás seguro de que quieres eliminar este tenant? Esta acción no se puede deshacer.')) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="_action" value="delete" />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Form>
        </div>
      </td>
    </tr>
  );
}