// app/routes/assessments/_index.tsx

import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Link, Form, useNavigation, useSearchParams } from '@remix-run/react';
import { useState } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, 
  CheckCircle, XCircle, Calendar, ClipboardList, ArrowUpDown,
  TrendingUp, Building2, Users, Award, Clock
} from 'lucide-react';

// Tipos para las evaluaciones
interface Assessment {
  id: string;
  slug: string;
  type: 'evaluation' | 'survey' | 'self_assessment';
  status: 'draft' | 'published' | 'archived' | 'suspended';
  isActive: boolean;
  order: number;
  courseId: string;
  tenantId: string;
  created_at: string;
  updated_at: string;
  translations: Array<{
    languageCode: string;
    title: string;
    description: string;
  }>;
  configuration: {
    isGradable: boolean;
    maxScore: number;
    timeLimit: number | null;
    maxAttempts: number;
  };
  course?: {
    id: string;
    slug: string;
    translations: Array<{
      languageCode: string;
      title: string;
    }>;
  };
  // Estadísticas
  totalAttempts?: number;
  completedAttempts?: number;
  averageScore?: number;
}

interface LoaderData {
  assessments: Assessment[];
  stats: {
    total: number;
    active: number;
    draft: number;
    published: number;
    totalAttempts: number;
    averageScore: number;
  };
  error: string | null;
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';
  const typeFilter = url.searchParams.get('type') || '';
  const statusFilter = url.searchParams.get('status') || '';
  const courseFilter = url.searchParams.get('course') || '';

