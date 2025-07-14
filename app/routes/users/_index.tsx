// app/routes/users/_index.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation, useSearchParams } from "@remix-run/react";
import { getSession, commitSession } from "~/utils/session.server";
import { useState } from "react";
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, Users, 
  Mail, Phone, Calendar, AlertCircle, MoreHorizontal,
  Download, Upload, TrendingUp, UserCheck, UserX, Shield,
  Clock, MapPin, Briefcase, Building2, FileText, Globe,
  Star, ChevronLeft, ChevronRight
} from "lucide-react";
import { UsersAPI } from "~/api/endpoints/users";
import { formatUserName, getUserStatus, formatUserRoles } from "~/utils/userValidation";

// Tipos basados en las entidades reales
interface User {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  tenantId: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  
  // Relación con tenant
  tenant?: {
    id: string;
    name: string;
  };
  
  // Configuración de perfil
  profileConfig?: {
    id: string;
    avatarPath?: string;
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
    dateOfBirth?: Date;
  };
  
  // Configuración de notificaciones
  notificationConfig?: {
    enableNotifications: boolean;
    smsNotifications: boolean;
    browserNotifications: boolean;
  };
}

interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  tenantId?: string;
  page: number;
  limit: number;
  // sortBy: string;
  // sortOrder: 'asc' | 'desc';
}

interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  usersByRole: Array<{ role: string; count: number }>;
  usersByTenant: Array<{ tenant: string; count: number }>;
}

interface LoaderData {
  users: UserListResponse;
  stats: UserStats;
  tenants: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string; description: string }>;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
  action?: 'toggle-active' | 'delete' | 'bulk-delete' | 'reset-password';
}

