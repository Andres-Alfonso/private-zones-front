// app/routes/sections/_index.tsx

import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Link, Form, useNavigation, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, 
  Image, FileText, Hash, CheckCircle, XCircle, Calendar,
  Layers3, ArrowUpDown, ChevronLeft, ChevronRight,
  TrendingUp,
  Building2,
  Users
} from 'lucide-react';
import { SectionApi } from '~/api/endpoints/sections';
import { SectionFilters, SectionListResponse } from '~/api/types/section.types';

// Tipos para las secciones
interface Section {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  description: string | null;
  thumbnailImagePath: string | null;
  order: number | null;
  allowBanner: boolean;
  bannerPath: string | null;
  courseCount?: number; // Contador de cursos asociados
  createdAt: string;
  updatedAt: string;
}

interface LoaderData {
  sections: SectionListResponse;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';
  const currentPage = parseInt(url.searchParams.get('page') || '1');
  const sortBy = url.searchParams.get('sortBy') || 'order';
  const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  const limit = 20;

  const tenantDomain = request.headers.get('host');

  try {

    const filters: SectionFilters = {
      search: url.searchParams.get('search') || undefined,
      isActive: url.searchParams.get('active') ? url.searchParams.get('active') === 'true' : undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '20'),
    };

    const sections = await SectionApi.getAll(filters, tenantDomain);

    console.log('Sections loaded:', sections);
    const { data, total, page, limit } = sections;
    
    // Filtrar por búsqueda
    let filteredSections = sections.data;
    // if (searchQuery) {
    //   filteredSections = sections.filter(section =>
    //     section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     section.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     (section.description && section.description.toLowerCase().includes(searchQuery.toLowerCase()))
    //   );
    // }

    // Ordenar
    // filteredSections.sort((a, b) => {
    //   let aValue: any;
    //   let bValue: any;

    //   switch (sortBy) {
    //     case 'name':
    //       aValue = a.name.toLowerCase();
    //       bValue = b.name.toLowerCase();
    //       break;
    //     case 'order':
    //       aValue = a.order || 999;
    //       bValue = b.order || 999;
    //       break;
    //     case 'courseCount':
    //       aValue = a.courseCount || 0;
    //       bValue = b.courseCount || 0;
    //       break;
    //     case 'createdAt':
    //       aValue = new Date(a.createdAt).getTime();
    //       bValue = new Date(b.createdAt).getTime();
    //       break;
    //     default:
    //       return 0;
    //   }

    //   if (sortOrder === 'asc') {
    //     return aValue > bValue ? 1 : -1;
    //   } else {
    //     return aValue < bValue ? 1 : -1;
    //   }
    // });

    // // Paginar
    const totalSections = filteredSections.length;
    const totalPages = Math.ceil(totalSections / limit);
    const startIndex = (currentPage - 1) * limit;
    const paginatedSections = filteredSections.slice(startIndex, startIndex + limit);

