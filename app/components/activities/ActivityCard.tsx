// app/components/activities/ActivityCard.tsx

import { Link } from "@remix-run/react";
import { 
    Gamepad2, Eye, Edit, Settings, Clock, Target, 
    Users, TrendingUp, Plus
} from "lucide-react";
import type { Activity } from "~/api/types/activity.types";
import { 
    getActivityViewRoute, 
    getActivityEditRoute,
    getActivityMetadataEditRoute,
    hasGameConfigured 
} from "~/utils/activity-routes";

interface ActivityCardProps {
    activity: Activity;
}

const activityTypeLabels: Record<string, string> = {
    word_search: "Sopa de Letras",
    hanging: "Ahorcado",
    complete_phrase: "Completar Frase",
    crossword: "Crucigrama",
    drag_drop: "Arrastrar y Soltar",
    matching: "Emparejar",
    memory: "Memoria",
    quiz_game: "Quiz",
    puzzle: "Rompecabezas",
};

const activityTypeColors: Record<string, string> = {
    word_search: "from-blue-500 to-blue-600",
    hanging: "from-red-500 to-red-600",
    complete_phrase: "from-green-500 to-green-600",
    crossword: "from-purple-500 to-purple-600",
    drag_drop: "from-yellow-500 to-yellow-600",
    matching: "from-pink-500 to-pink-600",
    memory: "from-indigo-500 to-indigo-600",
    quiz_game: "from-orange-500 to-orange-600",
    puzzle: "from-teal-500 to-teal-600",
};

const difficultyLabels: Record<string, string> = {
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
    expert: "Experto",
};

const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-orange-100 text-orange-700",
    expert: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
    draft: "Borrador",
    published: "Publicado",
    archived: "Archivado",
    suspended: "Suspendido",
};

const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-blue-100 text-blue-700",
    suspended: "bg-red-100 text-red-700",
};

export default function ActivityCard({ activity }: ActivityCardProps) {
    const translation = activity.translations?.[0];
    const typeColor = activityTypeColors[activity.type] || "from-gray-500 to-gray-600";
    
    // Determinar si el juego está configurado
    const gameConfigured = hasGameConfigured(activity);
    
    // Generar rutas dinámicas
    const viewRoute = getActivityViewRoute(activity.id);
    const editRoute = getActivityEditRoute(activity, activity.courseId);
    const metadataRoute = getActivityMetadataEditRoute(activity.id);
    
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-200 group">
            {/* Header con gradiente según el tipo */}
            <div className={`bg-gradient-to-r ${typeColor} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Gamepad2 className="h-5 w-5 text-white" />
                        <span className="text-sm font-semibold text-white">
                            {activityTypeLabels[activity.type] || activity.type}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {gameConfigured ? (
                            <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-white font-medium">Configurado</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                                <span className="text-xs text-white font-medium">Pendiente</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                {/* Título y descripción */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {translation?.title || activity.slug}
                    </h3>
                    {translation?.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {translation.description}
                        </p>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
                        {statusLabels[activity.status]}
                    </span>
                    {/* {activity.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[activity.difficulty]}`}>
                            {difficultyLabels[activity.difficulty]}
                        </span>
                    )} */}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <Target className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Puntos</p>
                        <p className="text-sm font-bold text-gray-900">{activity.maxScore || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Intentos</p>
                        <p className="text-sm font-bold text-gray-900">{activity.stats?.totalAttempts || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Orden</p>
                        <p className="text-sm font-bold text-gray-900">#{activity.order}</p>
                    </div>
                </div>

                {/* Acciones principales */}
                <div className="flex gap-2 mb-3">
                    <Link
                        to={viewRoute}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        <Eye className="h-4 w-4" />
                        <span>Ver</span>
                    </Link>
                    <Link
                        to={editRoute}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                    >
                        {gameConfigured ? (
                            <>
                                <Edit className="h-4 w-4" />
                                <span>Editar Juego</span>
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                <span>Crear Juego</span>
                            </>
                        )}
                    </Link>
                </div>

                {/* Acción secundaria - Editar metadatos */}
                {/* {gameConfigured && (
                    <Link
                        to={metadataRoute}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                    </Link>
                )} */}
            </div>

            {/* Footer */}
            {/* <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Curso: {activity.courseName || 'Sin asignar'}</span>
                    <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                            {new Date(activity.updated_at).toLocaleDateString('es', {
                                day: '2-digit',
                                month: 'short'
                            })}
                        </span>
                    </div>
                </div>
            </div> */}
        </div>
    );
}