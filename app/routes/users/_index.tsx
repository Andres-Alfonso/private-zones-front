// app/routes/users/_index.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, Users, 
  Mail, Phone, Calendar, AlertCircle, MoreHorizontal,
  Download, Upload, TrendingUp, UserCheck, UserX, Shield,
  Clock, MapPin, Briefcase
} from "lucide-react";
import { 
  User, 
  UserFilters,
  UserListResponse,
  UserStats,
  UserRole,
  USER_ROLES,
  USER_DEPARTMENTS
} from "~/api/types/user.types";
import { UsersAPI } from "~/api/endpoints/users";
import { formatUserName, getUserStatus, formatUserRoles } from "~/utils/userValidation";

interface LoaderData {
  users: UserListResponse;
  stats: UserStats;
  departments: string[];
  roles: Array<{ id: string; name: string; description: string }>;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
  action?: 'toggle-active' | 'delete' | 'bulk-delete' | 'assign-role' | 'reset-password';
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const filters: UserFilters = {
      search: url.searchParams.get('search') || undefined,
      role: url.searchParams.get('role') || undefined,
      isActive: url.searchParams.get('active') ? url.searchParams.get('active') === 'true' : undefined,
      isEmailVerified: url.searchParams.get('verified') ? url.searchParams.get('verified') === 'true' : undefined,
      department: url.searchParams.get('department') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
      sortBy: url.searchParams.get('sortBy') as any || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
    };

    // En producción, aquí harías las llamadas reales al API
    // const users = await UsersAPI.getAll(filters);
    // const stats = await UsersAPI.getStats();
    // const departments = await UsersAPI.getDepartments();
    // const roles = await UsersAPI.getRoles();

    // Datos simulados
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@empresa.com',
        name: 'Juan',
        lastName: 'Pérez',
        fullName: 'Juan Pérez',
        avatar: 'https://via.placeholder.com/40',
        phone: '+57 300 123 4567',
        roles: ['admin'],
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: '2024-01-20T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z',
        loginCount: 45,
        twoFactorEnabled: true,
        tenantId: 'tenant-1',
        profile: {
          id: '1',
          userId: '1',
          jobTitle: 'Administrador de Sistemas',
          department: 'Tecnología',
          location: 'Bogotá, Colombia',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          preferredCurrency: 'COP',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      },
      {
        id: '2',
        email: 'maria.garcia@empresa.com',
        name: 'María',
        lastName: 'García',
        fullName: 'María García',
        phone: '+57 301 987 6543',
        roles: ['instructor', 'moderator'],
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: '2024-01-19T15:45:00Z',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-19T15:45:00Z',
        loginCount: 32,
        twoFactorEnabled: false,
        tenantId: 'tenant-1',
        profile: {
          id: '2',
          userId: '2',
          jobTitle: 'Instructora Senior',
          department: 'Educación',
          location: 'Medellín, Colombia',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          preferredCurrency: 'COP',
          notifications: {
            email: true,
            push: false,
            sms: true
          }
        }
      },
      {
        id: '3',
        email: 'carlos.rodriguez@empresa.com',
        name: 'Carlos',
        lastName: 'Rodríguez',
        fullName: 'Carlos Rodríguez',
        roles: ['student'],
        isActive: false,
        isEmailVerified: false,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        loginCount: 0,
        twoFactorEnabled: false,
        tenantId: 'tenant-1',
        profile: {
          id: '3',
          userId: '3',
          jobTitle: 'Estudiante',
          department: 'Marketing',
          location: 'Cali, Colombia',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          preferredCurrency: 'COP',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      }
    ];

    const mockStats: UserStats = {
      totalUsers: 3,
      activeUsers: 2,
      inactiveUsers: 1,
      verifiedUsers: 2,
      unverifiedUsers: 1,
      usersWithTwoFactor: 1,
      newUsersThisMonth: 2,
      averageLoginCount: 25.7,
      topRoles: [
        { role: 'student', count: 1 },
        { role: 'instructor', count: 1 },
        { role: 'admin', count: 1 }
      ],
      topDepartments: [
        { department: 'Tecnología', count: 1 },
        { department: 'Educación', count: 1 },
        { department: 'Marketing', count: 1 }
      ]
    };

    const response: UserListResponse = {
      data: mockUsers,
      total: 3,
      page: 1,
      limit: 20,
    };

