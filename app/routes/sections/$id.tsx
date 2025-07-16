// app/routes/sections/$id.tsx

import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Link, Form, useNavigation, useNavigate, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit2, Trash2, Eye, EyeOff, Copy, ExternalLink,
  Calendar, Hash, Users, BookOpen, Image, Settings,
  CheckCircle, XCircle, AlertCircle, Clock, Layers3,
  Share, Download, MoreVertical, Archive, RotateCcw
} from 'lucide-react';

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
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnailImagePath: string | null;
  isActive: boolean;
  currentStudents: number;
  maxStudents: number;
  createdAt: string;
}

interface LoaderData {
  section: Section | null;
  courses: Course[];
  error: string | null;
  isCreated?: boolean;
}

interface ActionData {
  success?: boolean;
  error?: string;
  message?: string;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  try {
    const sectionId = params.id as string;
    const url = new URL(request.url);
    const isCreated = url.searchParams.get('created') === 'true';
    
    if (!sectionId) {
      throw new Error('ID de sección no proporcionado');
    }
    
    // Datos mock - en una aplicación real, estos vendrían de la base de datos
    const mockSection: Section = {
      id: sectionId,
      tenantId: 'tenant-1',
      slug: 'colaboradores',
      name: 'Colaboradores',
      description: 'Sección dedicada a contenido para colaboradores internos de la empresa. Incluye cursos de capacitación, políticas internas, procedimientos operativos y desarrollo profesional.',
      thumbnailImagePath: '/images/sections/colaboradores.jpg',
      order: 1,
      allowBanner: true,
      bannerPath: '/images/banners/colaboradores-banner.jpg',
      courseCount: 12,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    };

    // Cursos mock asociados a esta sección
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Onboarding para Nuevos Colaboradores',
        slug: 'onboarding-nuevos-colaboradores',
        thumbnailImagePath: '/images/courses/onboarding.jpg',
        isActive: true,
        currentStudents: 25,
        maxStudents: 50,
        createdAt: '2024-01-16T09:00:00Z'
      },
      {
        id: '2',
        title: 'Políticas de Seguridad y Salud Ocupacional',
        slug: 'politicas-seguridad-salud',
        thumbnailImagePath: '/images/courses/seguridad.jpg',
        isActive: true,
        currentStudents: 42,
        maxStudents: 100,
        createdAt: '2024-01-18T11:30:00Z'
      },
      {
        id: '3',
        title: 'Desarrollo de Liderazgo Empresarial',
        slug: 'desarrollo-liderazgo',
        thumbnailImagePath: null,
        isActive: false,
        currentStudents: 8,
        maxStudents: 20,
        createdAt: '2024-01-20T14:00:00Z'
      }
    ];

    return json<LoaderData>({ 
      section: mockSection,
      courses: mockCourses,
      error: null,
      isCreated
    });
  } catch (error: any) {
    console.error('Error loading section details:', error);
    return json<LoaderData>({ 
      section: null,
      courses: [],
      error: error.message || 'Error al cargar los detalles de la sección'
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const sectionId = params.id as string;

  try {
    switch (intent) {
      case 'toggle-banner':
        // Aquí se llamaría al API para cambiar el estado del banner
        console.log('Toggle banner para sección:', sectionId);
        return json<ActionData>({ 
          success: true, 
          message: 'Estado del banner actualizado correctamente' 
        });

      case 'duplicate':
        // Aquí se llamaría al API para duplicar la sección
        console.log('Duplicar sección:', sectionId);
        return json<ActionData>({ 
          success: true, 
          message: 'Sección duplicada correctamente' 
        });

      case 'archive':
        // Aquí se llamaría al API para archivar la sección
        console.log('Archivar sección:', sectionId);
        return json<ActionData>({ 
          success: true, 
          message: 'Sección archivada correctamente' 
        });

      default:
        return json<ActionData>({ 
          error: 'Acción no válida' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error en action:', error);
    return json<ActionData>({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
};

export default function SectionDetail() {
  const { section, courses, error, isCreated } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Mostrar mensaje de creación exitosa
  useEffect(() => {
    if (isCreated) {
      const timer = setTimeout(() => {
        // Limpiar el parámetro de la URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('created');
        window.history.replaceState({}, '', newUrl.toString());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCreated]);

  // Ocultar mensajes después de un tiempo
  useEffect(() => {
    if (actionData?.success || actionData?.error) {
      const timer = setTimeout(() => {
        // Los mensajes se ocultarán automáticamente
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const copySlugToClipboard = async () => {
    if (section) {
      try {
        await navigator.clipboard.writeText(section.slug);
        setCopiedSlug(true);
        setTimeout(() => setCopiedSlug(false), 2000);
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la sección</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/sections')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Volver a Secciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4">Cargando detalles de la sección...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de éxito por creación */}
      {isCreated && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-800 font-medium">
              ¡Sección creada exitosamente! Puedes editarla o agregar cursos desde aquí.
            </p>
          </div>
        </div>
      )}

      {/* Header con información principal */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        {/* Banner de la sección */}
        {section.allowBanner && section.bannerPath && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={section.bannerPath}
              alt={`Banner de ${section.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white">
              <h1 className="text-2xl font-bold">{section.name}</h1>
              <p className="text-sm opacity-90">/{section.slug}</p>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Título para secciones sin banner */}
          {(!section.allowBanner || !section.bannerPath) && (
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-shrink-0">
                {section.thumbnailImagePath ? (
                  <img
                    src={section.thumbnailImagePath}
                    alt={section.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Layers3 className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{section.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Hash className="h-4 w-4" />
                  <span>{section.slug}</span>
                  <button
                    onClick={copySlugToClipboard}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar slug"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {copiedSlug && (
                    <span className="text-green-600 text-xs">¡Copiado!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/sections"
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a Secciones</span>
            </Link>

            <div className="flex items-center space-x-3">
              <Link
                to={`/sections/${section.id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <Form method="post" className="block">
                      <input type="hidden" name="intent" value="duplicate" />
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Duplicar sección</span>
                      </button>
                    </Form>
                    
                    <Form method="post" className="block">
                      <input type="hidden" name="intent" value="toggle-banner" />
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        {section.allowBanner ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            <span>Deshabilitar banner</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            <span>Habilitar banner</span>
                          </>
                        )}
                      </button>
                    </Form>
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    <Form method="post" className="block">
                      <input type="hidden" name="intent" value="archive" />
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Archive className="h-4 w-4" />
                        <span>Archivar sección</span>
                      </button>
                    </Form>
                    
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar sección</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información de la sección */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal - Descripción */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción</h3>
                {section.description ? (
                  <p className="text-gray-600 leading-relaxed">{section.description}</p>
                ) : (
                  <p className="text-gray-400 italic">No hay descripción disponible para esta sección.</p>
                )}
              </div>

              {/* Cursos de la sección */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cursos ({courses.length})
                  </h3>
                  <Link
                    to={`/courses/create?section=${section.id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Agregar Curso</span>
                  </Link>
                </div>

                {courses.length > 0 ? (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {course.thumbnailImagePath ? (
                              <img
                                src={course.thumbnailImagePath}
                                alt={course.title}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{course.title}</h4>
                                <p className="text-sm text-gray-500">/{course.slug}</p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-600">
                                  {course.currentStudents}/{course.maxStudents} estudiantes
                                </div>
                                <div className="flex items-center space-x-1">
                                  {course.isActive ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    course.isActive 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {course.isActive ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                                <Link
                                  to={`/courses/${course.id}`}
                                  className="p-1 text-gray-600 hover:text-blue-600 rounded transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">No hay cursos en esta sección</h4>
                    <p className="text-gray-600 mb-4">Comienza agregando el primer curso a esta sección</p>
                    <Link
                      to={`/courses/create?section=${section.id}`}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Crear Primer Curso</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Columna lateral - Metadatos */}
            <div className="space-y-6">
              {/* Información general */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Información General</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Orden:</span>
                    <span className="text-sm font-medium text-gray-900">#{section.order}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Banner:</span>
                    <div className="flex items-center space-x-1">
                      {section.allowBanner ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {section.allowBanner ? 'Permitido' : 'No permitido'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total cursos:</span>
                    <span className="text-sm font-medium text-gray-900">{courses.length}</span>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Fechas</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Creada:</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(section.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Última actualización:</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(section.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identificadores */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Identificadores</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">ID:</span>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">{section.id}</code>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Tenant ID:</span>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">{section.tenantId}</code>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Acciones Rápidas</h4>
                <div className="space-y-2">
                  <Link
                    to={`/sections/${section.id}/edit`}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar Sección</span>
                  </Link>
                  <Link
                    to={`/courses?section=${section.id}`}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Ver Cursos</span>
                  </Link>
                  <button
                    onClick={copySlugToClipboard}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share className="h-4 w-4" />
                    <span>Copiar Enlace</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Eliminar sección?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción no se puede deshacer. La sección "{section.name}" y todos sus datos asociados serán eliminados permanentemente.
                {courses.length > 0 && (
                  <span className="block mt-2 font-medium text-amber-600">
                    Advertencia: Esta sección tiene {courses.length} curso(s) asociado(s).
                  </span>
                )}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <Link
                  to="/sections"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
                  onClick={(e) => {
                    // En una aplicación real, aquí se haría la eliminación
                    console.log('Eliminar sección:', section.id);
                  }}
                >
                  Eliminar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de feedback */}
      {actionData?.success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          {actionData.message || 'Operación realizada con éxito'}
        </div>
      )}
      
      {actionData?.error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          {actionData.error}
        </div>
      )}
    </div>
  );
}