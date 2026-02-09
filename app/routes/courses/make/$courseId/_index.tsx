// app/routes/courses/make/$courseId/_index.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
// import "~/css/styles.css";
import { useLoaderData, Link, useParams, NavLink } from "@remix-run/react";
import {
    BookOpen, Play, FileText, MessageSquare, ClipboardCheck,
    BarChart3, Users, Calendar, Clock, Star, ChevronRight,
    PlayCircle, CheckCircle, Lock, Trophy, Target, Award,
    TrendingUp, Zap
} from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { RoleGuard } from "~/components/AuthGuard";

interface CourseModuleCard {
    id: string;
    title: string;
    description: string;
    thumbnailImagePath: string;
    items: ModuleItemCard[];
    stats: {
        totalItems: number;
        completedItems: number;
        totalDuration: number;
    };
}

interface ModuleItemCard {
    id: string;
    type: 'content' | 'forum' | 'task' | 'quiz' | 'survey' | 'activity';
    referenceId: string;
    order: number;
    title: string;
    duration?: number;
    isCompleted?: boolean;
    isLocked?: boolean;
}

interface CourseIndexData {
    id: string;
    courseTitle: string;
    colorTitle: string;
    modules: CourseModuleCard[];
    userProgress: {
        overallProgress: number;
        completedItems: string[];
        nextRecommendedItem?: {
            moduleId: string;
            itemId: string;
            type: string;
            referenceId: string;
            title: string;
            moduleTitle: string;
        };
    };
    // achievements: Array<{
    //   id: string;
    //   title: string;
    //   description: string;
    //   icon: string;
    //   unlockedAt?: string;
    // }>;
}

interface LoaderData {
    data: CourseIndexData;
    error: string | null;
}

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
    const courseTitle = data?.data?.courseTitle || 'Curso';
    return [
        { title: `${courseTitle} - Vista Principal` },
    ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const { courseId } = params;

    if (!courseId) {
        throw new Error('Course ID is required');
    }

    try {

        // 1. Crear cliente autenticado
        const authenticatedApiClient = createApiClientFromRequest(request);

        // 🔄 API CALLS - Reemplazar con llamadas reales
        const courseData = await CoursesAPI.getById(courseId, authenticatedApiClient);
        const userProgress = await CoursesAPI.getUserProgress(courseId, authenticatedApiClient);
        // const achievements = await CourseAPI.getUserAchievements(courseId, userId);

        // console.log('courseData',courseData);
        // console.log('userProgress', userProgress);

        const combined: CourseIndexData = {
            ...courseData,
            userProgress
        };

        // console.log('combined',combined);

        // Datos mockeados
        const mockData: CourseIndexData = {
            courseId: courseId || '1',
            courseTitle: 'Introducción al Desarrollo Web Moderno',
            colorTitle: '#2563eb',
            modules: [
                {
                    id: '1',
                    title: 'Fundamentos de HTML',
                    description: 'Aprende la estructura básica de las páginas web con HTML5. Domina las etiquetas, elementos y semántica del lenguaje de marcado más importante del web.',
                    thumbnailImagePath: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
                    stats: {
                        totalItems: 5,
                        completedItems: 3,
                        totalDuration: 150
                    },
                    items: [
                        {
                            id: '1', type: 'content', referenceId: 'content_1', order: 1,
                            title: 'Introducción a HTML', duration: 30, isCompleted: true
                        },
                        {
                            id: '2', type: 'content', referenceId: 'content_2', order: 2,
                            title: 'Etiquetas y elementos HTML', duration: 45, isCompleted: true
                        },
                        {
                            id: '3', type: 'content', referenceId: 'content_3', order: 3,
                            title: 'Formularios HTML', duration: 60, isCompleted: true
                        },
                        {
                            id: '4', type: 'quiz', referenceId: 'quiz_1', order: 4,
                            title: 'Evaluación HTML Básico', duration: 15, isCompleted: false
                        }
                    ]
                },
                {
                    id: '2',
                    title: 'Estilos con CSS',
                    description: 'Domina el diseño y la presentación con CSS3. Aprende selectores, propiedades, layouts y animaciones para crear interfaces web atractivas.',
                    thumbnailImagePath: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
                    stats: {
                        totalItems: 6,
                        completedItems: 0,
                        totalDuration: 220
                    },
                    items: [
                        {
                            id: '5', type: 'content', referenceId: 'content_4', order: 1,
                            title: 'Introducción a CSS', duration: 40, isCompleted: false, isLocked: true
                        }
                    ]
                },
                {
                    id: '3',
                    title: 'JavaScript Interactivo',
                    description: 'Añade interactividad y dinamismo a tus páginas web con JavaScript. Aprende programación, manipulación del DOM y eventos.',
                    thumbnailImagePath: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
                    stats: {
                        totalItems: 8,
                        completedItems: 0,
                        totalDuration: 320
                    },
                    items: []
                }
            ],
            userProgress: {
                overallProgress: 60,
                completedItems: ['1', '2', '3'],
                nextRecommendedItem: {
                    moduleId: '1',
                    itemId: '4',
                    type: 'quiz',
                    referenceId: 'quiz_1',
                    title: 'Evaluación HTML Básico',
                    moduleTitle: 'Fundamentos de HTML'
                }
            }
        };

        return json<LoaderData>({
            data: combined,
            error: null
        });
    } catch (error: any) {
        console.error('Error loading course index:', error);
        return json<LoaderData>({
            data: {} as CourseIndexData,
            error: error.message || 'Error al cargar la vista del curso'
        });
    }
};

