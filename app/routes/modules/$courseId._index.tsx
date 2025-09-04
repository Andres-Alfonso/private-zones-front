import { useState } from "react";
import { json, NavLink, useParams, useLoaderData, useSearchParams, useNavigate, useSubmit } from "@remix-run/react";
import { Plus, Search, Filter, Grid, List, SortAsc, SortDesc, Layers, Clock, Users, BookOpen, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { RoleGuard } from '~/components/AuthGuard';
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { createApiClientFromRequest } from "~/api/client";
import { ModuleAPI } from "~/api/endpoints/modules";
import { ModuleItem, ModuleFilters, ModulesResponse } from "../../api/types/modules.types";
import ModuleGrid from "~/components/modules/ModuleGrid";
import ConfirmDeleteModal from "~/components/modules/ConfirmDeleteModal";

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get('_action');
  const moduleId = formData.get('moduleId') as string;

  const authenticatedApiClient = createApiClientFromRequest(request);

  try {
    if (action === 'delete') {
      await ModuleAPI.deleteModule(moduleId, authenticatedApiClient);
      return json({ success: true, message: 'Módulo eliminado correctamente' });
    }
  } catch (error: any) {
    console.error('Error in module action:', error);
    return json({ 
      success: false, 
      message: error.message || 'Error al procesar la acción' 
    }, { status: 500 });
  }

  return json({ success: false, message: 'Acción no válida' }, { status: 400 });
};

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const courseId = params.courseId;

        if(!courseId){
            throw new Response("Course ID is required", { status: 400 });
        }

        const url = new URL(request.url);

        const filters: ModuleFilters = {
            search: url.searchParams.get('search') || '',
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '12'),
        }

        const authenticatedApiClient = createApiClientFromRequest(request);

        const apiResponse: ModulesResponse = await ModuleAPI.getAllModules(courseId, filters, authenticatedApiClient);

        return json({
            modules: apiResponse,
            courseId,
            error: null
        });
    } catch (error: any) {
        console.error('Error loading modules:', error);
        return json({
            modules: { 
                data: [], 
                pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
            },
            courseId: params.courseId,
            error: error.message || 'Error al cargar los módulos'
        });
    }
}

