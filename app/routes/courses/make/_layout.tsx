// app/routes/courses/make/_layout.tsx

import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import "~/css/styles.css";
import { Outlet, useLoaderData, Link, useParams, useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import {
    BookOpen, Play, FileText, MessageSquare, ClipboardCheck,
    BarChart3, Users, Calendar, Clock, Star, ChevronRight, ChevronDown, ChevronUp,
    Settings, Share2, Bookmark, Download, Eye, Lock, CheckCircle,
    PlayCircle, ArrowLeft, Menu, X, Home, Trophy, Target, User, Settings as SettingsIcon, Award, Zap,
    ImageOff
} from "lucide-react";
import AuthGuard from '~/components/AuthGuard';
import { useCurrentUser } from '~/context/AuthContext';
import { CoursesAPI } from '~/api/endpoints/courses';
import { CourseLayoutData, CourseModuleLayoutData, CourseUserProgress } from "~/api/types/course.types";
import { createApiClientFromRequest } from "~/api/client";
import NavigationMenu from "~/components/courses/NavigationMenu";
import { getSessionProgress } from "~/utils/progressCommunication";

interface LoaderLayoutData {
    course: CourseLayoutData;
    currentPath: string;
    userProgress: CourseUserProgress;
    stats: {
        totalStudents: number;
        completionRate: number;
        averageRating: number;
        totalModules: number;
        totalContent: number;
    };
    error: string | null;
}

export const meta: MetaFunction = ({ data }: { data: LoaderLayoutData }) => {
    const course = data?.course;
    const title = course?.translations?.[0]?.title || 'Curso';

    return [
        { title: `${title} - Realizando Curso` },
        { name: "description", content: `Realizando: ${title}` },
    ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const { courseId } = params;
    const url = new URL(request.url);
    const currentPath = url.pathname;

    try {

        if( !courseId){
            throw new Error('Course ID is required');
        }

        // 1. Crear cliente autenticado
        const authenticatedApiClient = createApiClientFromRequest(request);

        // 2. Pasar como último parámetro
        const course = await CoursesAPI.getById(courseId, authenticatedApiClient);
        
        // 🔄 API CALLS - Reemplazar con llamadas reales
        // const course = await CoursesAPI.getById(courseId, 
        //     // { 
        //     // includeModules: true, 
        //     // includeConfig: true,
        //     // includeViewsConfig: true,
        //     // includeTranslations: true,
        //     // includeInstructor: true
        //     // }
        // );
        const userProgress = await CoursesAPI.getUserProgress(courseId, authenticatedApiClient);
        // const stats = await CourseAPI.getStats(courseId);

        // Datos mockeados para el layout
        const mockCourse: CourseLayoutData = {
            id: courseId || '1',
            slug: 'introduccion-desarrollo-web',
            isActive: true,
            configuration: {
                coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop',
                menuImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
                thumbnailImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&h=150&fit=crop',
                colorTitle: '#2563eb',
                visibility: 'public',
                status: 'published',
                category: 'Desarrollo Web',
                estimatedHours: 40,
                intensity: 3,
                startDate: '2024-03-01T00:00:00Z',
                endDate: '2024-06-01T00:00:00Z'
            },
            translations: [{
                languageCode: 'es',
                title: 'Introducción al Desarrollo Web Moderno',
                description: 'Aprende los fundamentos del desarrollo web desde cero, incluyendo HTML, CSS, JavaScript y frameworks modernos. Este curso te proporcionará las bases sólidas para convertirte en un desarrollador web profesional.'
            }],
            viewsConfig: [{
                viewType: 'contents',
                backgroundType: 'image',
                backgroundColor: '#f8fafc',
                backgroundImagePath: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop&opacity=0.1',
                customTitleEs: 'Contenido del Curso',
                titleColor: '#1e40af',
                coverTypeHeader: 'image',
                coverImageHeader: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=300&fit=crop',
                coverTitleHeader: 'Bienvenido al Curso',
                coverDescriptionHeader: 'Comienza tu viaje en el desarrollo web',
                layoutConfig: {
                    allowCoverHeader: true,
                    showTitle: true,
                    showDescription: true
                }
            }],
            modules: [
                {
                    id: '1',
                    title: 'Fundamentos de HTML',
                    description: 'Aprende la estructura básica de las páginas web con HTML5',
                    thumbnailImagePath: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
                    stats: { totalItems: 5, completedItems: 3, totalDuration: 120 },
                    items: [
                        {
                            id: '1', type: 'content', referenceId: 'content_1', order: 1,
                            title: 'Introducción a HTML', duration: 30, isCompleted: true, isLocked: false
                        },
                        {
                            id: '2', type: 'content', referenceId: 'content_2', order: 2,
                            title: 'Etiquetas y elementos HTML', duration: 45, isCompleted: true, isLocked: false
                        },
                        {
                            id: '3', type: 'content', referenceId: 'content_3', order: 3,
                            title: 'Formularios HTML', duration: 60, isCompleted: true, isLocked: false, isActive: true
                        },
                        {
                            id: '4', type: 'quiz', referenceId: 'quiz_1', order: 4,
                            title: 'Evaluación HTML Básico', duration: 15, isCompleted: false, isLocked: false
                        }
                    ]
                },
                {
                    id: '2',
                    title: 'Estilos con CSS',
                    description: 'Domina el diseño y la presentación con CSS3',
                    thumbnailImagePath: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
                    stats: { totalItems: 4, completedItems: 0, totalDuration: 180 },
                    items: []
                },
                {
                    id: '3',
                    title: 'JavaScript Interactivo',
                    description: 'Añade interactividad y dinamismo a tus páginas web',
                    thumbnailImagePath: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=300&h=200&fit=crop',
                    stats: { totalItems: 6, completedItems: 0, totalDuration: 300 },
                    items: []
                }
            ],
            enrollmentInfo: {
                isEnrolled: true,
                enrollmentDate: '2024-03-01T00:00:00Z',
                progress: 60,
                completedModules: 1,
                totalModules: 3
            },
            instructor: {
                id: '1',
                name: 'Dr. Juan Pérez',
                title: 'Desarrollador Senior & Instructor',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
        };

        const mockUserProgress = {
            overallProgress: 60,
            completedItems: ['1', '2', '3'],
            lastAccessDate: '2024-03-15T10:30:00Z',
            timeSpent: 3600,
            currentModuleId: '1',
            currentItemId: '3'
        };

        const mockStats = {
            totalStudents: 156,
            completionRate: 78,
            averageRating: 4.6,
            totalModules: 3,
            totalContent: 9
        };

        return json<LoaderLayoutData>({
            course: course,
            currentPath,
            userProgress: userProgress,
            stats: mockStats,
            error: null
        });
    } catch (error: any) {
        console.error('Error loading course layout:', error);
        return json<LoaderLayoutData>({
            course: {} as CourseLayoutData,
            currentPath: '',
            userProgress: {} as any,
            stats: {} as any,
            error: error.message || 'Error al cargar el curso'
        });
    }
};

export default function CourseMakeLayout() {
    return (
        <AuthGuard>
            <CourseMakeLayoutContent />
        </AuthGuard>
    );
}

function CourseMakeLayoutContent() {
    const { course, currentPath, userProgress, stats, error } = useLoaderData<LoaderLayoutData>();
    const location = useLocation();
    const params = useParams();
    const { user } = useCurrentUser();
    const mainContentRef = useRef(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedModules, setExpandedModules] = useState<string[]>(['1']);

    const [syncedProgress, setSyncedProgress] = useState({
        overallProgress: userProgress.overallProgress,
        completedItems: userProgress.completedItems,
    });

    // Escuchar eventos de progreso
    useEffect(() => {
        const handleProgressUpdate = (event: CustomEvent) => {
            setSyncedProgress(prev => ({
                ...prev,
                completedItems: event.detail.completedItems ? 
                    [...new Set([...prev.completedItems, ...event.detail.completedItems])] : 
                    prev.completedItems,
                overallProgress: event.detail.overallProgress || prev.overallProgress,
            }));
        };
        
        window.addEventListener('progress-updated' as any, handleProgressUpdate);
        return () => window.removeEventListener('progress-updated' as any, handleProgressUpdate);
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center py-16">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
                        <BookOpen className="mx-auto h-16 w-16 text-red-400 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link
                            to="/courses"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Volver a cursos
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const courseTitle = course.translations[0]?.title || course.slug;
    const courseDescription = course.translations[0]?.description || '';
    const currentViewConfig = course.viewsConfig[0];
    const titleColor = currentViewConfig?.titleColor || course.configuration?.colorTitle || '#2563eb';

    // Determinar si estamos en la vista principal del curso
    const isMainCourseView = location.pathname === `/make/courses/${course.id}`;

    // Aplicar configuraciones de personalización
    const backgroundStyle = currentViewConfig?.backgroundType === 'image' && currentViewConfig?.backgroundImagePath
        ? {
            backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.9)), url(${currentViewConfig.backgroundImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }
        : {
            background: `linear-gradient(135deg, ${currentViewConfig?.backgroundColor || '#f8fafc'} 0%, rgba(59, 130, 246, 0.05) 100%)`
        };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const getModuleProgress = (module: CourseModuleLayoutData) => {
        const completed = module.stats?.completedItems || 0;
        const total = module.stats?.totalItems || 0;
        const moduleItemsCompleted = module.items?.filter(item => 
            syncedProgress.completedItems.includes(item.id)
        ).length || completed;
        return total > 0 ? Math.round((moduleItemsCompleted / total) * 100) : 0;
    };

    const isModuleLocked = (moduleIndex: number) => {
        if (moduleIndex === 0) return false;
        const prevModule = course.modules[moduleIndex - 1];
        return getModuleProgress(prevModule) < 100;
    };

    const getItemIcon = (type: string, isCompleted: boolean, isLocked: boolean) => {
        const baseClasses = "h-4 w-4";

        if (isLocked) return <Lock className={`${baseClasses} text-gray-400`} />;
        if (isCompleted) return <CheckCircle className={`${baseClasses} text-green-500`} />;

        switch (type) {
            case 'content': return <FileText className={`${baseClasses} text-blue-500`} />;
            case 'forum': return <MessageSquare className={`${baseClasses} text-purple-500`} />;
            case 'task': return <ClipboardCheck className={`${baseClasses} text-orange-500`} />;
            case 'quiz': return <BarChart3 className={`${baseClasses} text-red-500`} />;
            case 'survey': return <Users className={`${baseClasses} text-indigo-500`} />;
            case 'activity': return <Trophy className={`${baseClasses} text-yellow-500`} />;
            default: return <FileText className={`${baseClasses} text-gray-400`} />;
        }
    };

    // Efecto para manejar el scroll al hash
    useEffect(() => {
        const hash = location.hash;
        
        if (hash === '#main-content') {
        // Intento 1: Scroll inmediato si el elemento existe
        scrollToMainContent();
        
        // Intento 2: Scroll después de un breve delay (por si el contenido se carga asíncronamente)
        const timer = setTimeout(scrollToMainContent, 300);
        
        return () => clearTimeout(timer);
        }
    }, [location]);

    // Función reutilizable para el scroll
    const scrollToMainContent = () => {
        if (mainContentRef.current) {
        // Cierra la sidebar en móviles para ver el contenido
        setSidebarOpen(false);
        
        // Scroll suave al elemento
        mainContentRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        }
    };

    return (
        <div className="min-h-screen" style={backgroundStyle}>
            {/* Header del curso con imagen de fondo y card */}
            <div className="relative overflow-hidden">
                {/* Imagen de fondo con overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${course.configuration?.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop'})`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                {/* TOP NAVIGATION BAR sobre la imagen */}
                <div className="relative z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">

                            {/* Left side */}
                            <div className="flex items-center space-x-4">
                                {/* Toggle Sidebar */}
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 lg:hidden"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>

                                {/* Back Link */}
                                <Link
                                    to={`/courses/${course.id}`}
                                    className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    <span className="hidden sm:inline">Información del curso</span>
                                </Link>
                            </div>

                            {/* Right side */}
                            <div className="flex items-center space-x-3">
                                <div className="hidden sm:flex items-center space-x-4 text-sm text-white/90">
                                    <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                                        <span className="font-medium">{syncedProgress.overallProgress}%</span>
                                    </div>
                                    <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                                        <Clock className="h-4 w-4 text-white/80" />
                                        <span className="font-medium">{Math.round(userProgress.timeSpent / 60)}min</span>
                                    </div>
                                </div>

                                {/* Settings Button */}
                                <button className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200">
                                    <SettingsIcon className="h-5 w-5" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Contenido del header */}
                <div className="relative z-10 container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">

                        {/* Información del curso con card de imagen */}
                        <div className="flex items-start space-x-6">
                            {/* Card de imagen del curso */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/20 flex-shrink-0">
                                
                                {course.configuration?.thumbnailImage ? (
                                <img
                                    src={course.configuration.thumbnailImage}
                                    alt={courseTitle}
                                    className="w-28 h-28 lg:w-32 lg:h-32 rounded-xl object-cover shadow-lg"
                                />
                                ) : (
                                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-xl bg-gray-100 flex items-center justify-center shadow-lg">
                                    <ImageOff className="w-10 h-10 text-gray-400" />
                                </div>
                                )}
                                {/* Badge de intensidad sobre la imagen */}
                                {/* <div className="flex justify-center mt-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${course.configuration.intensity === 1 ? 'bg-green-100 text-green-800' :
                                            course.configuration.intensity === 2 ? 'bg-yellow-100 text-yellow-800' :
                                                course.configuration.intensity === 3 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        <Zap className="h-3 w-3 inline mr-1" />
                                        Nivel {course.configuration.intensity}
                                    </span>
                                </div> */}
                            </div>

                            {/* Información textual */}
                            <div className="flex-1 min-w-0">
                                {/* Categoría y código */}
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    {course.configuration?.category && (
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-100 text-sm font-semibold rounded-full backdrop-blur-sm border border-blue-300/30">
                                            {course.configuration?.category}
                                        </span>
                                    )}
                                    {course.configuration?.code && (
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-100 text-sm font-mono rounded-full backdrop-blur-sm border border-purple-300/30">
                                            {course.configuration?.code}
                                        </span>
                                    )}
                                    {course.configuration?.acronym && (
                                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-100 text-sm font-bold rounded-full backdrop-blur-sm border border-indigo-300/30">
                                            {course.configuration?.acronym}
                                        </span>
                                    )}
                                </div>

                                {/* Título principal */}
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                                    {courseTitle}
                                </h1>

                                {/* Descripción */}
                                <p className="text-white/90 text-lg mb-4 line-clamp-2 drop-shadow-sm leading-relaxed">
                                    {courseDescription}
                                </p>

                                {/* Metadatos del curso */}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    {/* Instructor */}
                                    {/* <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                                        <img
                                            src={course.instructor.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                                            alt={course.instructor.name}
                                            className="w-6 h-6 rounded-full object-cover border-2 border-white/30"
                                        />
                                        <span className="text-white/90 font-medium">{course.instructor.name}</span>
                                    </div> */}

                                    {/* Duración */}
                                    <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                                        <Clock className="h-4 w-4 text-white/80" />
                                        <span className="text-white/90">{course.configuration?.estimatedHours}h total</span>
                                    </div>

                                    {/* Rating y estudiantes */}
                                    {/* <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-white/90">{stats.averageRating}</span>
                                        <span className="text-white/60">({stats.totalStudents})</span>
                                    </div> */}

                                    {/* Fecha de inicio si está disponible */}
                                    {/* {course.configuration.startDate && (
                                        <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                                            <Calendar className="h-4 w-4 text-white/80" />
                                            <span className="text-white/90">
                                                {new Date(course.configuration.startDate).toLocaleDateString('es-ES', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        </div>

                        {/* Card de progreso mejorada */}
                        <div className="lg:w-80 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 text-lg">Tu Progreso</h3>
                                <div className="flex items-center space-x-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {syncedProgress.overallProgress}%
                                    </span>
                                </div>
                            </div>

                            {/* Barra de progreso con animación */}
                            <div className="relative w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                                <div
                                    className="h-4 rounded-full transition-all duration-1000 ease-out relative"
                                    style={{
                                        width: `${syncedProgress.overallProgress}%`,
                                        background: `linear-gradient(135deg, ${titleColor} 0%, #8B5CF6 100%)`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            {/* Estadísticas en grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
                                    <div className="flex justify-center mb-2">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="font-bold text-xl text-gray-900">{course.enrollmentInfo.completedModules}</div>
                                    <div className="text-xs text-gray-600 font-medium">Módulos</div>
                                </div>

                                <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                                    <div className="flex justify-center mb-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="font-bold text-xl text-gray-900">{userProgress.completedItems.length}</div>
                                    <div className="text-xs text-gray-600 font-medium">Completados</div>
                                </div>

                                <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
                                    <div className="flex justify-center mb-2">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Clock className="h-4 w-4 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="font-bold text-xl text-gray-900">{Math.round(userProgress.timeSpent / 60)}</div>
                                    <div className="text-xs text-gray-600 font-medium">Minutos</div>
                                </div>
                            </div>

                            {/* Botón de continuar si hay progreso */}
                            {syncedProgress.overallProgress > 0 && userProgress.currentItemId && (
                                <Link
                                    to={`/make/courses/${course.id}/continue`}
                                    className="mt-4 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                >
                                    <Play className="h-5 w-5" />
                                    <span>Continuar</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Información adicional en la parte inferior */}
                    <div className="mt-8 flex flex-wrap items-center justify-between text-sm">
                        {/* <div className="grid grid-cols-10 gap-4 text-white/90 font-medium pb-4">
                            <div className="col-span-2">Contenidos</div>

                        </div> */}
                        {/* <div className="flex flex-wrap items-center gap-4 text-white/80">
                            <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {stats.totalStudents} estudiantes activos
                            </span>
                            <span className="flex items-center">
                                <Award className="h-4 w-4 mr-1" />
                                {stats.completionRate}% tasa de finalización
                            </span>
                            {course.configuration?.maxEnrollments && (
                                <span className="flex items-center">
                                    <Target className="h-4 w-4 mr-1" />
                                    {course.configuration?.maxEnrollments} plazas máximo
                                </span>
                            )}
                        </div> */}

                        {/* <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                                <Bookmark className="h-5 w-5" />
                            </button>
                            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                                <Share2 className="h-5 w-5" />
                            </button>
                            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                                <Download className="h-5 w-5" />
                            </button>
                        </div> */}
                    </div>
                </div>

                {course.configuration?.menuImage && (
                    <div className="relative z-10 mx-auto">
                        <div className="w-full overflow-hidden shadow-xl border-white/20">
                            <img
                                src={course.configuration.menuImage}
                                alt="Course Banner"
                                className="w-full h-30 md:h-38 lg:h-46 object-cover"
                            />
                        </div>
                    </div>
                )}

                <NavigationMenu course={course}/>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex" id="main-content" ref={mainContentRef}>
                    {/* Sidebar - Module Navigation */}
                    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 top-0 z-40 w-80 bg-white/90 backdrop-blur-sm shadow-xl border-r border-gray-200/50 transition-transform duration-300 ease-in-out overflow-y-auto lg:mt-0 mt-32`}>
                        {/* Mobile sidebar header */}
                        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/95">
                            <h2 className="font-semibold text-gray-900">Módulos del Curso</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 transition-all duration-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modules list */}
                        <div className="p-4 space-y-4">
                            <h3 className="font-semibold text-gray-900 text-lg mb-4 hidden lg:block">Contenido del Curso</h3>

                            {course.modules.map((module, index) => {
                                const progress = getModuleProgress(module);
                                const isLocked = isModuleLocked(index);
                                const isExpanded = expandedModules.includes(module.id);

                                return (
                                    <div key={module.id}>
                                        <div
                                            className={`group cursor-pointer rounded-xl border-2 transition-all duration-200 select-none ${isLocked
                                                ? 'border-gray-200/50 bg-gray-50/60'
                                                : 'border-gray-200/50 bg-white/60 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-lg'
                                                }`}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    toggleModule(module.id);
                                                }
                                            }}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3 flex-1">
                                                        {isLocked ? (
                                                            <div className="p-2 bg-gray-100 rounded-lg mt-1">
                                                                <Lock className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        ) : progress === 100 ? (
                                                            <div className="p-2 bg-green-100 rounded-lg mt-1">
                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 bg-blue-100 rounded-lg mt-1">
                                                                <PlayCircle className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-bold text-base ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                                                Módulo {index + 1}: {module.title}
                                                            </h4>
                                                            <p className={`text-sm mt-1 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {module.description}
                                                            </p>

                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="text-xs text-gray-500">
                                                                    {module.stats?.completedItems}/{module.stats?.totalItems} elementos • {module.stats?.totalDuration}min
                                                                </div>
                                                                <div className={`text-sm font-bold ${isLocked ? 'text-gray-400' :
                                                                    progress === 100 ? 'text-green-600' :
                                                                        'text-blue-600'
                                                                    }`}>
                                                                    {progress}%
                                                                </div>
                                                            </div>

                                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${isLocked ? 'bg-gray-300' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                                        }`}
                                                                    style={{ width: `${progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isLocked && (
                                                        <div className="ml-2 pt-1">
                                                            {isExpanded ?
                                                                <ChevronUp className="h-5 w-5 text-gray-400" /> :
                                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Module items (expandable) */}
                                        {isExpanded && !isLocked && module.items.length > 0 && (
                                            <div className="ml-4 mt-3 space-y-2 animate-fadeIn">
                                                {module.items.map((item) => {
                                                    const itemClasses = `block p-3 rounded-lg border transition-all duration-200 ${item.isLocked
                                                        ? 'border-gray-200/50 bg-gray-50/60 cursor-not-allowed'
                                                        : item.isCompleted
                                                            ? 'border-green-200/50 bg-green-50/60 hover:bg-green-50/80'
                                                            : item.isActive
                                                                ? 'border-blue-300 bg-blue-50/80 shadow-md ring-2 ring-blue-200/50'
                                                                : 'border-gray-200/50 bg-white/60 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md'
                                                        }`;

                                                    const itemContent = (
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                {getItemIcon(item.type, item.isCompleted || false, item.isLocked || false)}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center space-x-2">
                                                                    <h5 className={`text-sm font-medium ${item.isLocked ? 'text-gray-400' : 'text-gray-900'
                                                                        }`}>
                                                                        {item.title}
                                                                    </h5>
                                                                    {item.isActive && (
                                                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                                                                            Actual
                                                                        </span>
                                                                    )}
                                                                    {item.isLocked && (
                                                                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                                                                            Bloqueado
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {item.duration && (
                                                                    <div className="flex items-center mt-1">
                                                                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                                                        <span className="text-xs text-gray-500">{item.duration}min</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {!item.isLocked && <ChevronRight className="h-4 w-4 text-gray-400" />}
                                                            {item.isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                                                        </div>
                                                    );

                                                    // Renderizado condicional: Link solo si no está bloqueado
                                                    return (
                                                        <div key={item.id}>
                                                            {item.isLocked ? (
                                                                // Item bloqueado - solo div, sin navegación
                                                                <div 
                                                                    className={itemClasses}
                                                                    title="Debes completar los elementos anteriores para acceder a este contenido"
                                                                >
                                                                    {itemContent}
                                                                </div>
                                                            ) : (
                                                                // Item desbloqueado - con Link para navegación
                                                                <Link
                                                                    to={`/make/courses/${course.id}/${item.type}/${item.referenceId}#main-content`}
                                                                    className={itemClasses}
                                                                >
                                                                    {itemContent}
                                                                </Link>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 min-w-0">
                        <div className="min-h-[600px]">
                            <Outlet />
                        </div>
                    </div>

                    {/* Mobile sidebar overlay */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </div>
            </div>

            {/* <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style> */}
        </div>
    );
}