  try {
    // Aquí deberías llamar a tu API para obtener las evaluaciones
    // const assessments = await AssessmentAPI.getAll(filters, requestApiClient);

    // Por ahora simulamos datos
    const mockAssessments: Assessment[] = [
      {
        id: '1',
        slug: 'evaluacion-final-modulo-1',
        type: 'evaluation',
        status: 'published',
        isActive: true,
        order: 1,
        courseId: 'course-1',
        tenantId: 'tenant-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        translations: [
          {
            languageCode: 'es',
            title: 'Evaluación Final - Módulo 1',
            description: 'Evaluación comprensiva del primer módulo'
          }
        ],
        configuration: {
          isGradable: true,
          maxScore: 100,
          timeLimit: 60,
          maxAttempts: 3
        },
        course: {
          id: 'course-1',
          slug: 'curso-ejemplo',
          translations: [
            {
              languageCode: 'es',
              title: 'Curso de Ejemplo'
            }
          ]
        },
        totalAttempts: 45,
        completedAttempts: 42,
        averageScore: 78.5
      },
      {
        id: '2',
        slug: 'encuesta-satisfaccion',
        type: 'survey',
        status: 'published',
        isActive: true,
        order: 2,
        courseId: 'course-1',
        tenantId: 'tenant-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        translations: [
          {
            languageCode: 'es',
            title: 'Encuesta de Satisfacción',
            description: 'Evaluación de la experiencia del curso'
          }
        ],
        configuration: {
          isGradable: false,
          maxScore: 0,
          timeLimit: null,
          maxAttempts: 1
        },
        course: {
          id: 'course-1',
          slug: 'curso-ejemplo',
          translations: [
            {
              languageCode: 'es',
              title: 'Curso de Ejemplo'
            }
          ]
        },
        totalAttempts: 38,
        completedAttempts: 38,
        averageScore: 0
      },
      {
        id: '3',
        slug: 'autoevaluacion-conocimientos',
        type: 'self_assessment',
        status: 'draft',
        isActive: false,
        order: 3,
        courseId: 'course-2',
        tenantId: 'tenant-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        translations: [
          {
            languageCode: 'es',
            title: 'Autoevaluación de Conocimientos',
            description: 'Evalúa tu nivel de comprensión'
          }
        ],
        configuration: {
          isGradable: true,
          maxScore: 50,
          timeLimit: 30,
          maxAttempts: 0
        },
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0
      }
    ];

    // Filtrar
    let filteredAssessments = mockAssessments;
    
    if (searchQuery) {
      filteredAssessments = filteredAssessments.filter(a =>
        a.translations[0]?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter) {
      filteredAssessments = filteredAssessments.filter(a => a.type === typeFilter);
    }

    if (statusFilter) {
      filteredAssessments = filteredAssessments.filter(a => a.status === statusFilter);
    }

    if (courseFilter) {
      filteredAssessments = filteredAssessments.filter(a => a.courseId === courseFilter);
    }

    // Calcular estadísticas
    const stats = {
      total: mockAssessments.length,
      active: mockAssessments.filter(a => a.isActive).length,
      draft: mockAssessments.filter(a => a.status === 'draft').length,
      published: mockAssessments.filter(a => a.status === 'published').length,
      totalAttempts: mockAssessments.reduce((sum, a) => sum + (a.totalAttempts || 0), 0),
      averageScore: mockAssessments.filter(a => a.configuration.isGradable).reduce((sum, a) => sum + (a.averageScore || 0), 0) / mockAssessments.filter(a => a.configuration.isGradable).length || 0
    };

    return json<LoaderData>({ 
      assessments: filteredAssessments,
      stats,
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading assessments:', error);
    return json<LoaderData>({ 
      assessments: [],
      stats: { total: 0, active: 0, draft: 0, published: 0, totalAttempts: 0, averageScore: 0 },
      error: error.message || 'Error al cargar las evaluaciones' 
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const assessmentId = formData.get('assessmentId') as string;

  try {
    switch (intent) {
      case 'delete':
        // Aquí se llamaría al API para eliminar la evaluación
        console.log('Eliminar evaluación:', assessmentId);
        return json<ActionData>({ success: true });
      
      case 'toggle-active':
        // Aquí se llamaría al API para cambiar el estado activo
        console.log('Toggle active para evaluación:', assessmentId);
        return json<ActionData>({ success: true });

      default:
        return json<ActionData>({ error: 'Acción no válida' });
    }
  } catch (error: any) {
    console.error('Error en action:', error);
    return json<ActionData>({ error: error.message || 'Error interno del servidor' });
  }
};

export default function AssessmentsIndex() {
  const { assessments, stats, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get('search') || '');

  const isSubmitting = navigation.state === 'submitting';

  // Manejar búsqueda
  const handleSearch = (query: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (query) {
      newSearchParams.set('search', query);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
  };

  // Manejar selección
  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessments(prev =>
      prev.includes(assessmentId)
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAssessments(
      selectedAssessments.length === assessments.length 
        ? [] 
        : assessments.map(a => a.id)
    );
  };

  // Obtener tipo legible
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'evaluation': return 'Evaluación';
      case 'survey': return 'Encuesta';
      case 'self_assessment': return 'Autoevaluación';
      default: return type;
    }
  };

  // Obtener estado legible
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'published': return 'Publicada';
      case 'archived': return 'Archivada';
      case 'suspended': return 'Suspendida';
      default: return status;
    }
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                placeholder="Buscar evaluaciones..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(localSearchQuery)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-3">
            {selectedAssessments.length > 0 && (
              <Form method="post" className="inline">
                <input type="hidden" name="intent" value="delete" />
                {selectedAssessments.map(id => (
                  <input key={id} type="hidden" name="assessmentId" value={id} />
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar ({selectedAssessments.length})</span>
                </button>
              </Form>
            )}

            <Link
              to="/assessments/create"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Nueva Evaluación</span>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            
            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 group-hover:scale-110 transition-transform duration-200">
                  <ClipboardList className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Publicadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Borradores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 group-hover:scale-110 transition-transform duration-200">
                  <Edit2 className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Intentos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm bg-white/80 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 group-hover:scale-110 transition-transform duration-200">
                  <Award className="h-8 w-8 text-pink-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de evaluaciones */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssessments.length === assessments.length && assessments.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluación
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calificable
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intentos
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAssessments.includes(assessment.id)}
                      onChange={() => handleSelectAssessment(assessment.id)}
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {assessment.translations[0]?.title || 'Sin título'}
                        </div>
                        <div className="text-sm text-gray-500">/{assessment.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {getTypeLabel(assessment.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {assessment.course?.translations[0]?.title || 'Sin curso'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(assessment.status)}`}>
                      {getStatusLabel(assessment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {assessment.configuration.isGradable ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-900">
                      {assessment.completedAttempts}/{assessment.totalAttempts}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {assessment.configuration.isGradable ? (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {assessment.averageScore?.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/assessments/${assessment.id}`}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/assessments/${assessment.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="assessmentId" value={assessment.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar"
                          onClick={(e) => {
                            if (!confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) {
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
      </div>

      {/* Estado vacío */}
      {assessments.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {localSearchQuery ? 'No se encontraron evaluaciones' : 'No hay evaluaciones creadas'}
          </h3>
          <p className="text-gray-600 mb-6">
            {localSearchQuery 
              ? 'Intenta cambiar los términos de búsqueda'
              : 'Comienza creando tu primera evaluación para los estudiantes'
            }
          </p>
          {!localSearchQuery && (
            <Link
              to="/assessments/create"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Primera Evaluación</span>
            </Link>
          )}
        </div>
      )}

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