export default function CourseModulesIndex() {
    const { modules, courseId, error } = useLoaderData<{
        modules: ModulesResponse,
        courseId: string,
        error: string | null
    }>();

    const [searchParams, setSearchParams] = useSearchParams();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<ModuleItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const params = useParams();
    const navigate = useNavigate();
    const submit = useSubmit();

    // Estados para filtros
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

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
        // setSearchParams(newParams);
        // window.location.hash = 'content-modules';
        navigate(`?${newParams.toString()}#content-modules`);
    };

    // Paginación
    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        // setSearchParams(newParams);
        navigate(`?${newParams.toString()}#content-modules`);
    };

    // Limpiar búsqueda
    const handleClearSearch = () => {
        setLocalSearch('');
        // setSearchParams({});
        navigate(`?page=1#content-modules`);
    };

    // Manejar edición
    const handleEdit = (moduleId: string) => {
        navigate(`/modules/${moduleId}/edit`);
    };

    // Manejar eliminación
    const handleDelete = (moduleId: string) => {
        const module = modules.data.find(m => m.id === moduleId);
        if (module) {
            setModuleToDelete(module);
            setShowDeleteModal(true);
        }
    };

    // Confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!moduleToDelete) return;

        setIsDeleting(true);
        
        const formData = new FormData();
        formData.append('_action', 'delete');
        formData.append('moduleId', moduleToDelete.id);

        submit(formData, { 
            method: 'post',
            replace: true 
        });

        // Cerrar modal después de enviar
        setTimeout(() => {
            setShowDeleteModal(false);
            setModuleToDelete(null);
            setIsDeleting(false);
        }, 1000);
    };

    // Cancelar eliminación
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setModuleToDelete(null);
        setIsDeleting(false);
    };

    // Estadísticas calculadas
    const totalModules = modules.pagination.total;

    const activeModules = modules.data.filter(
    (module) => module?.configuration?.isActive
    );
    const activeModulesLength = activeModules.length;
    const inactiveModules = totalModules - activeModulesLength;

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/60 max-w-md mx-auto hover:shadow-2xl transition-all duration-300">
                    <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header con título y acciones principales */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                                    <Layers className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Módulos del Curso
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        Total de módulos: <span className="font-semibold text-purple-600">{totalModules}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
                            <NavLink
                                to={`/modules/course/${params.courseId}/create`}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Crear Módulo</span>
                            </NavLink>
                        </RoleGuard>
                    </div>
                </div>

                {/* Barra de búsqueda y filtros */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                        {/* Buscador */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-200 ${
                                    isSearchFocused ? 'text-purple-500 scale-110' : 'text-gray-400'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="Buscar módulos..."
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className={`w-full pl-10 pr-10 py-3 bg-white/60 backdrop-blur-sm border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 ${
                                        isSearchFocused 
                                            ? 'border-purple-300 ring-2 ring-purple-100 bg-white/80 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-white/70'
                                    }`}
                                />
                                {localSearch && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Controles de vista y filtros */}
                        <div className="flex items-center space-x-3">
                            {/* Filtros */}
                            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white/80 hover:border-gray-300 transition-all duration-200 font-medium">
                                <Filter className="h-4 w-4" />
                                <span>Filtros</span>
                            </button>

                            {/* Ordenamiento */}
                            <button 
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white/80 hover:border-gray-300 transition-all duration-200 font-medium"
                            >
                                {sortOrder === 'asc' ? (
                                    <SortAsc className="h-4 w-4" />
                                ) : (
                                    <SortDesc className="h-4 w-4" />
                                )}
                                <span>Orden</span>
                            </button>

                            {/* Separador */}
                            <div className="w-px h-6 bg-gray-300"></div>

                            {/* Vista Grid/List */}
                            <div className="flex bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        viewMode === 'grid'
                                            ? 'bg-purple-500 text-white shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                    }`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        viewMode === 'list'
                                            ? 'bg-purple-500 text-white shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <Layers className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Módulos</p>
                                <p className="text-2xl font-bold text-gray-900">{totalModules}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Módulos Activos</p>
                                <p className="text-2xl font-bold text-gray-900">{activeModulesLength}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Inactivos</p>
                                <p className="text-2xl font-bold text-gray-900">{inactiveModules}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área de contenido para módulos */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-8 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                    {modules.data.length > 0 ? (
                        <ModuleGrid 
                            modules={modules.data}
                            viewMode={viewMode}
                            hasAdminRole={true} // Puedes obtener esto del contexto de usuario
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6">
                                <Layers className="h-12 w-12 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {searchParams.toString() ? 'No se encontraron módulos' : 'No hay módulos creados'}
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {searchParams.toString() 
                                    ? 'Intenta ajustar los términos de búsqueda'
                                    : 'Comienza creando el primer módulo para organizar el contenido de tu curso de manera estructurada.'
                                }
                            </p>
                            
                            <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
                                <NavLink
                                    to={`/modules/course/${params.courseId}/create`}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>{searchParams.toString() ? 'Crear Módulo' : 'Crear Primer Módulo'}</span>
                                </NavLink>
                            </RoleGuard>
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {modules.pagination.total > modules.pagination.limit && (
                    <div className="flex justify-center">
                        <nav className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-3 hover:bg-white/90 transition-all duration-300">
                            <button
                                disabled={!modules.pagination.hasPrev}
                                onClick={() => handlePageChange(modules.pagination.page - 1)}
                                className="p-2 text-sm border border-gray-300/60 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm hover:scale-105 disabled:hover:scale-100"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            
                            {Array.from({ length: modules.pagination.totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium ${
                                        page === modules.pagination.page
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                                            : 'border border-gray-300/60 hover:bg-gray-50/80 backdrop-blur-sm hover:shadow-md hover:scale-105'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                disabled={!modules.pagination.hasNext}
                                onClick={() => handlePageChange(modules.pagination.page + 1)}
                                className="p-2 text-sm border border-gray-300/60 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm hover:scale-105 disabled:hover:scale-100"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                module={moduleToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isDeleting={isDeleting}
            />
        </>
    );
}