export default function CourseIndex() {
    const { data, error } = useLoaderData<LoaderData>();
    const params = useParams();

    const titleColor = data?.colorTitle || '#2563eb';

    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
                        <BookOpen className="mx-auto h-16 w-16 text-red-400 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h1>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const getModuleProgress = (module: CourseModuleCard) => {
        const completed = module.stats?.completedItems || 0;
        const total = module.stats?.totalItems || 0;

        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return progress;
    };

    const isModuleLocked = (moduleIndex: number) => {
        if (moduleIndex === 0) return false;
        const prevModule = data.modules[moduleIndex - 1];
        return getModuleProgress(prevModule) < 100;
    };

    const getNextAvailableItem = (module: CourseModuleCard) => {
        return module.items.find(item => !item.isCompleted && !item.isLocked);
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <RoleGuard requiredRoles={['instructor', 'admin', 'superadmin']}>
                    <div className="card bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                        <div className="text-sm text-gray-600 flex flex-col space-y-3">
                            <p className="text-gray-700 text-sm font-medium">
                            Aquí puedes puedes ver los módulos para el curso.
                            </p>
                            <div className="inline-flex">
                            <NavLink
                                to={`/modules/course/${params.courseId}`}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold w-auto"
                            >
                                Ver todos los Módulos
                            </NavLink>
                            </div>
                        </div>
                    </div>
                </RoleGuard>

                {/* Welcome Section */}
                <div className="text-center mb-8">
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Continúa tu aprendizaje donde lo dejaste. Estás progresando muy bien, ¡sigue así!
                    </p>
                </div>

                {/* Quick Actions & Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 select-none">
                    {/* Continue Learning */}
                    <div className="lg:col-span-2">
                        {data.userProgress.nextRecommendedItem ? (
                            // Contenido cuando hay siguiente ítem recomendado
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                                <div className="relative">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Target className="h-6 w-6" />
                                        <span className="font-semibold">Continuar Aprendiendo</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {data.userProgress.nextRecommendedItem.title}
                                    </h3>
                                    <p className="text-blue-100 mb-4">
                                        {data.userProgress.nextRecommendedItem.moduleTitle}
                                    </p>

                                    <Link
                                        to={`/make/courses/${data.id}/${data.userProgress.nextRecommendedItem.type}/${data.userProgress.nextRecommendedItem.referenceId}#main-content`}
                                        className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
                                    >
                                        <Play className="h-5 w-5" />
                                        <span>Continuar</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            // Mensaje de completación cuando no hay siguiente ítem
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                                <div className="relative text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-white/20 rounded-full p-3">
                                            <Trophy className="h-8 w-8" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        ¡Felicitaciones!
                                    </h3>
                                    <p className="text-green-100 mb-4">
                                        Has completado el curso exitosamente
                                    </p>
                                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>Curso Completado</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Summary */}
                    <div className="space-y-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                            <div className="flex items-center space-x-3 mb-3">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                                <span className="font-semibold text-gray-900">Tu Progreso</span>
                            </div>
                            <div className="text-3xl font-bold mb-2" style={{ color: titleColor }}>
                                {data.userProgress.overallProgress}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${data.userProgress.overallProgress}%`,
                                        background: `linear-gradient(to right, ${titleColor}, ${titleColor})`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                                <div className="font-bold text-gray-900 text-lg">{data.userProgress.completedItems.length}</div>
                                <div className="text-gray-600 text-sm break-words">Contenidos Completados</div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                                <div className="font-bold text-gray-900 text-lg">{data.modules.length}</div>
                                <div className="text-gray-600 text-sm break-words">Módulos</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                {/* {data.achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2" style={{ color: data.colorTitle }} />
              Logros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.unlockedAt
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg'
                      : 'bg-gray-50/60 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.unlockedAt && (
                      <div className="mt-2 text-xs text-yellow-600 font-medium">
                        Desbloqueado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

                {/* Modules Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <BookOpen className="h-6 w-6 mr-2" style={{ color: data.colorTitle }} />
                        Módulos del Curso
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.modules.map((module, index) => {
                            const progress = getModuleProgress(module);
                            const isLocked = isModuleLocked(index);
                            const nextItem = getNextAvailableItem(module);

                            return (
                                <div
                                    key={module.id}
                                    className={`group rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden transition-all duration-300 ${isLocked
                                        ? 'bg-gray-100/60 cursor-not-allowed'
                                        : 'bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 cursor-pointer'
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={module.thumbnailImagePath}
                                            alt={module.title}
                                            className={`w-full h-48 object-cover ${isLocked
                                                ? 'grayscale opacity-50'
                                                : 'group-hover:scale-110'
                                                } transition-transform duration-300`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                        {/* Module Status Icon */}
                                        {isLocked ? (
                                            <div className="absolute top-4 right-4 p-3 bg-gray-600/80 backdrop-blur-sm rounded-full">
                                                <Lock className="h-5 w-5 text-white" />
                                            </div>
                                        ) : progress === 100 ? (
                                            <div className="absolute top-4 right-4 p-3 bg-green-600/90 backdrop-blur-sm rounded-full">
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                        ) : (
                                            <div className="absolute top-4 right-4 p-3 bg-blue-600/80 backdrop-blur-sm rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle className="h-5 w-5 text-white" />
                                            </div>
                                        )}

                                        {/* Module Progress */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-white font-bold text-lg">
                                                    Módulo {index + 1}
                                                </h3>
                                                <span className="text-white/90 text-sm font-medium">
                                                    {progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2">
                                                <div
                                                    className="bg-white h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h4 className={`font-bold text-xl mb-3 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {module.title}
                                        </h4>
                                        <p className={`text-sm mb-4 line-clamp-3 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {module.description}
                                        </p>

                                        <div className="flex items-center justify-between text-sm mb-4">
                                            <div className={`space-y-1 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <div className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    {module.stats?.totalItems ?? 0} elementos
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {module.stats?.totalDuration}min
                                                </div>
                                            </div>

                                            <div className={`text-right ${isLocked ? 'text-gray-400' :
                                                progress === 100 ? 'text-green-600' :
                                                    progress > 0 ? 'text-blue-600' : 'text-gray-600'
                                                }`}>
                                                <div className="font-bold text-lg">{module.stats?.completedItems ?? 0 }/{module.stats?.totalItems ?? 0}</div>
                                                <div className="text-xs">completado</div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {!isLocked && nextItem && (
                                            <Link
                                                to={`/make/courses/${data.id}/${nextItem.type}/${nextItem.referenceId}#main-content`}
                                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <Play className="h-5 w-5" />
                                                <span>
                                                    {progress === 0 ? 'Comenzar' : 'Continuar'}
                                                </span>
                                            </Link>
                                        )}

                                        {!isLocked && !nextItem && progress === 100 && (
                                            <div className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg">
                                                <CheckCircle className="h-5 w-5" />
                                                <span>Completado</span>
                                            </div>
                                        )}

                                        {isLocked && (
                                            <div className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                                                <Lock className="h-5 w-5" />
                                                <span>Bloqueado</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips Section */}
                {/* <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-200/50">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Zap className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">💡 Consejo del día</h3>
                            <p className="text-gray-600">
                                Dedica al menos 30 minutos diarios al curso para mantener el ritmo de aprendizaje.
                                La constancia es clave para dominar el desarrollo web.
                            </p>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style> */}
        </div>
    );
}