    return json<LoaderData>({ 
      users: response,
      stats: mockStats,
      departments: USER_DEPARTMENTS.slice(),
      roles: USER_ROLES.map(role => ({ 
        id: role.value, 
        name: role.label, 
        description: role.description 
      })),
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading users:', error);
    return json<LoaderData>({ 
      users: { data: [], total: 0, page: 1, limit: 20 },
      stats: { 
        totalUsers: 0, activeUsers: 0, inactiveUsers: 0, verifiedUsers: 0, 
        unverifiedUsers: 0, usersWithTwoFactor: 0, newUsersThisMonth: 0, 
        averageLoginCount: 0, topRoles: [], topDepartments: [] 
      },
      departments: [],
      roles: [],
      error: error.message || 'Error al cargar los usuarios' 
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
        // await UsersAPI.toggleActive(userId);
        return json<ActionData>({ 
          success: true, 
          action: 'toggle-active' 
        });

      case 'delete':
        // await UsersAPI.delete(userId);
        return json<ActionData>({ 
          success: true, 
          action: 'delete' 
        });

      case 'bulk-delete':
        const userIds = formData.getAll('selectedUsers') as string[];
        // await UsersAPI.bulkActions('delete', userIds);
        return json<ActionData>({ 
          success: true, 
          action: 'bulk-delete' 
        });

      case 'reset-password':
        // await UsersAPI.resetPassword(userId);
        return json<ActionData>({ 
          success: true, 
          action: 'reset-password' 
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

export default function UsersIndex() {
  const { users, stats, departments, roles, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

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
      // Cambiar orden si es la misma columna
      newParams.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nueva columna, orden descendente por defecto
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
          {actionData.action === 'toggle-active' && 'Estado del usuario actualizado exitosamente'}
          {actionData.action === 'delete' && 'Usuario eliminado exitosamente'}
          {actionData.action === 'bulk-delete' && 'Usuarios eliminados exitosamente'}
          {actionData.action === 'reset-password' && 'Contraseña restablecida exitosamente'}
        </div>
      )}

      {/* Panel de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
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
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Email Verificado</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.verifiedUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Nuevos Este Mes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newUsersThisMonth}</p>
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
                  placeholder="Buscar usuarios..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </Form>

            <select
              value={searchParams.get('role') || ''}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            <select
              value={searchParams.get('department') || ''}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={searchParams.get('active') || ''}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>

            <select
              value={searchParams.get('verified') || ''}
              onChange={(e) => handleFilterChange('verified', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Verificación email</option>
              <option value="true">Verificados</option>
              <option value="false">No verificados</option>
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
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar ({selectedUsers.length})</span>
                </button>
              </Form>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>

            <Link
              to="/users/create"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.data.length && users.data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Usuario
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastLoginAt')}
                >
                  Última Conexión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600 mb-6">
              {searchParams.toString() 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay usuarios registrados'
              }
            </p>
            <Link
              to="/users/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primer usuario
            </Link>
          </div>
        )}
      </div>

      {/* Paginación */}
      {users.total > users.limit && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              disabled={users.page <= 1}
              onClick={() => handlePageChange(users.page - 1)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.ceil(users.total / users.limit) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm rounded-md ${
                  page === users.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={users.page >= Math.ceil(users.total / users.limit)}
              onClick={() => handlePageChange(users.page + 1)}
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
  const userStatus = getUserStatus(user);
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.avatar ? (
              <img 
                className="h-10 w-10 rounded-full object-cover" 
                src={user.avatar} 
                alt={formatUserName(user)}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.name.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              <Link 
                to={`/users/${user.id}`}
                className="hover:text-blue-600"
              >
                {formatUserName(user)}
              </Link>
            </div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
            {user.profile?.jobTitle && (
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Briefcase className="h-3 w-3 mr-1" />
                {user.profile.jobTitle}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <a href={`mailto:${user.email}`} className="hover:text-blue-600">
              {user.email}
            </a>
            {user.isEmailVerified && (
              <span className="ml-2 text-green-500" title="Email verificado">✓</span>
            )}
          </div>
          {user.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <a href={`tel:${user.phone}`} className="hover:text-blue-600">
                {user.phone}
              </a>
            </div>
          )}
          {user.profile?.location && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              {user.profile.location}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {user.roles.map(role => (
            <span 
              key={role}
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                role === 'admin' ? 'bg-red-100 text-red-800' :
                role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                role === 'instructor' ? 'bg-purple-100 text-purple-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {role}
            </span>
          ))}
        </div>
        {user.profile?.department && (
          <div className="text-xs text-gray-500 mt-1">{user.profile.department}</div>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userStatus.color}`}>
            {userStatus.label}
          </span>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {user.twoFactorEnabled && (
              <span className="flex items-center" title="2FA habilitado">
                <Shield className="h-3 w-3 mr-1 text-green-500" />
                2FA
              </span>
            )}
            <span title="Número de inicios de sesión">
              {user.loginCount} login{user.loginCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {formatDate(user.lastLoginAt)}
        </div>
      </td>

      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Link
            to={`/users/${user.id}`}
            className="text-blue-600 hover:text-blue-900"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
          <Link
            to={`/users/${user.id}/edit`}
            className="text-gray-600 hover:text-gray-900"
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
              className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
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
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
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