export const loader: LoaderFunction = async ({ request }) => {

  const session = await getSession(request.headers.get("Cookie"));
  
  // Obtener mensajes flash de la sesión
  const successMessage = session.get("success");
  const errorMessage = session.get("error");
  
  let flashMessage;
  if (successMessage) {
    flashMessage = { type: 'success' as const, message: successMessage };
  } else if (errorMessage) {
    flashMessage = { type: 'error' as const, message: errorMessage };
  }

  try {
    const url = new URL(request.url);
    const filters: UserFilters = {
      search: url.searchParams.get('search') || undefined,
      role: url.searchParams.get('role') || undefined,
      isActive: url.searchParams.get('active') ? url.searchParams.get('active') === 'true' : undefined,
      tenantId: url.searchParams.get('tenant') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
      // sortBy: url.searchParams.get('sortBy') || 'createdAt',
      // sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
    };

    // En producción, aquí harías las llamadas reales al API
    // const users = await UsersAPI.getAll(filters);
    // const stats = await UsersAPI.getStats();
    // const departments = await UsersAPI.getDepartments();
    // const roles = await UsersAPI.getRoles();

    // Realizar llamadas paralelas a la API
    const [users, stats, tenants, roles] = await Promise.all([
      UsersAPI.getAll(filters),
      UsersAPI.getStats(),
      UsersAPI.getTenants(),
      UsersAPI.getRoles()
    ]);

    

    return json<LoaderData>({ 
      users,
      stats,
      tenants,
      roles,
      error: null,
      flashMessage
    },{
      headers: {
        "Set-Cookie": await commitSession(session), // Esto limpia los mensajes flash
      },
    });
  } catch (error: any) {
    console.error('Error loading users:', error);
    
    // Determinar el tipo de error y devolver mensaje apropiado
    let errorMessage = 'Error al cargar los usuarios';
    
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para ver esta información.';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = error.response.data?.message || 'Error del servidor';
      }
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se puede conectar con el servidor.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return json<LoaderData>({ 
      users: { data: [], total: 0, page: 1, limit: 20 },
      stats: { 
        totalUsers: 0, activeUsers: 0, inactiveUsers: 0, 
        newUsersThisMonth: 0, usersByRole: [], usersByTenant: [] 
      },
      tenants: [],
      roles: [],
      error: errorMessage 
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('_action') as string;
  const userId = formData.get('userId') as string;

  try {
    switch (action) {
      case 'toggle-active':
        await UsersAPI.toggleActive(userId);
        return json<ActionData>({ 
          success: true, 
          action: 'toggle-active' 
        });

      case 'delete':
        await UsersAPI.delete(userId);
        return json<ActionData>({ 
          success: true, 
          action: 'delete' 
        });

      case 'bulk-delete':
        const userIds = formData.getAll('selectedUsers') as string[];
        await UsersAPI.bulkActions('delete', userIds);
        return json<ActionData>({ 
          success: true, 
          action: 'bulk-delete' 
        });

      case 'reset-password':
        await UsersAPI.resetPassword(userId);
        return json<ActionData>({ 
          success: true, 
          action: 'reset-password' 
        });

      default:
        throw new Error('Acción no válida');
    }
  } catch (error: any) {
    console.error('Error processing action:', error);
    
    let errorMessage = 'Error al procesar la acción';
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      switch (status) {
        case 401:
          errorMessage = 'No autorizado para realizar esta acción.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado.';
          break;
        case 400:
          errorMessage = errorData?.message || 'Datos inválidos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = errorData?.message || 'Error del servidor';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return json<ActionData>({ 
      error: errorMessage
    });
  }
};

export default function UsersIndex() {
  const { users, stats, tenants, roles, error, flashMessage } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
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

  // Manejar ordenamiento
  const handleSort = (sortBy: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentSortBy = searchParams.get('sortBy');
    const currentSortOrder = searchParams.get('sortOrder') || 'desc';
    
    if (currentSortBy === sortBy) {
      newParams.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      newParams.set('sortBy', sortBy);
      newParams.set('sortOrder', 'desc');
    }
    
    setSearchParams(newParams);
  };

  // Manejar selección
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.data.length 
        ? [] 
        : users.data.map(u => u.id)
    );
  };

  // Manejar paginación
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const formatUserName = (user: User) => {
    return [user.name, user.lastName].filter(Boolean).join(' ');
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mostrar alerta si hay mensaje flash */}
      {flashMessage && (
        <Alert 
          type={flashMessage.type} 
          message={flashMessage.message}
          dismissible 
        />
      )}
      
      {/* Mensajes de estado */}
      {actionData?.error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 text-green-700 px-6 py-4 rounded-xl shadow-lg">
          {actionData.action === 'toggle-active' && 'Estado del usuario actualizado exitosamente'}
          {actionData.action === 'delete' && 'Usuario eliminado exitosamente'}
          {actionData.action === 'bulk-delete' && 'Usuarios eliminados exitosamente'}
          {actionData.action === 'reset-password' && 'Contraseña restablecida exitosamente'}
        </div>
      )}

      {/* Panel de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <UserX className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nuevos Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 backdrop-blur-sm"
                />
              </div>
            </Form>

            <select
              value={searchParams.get('role') || ''}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 backdrop-blur-sm"
            >
              <option value="">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            <select
              value={searchParams.get('tenant') || ''}
              onChange={(e) => handleFilterChange('tenant', e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 backdrop-blur-sm"
            >
              <option value="">Todos los tenants</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>

            <select
              value={searchParams.get('active') || ''}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/60 backdrop-blur-sm"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-3">
            {selectedUsers.length > 0 && (
              <Form method="post" className="inline">
                <input type="hidden" name="_action" value="bulk-delete" />
                {selectedUsers.map(id => (
                  <input key={id} type="hidden" name="selectedUsers" value={id} />
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar ({selectedUsers.length})</span>
                </button>
              </Form>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200 bg-white/60 backdrop-blur-sm">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>

            <Link
              to="/users/create"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.data.length && users.data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Usuario
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Roles & Tenant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  Fecha Registro
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/60 backdrop-blur-sm divide-y divide-gray-200/50">
              {users.data.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.includes(user.id)}
                  onSelect={() => handleSelectUser(user.id)}
                  isSubmitting={isSubmitting}
                />
              ))}
            </tbody>
          </table>
        </div>

        {users.data.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-600 mb-6">
                {searchParams.toString() 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay usuarios registrados'
                }
              </p>
              <Link
                to="/users/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear primer usuario
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Paginación */}
      {users.total > users.limit && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-2">
            <button
              disabled={users.page <= 1}
              onClick={() => handlePageChange(users.page - 1)}
              className="p-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.ceil(users.total / users.limit) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  page === users.page
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={users.page >= Math.ceil(users.total / users.limit)}
              onClick={() => handlePageChange(users.page + 1)}
              className="p-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

// Componente para una fila de usuario
function UserRow({ 
  user, 
  isSelected, 
  onSelect, 
  isSubmitting 
}: { 
  user: User, 
  isSelected: boolean, 
  onSelect: () => void,
  isSubmitting: boolean 
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatUserName = (user: User) => {
    return [user.name, user.lastName].filter(Boolean).join(' ');
  };

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-blue-50/80' : 'hover:bg-gray-50/80'}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            {user.profileConfig?.avatarPath ? (
              <img 
                className="h-12 w-12 rounded-xl object-cover shadow-md" 
                src={user.profileConfig.avatarPath} 
                alt={formatUserName(user)}
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-white">
                  {user.name.charAt(0)}{user.lastName?.charAt(0) || ''}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">
              <Link 
                to={`/users/${user.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {formatUserName(user)}
              </Link>
            </div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
            {user.profileConfig?.Charge && (
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Briefcase className="h-3 w-3 mr-1" />
                {user.profileConfig.Charge}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <a href={`mailto:${user.email}`} className="hover:text-blue-600 transition-colors">
              {user.email}
            </a>
          </div>
          {user.profileConfig?.phoneNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <a href={`tel:${user.profileConfig.phoneNumber}`} className="hover:text-blue-600 transition-colors">
                {user.profileConfig.phoneNumber}
              </a>
            </div>
          )}
          {user.profileConfig?.City && user.profileConfig?.Country && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              {user.profileConfig.City}, {user.profileConfig.Country}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {user.roles.map(role => (
              <span 
                key={role}
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  role === 'admin' ? 'bg-red-100 text-red-800' :
                  role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {role}
              </span>
            ))}
          </div>
          {user.tenant && (
            <div className="flex items-center text-xs text-gray-500">
              <Building2 className="h-3 w-3 mr-1" />
              {user.tenant.name}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
            user.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </span>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {user.notificationConfig?.enableNotifications && (
              <span className="flex items-center" title="Notificaciones habilitadas">
                <Mail className="h-3 w-3 mr-1 text-blue-500" />
                Notif.
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(user.createdAt)}
        </div>
      </td>

      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Link
            to={`/users/${user.id}`}
            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
          <Link
            to={`/users/${user.id}/edit`}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1"
            title="Editar usuario"
          >
            <Edit className="h-4 w-4" />
          </Link>

          <Form method="post" className="inline">
            <input type="hidden" name="_action" value="toggle-active" />
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`p-1 transition-colors disabled:opacity-50 ${
                user.isActive 
                  ? 'text-red-600 hover:text-red-900' 
                  : 'text-green-600 hover:text-green-900'
              }`}
              title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
            >
              {user.isActive ? <EyeOff className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </button>
          </Form>

          <Form 
            method="post" 
            className="inline"
            onSubmit={(e) => {
              if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="_action" value="delete" />
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors p-1"
              title="Eliminar usuario"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Form>
        </div>
      </td>
    </tr>
  );
}