    return json<LoaderData>({ 
      sections: sections,
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading tenants:', error);
    return json<LoaderData>({ 
      sections: { data: [], total: 0, page: 1, limit: 20 },
      // stats: { totalTenants: 0, activeTenants: 0, trialTenants: 0, expiredTenants: 0, totalUsers: 0, totalRevenue: 0, storageUsed: 0, averageUsers: 0 },
      error: error.message || 'Error al cargar los tenants' 
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const sectionId = formData.get('sectionId') as string;

  try {
    switch (intent) {
      case 'delete':
        // Aquí se llamaría al API para eliminar la sección
        console.log('Eliminar sección:', sectionId);
        return json<ActionData>({ success: true });
      
      case 'toggle-banner':
        // Aquí se llamaría al API para cambiar el estado del banner
        console.log('Toggle banner para sección:', sectionId);
        return json<ActionData>({ success: true });

      default:
        return json<ActionData>({ error: 'Acción no válida' });
    }
  } catch (error: any) {
    console.error('Error en action:', error);
    return json<ActionData>({ error: error.message || 'Error interno del servidor' });
  }
};

export default function SectionsIndex() {
  const { sections, error } = useLoaderData<LoaderData>();

  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get('search') || '');
  // const [showFilters, setShowFilters] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Manejar búsqueda
  const handleSearch = (query: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (query) {
      newSearchParams.set('search', query);
    } else {
      newSearchParams.delete('search');
    }
    newSearchParams.set('page', '1'); // Reiniciar a la primera página
    setSearchParams(newSearchParams);
  };


  // Manejar selección de secciones
  const handleSelectSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSections(
      selectedSections.length === sections.data.length 
        ? [] 
        : sections.data.map(u => u.id)
    );
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

  // Efectos
  useEffect(() => {
    if (actionData?.success) {
      setSelectedSections([]);
    }
  }, [actionData]);

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar secciones..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(localSearchQuery)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-3">
            {/* <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button> */}

            {selectedSections.length > 0 && (
              <Form method="post" className="inline">
                <input type="hidden" name="intent" value="delete" />
                {selectedSections.map(id => (
                  <input key={id} type="hidden" name="sectionId" value={id} />
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar ({selectedSections.length})</span>
                </button>
              </Form>
            )}

            <Link
              to="/sections/create"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Nueva Sección</span>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Secciones</p>
                  {/* <p className="text-2xl font-bold text-gray-900">{totalSections}</p> */}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 transition-transform duration-200">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Con Banner</p>
                  <p className="text-2xl font-bold text-gray-900">{sections.data.filter(s => s.allowBanner).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Cursos</p>
                  <p className="text-2xl font-bold text-gray-900">{sections.data.reduce((sum, s) => sum + (s.courseCount || 0), 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Seleccionadas</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedSections.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
            
            {/* <div className="bg-white bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm p-4 rounded-xl">
              <div className="font-semibold text-gray-600 mb-1">Total de Secciones</div>
              <div className="text-2xl font-bold text-gray-900">{totalSections}</div>
            </div> */}
            {/* <div className="bg-white bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm p-4 rounded-xl">
              <div className="font-semibold text-gray-600 mb-1">Con Banner</div>
              <div className="text-2xl font-bold text-gray-900">
                {sections.filter(s => s.allowBanner).length}
              </div>
            </div> */}
            {/* <div className="bg-white bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm p-4 rounded-xl">
              <div className="font-semibold text-gray-600 mb-1">Total Cursos</div>
              <div className="text-2xl font-bold text-gray-900">
                {sections.reduce((sum, s) => sum + (s.courseCount || 0), 0)}
              </div>
            </div>
            <div className="bg-white bg-gradient-to-r shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm p-4 rounded-xl">
              <div className="font-semibold text-gray-600 mb-1">Seleccionadas</div>
              <div className="text-2xl font-bold text-gray-900">{selectedSections.length}</div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Tabla de secciones */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSections.length === sections.data.length && sections.data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('order')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Orden</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Sección</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('courseCount')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Cursos</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {sections.data.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => handleSelectSection(section.id)}
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      #{section.order || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {section.thumbnailImagePath ? (
                          <img
                            src={section.thumbnailImagePath}
                            alt={section.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Layers3 className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{section.name}</div>
                        <div className="text-sm text-gray-500">/{section.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {section.description || (
                        <span className="text-gray-400 italic">Sin descripción</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {section.allowBanner ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {section.courseCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/sections/${section.id}`}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/sections/${section.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="sectionId" value={section.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar"
                          onClick={(e) => {
                            if (!confirm('¿Estás seguro de que quieres eliminar esta sección?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
      </div>

      {/* Estado vacío */}
      {/* {sections.data.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
          <Layers3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No se encontraron secciones' : 'No hay secciones creadas'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Intenta cambiar los términos de búsqueda'
              : 'Comienza creando tu primera sección para organizar el contenido'
            }
          </p>
          {!searchQuery && (
            <Link
              to="/sections/create"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Primera Sección</span>
            </Link>
          )}
        </div>
      )} */}

      {/* Mensaje de éxito/error */}
      {actionData?.success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
          Operación realizada con éxito
        </div>
      )}
      
      {actionData?.error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">
          {actionData.error}
        </div>
      )}
    </div>
  );
}