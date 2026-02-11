// app/routes/courses/make/$courseId/activity/$activityId.tsx

import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { createApiClientFromRequest } from "~/api/client";
import { ActivitiesAPI } from "~/api/endpoints/activities";
import type { Activity } from "~/api/types/activity.types";
import { HangingGame, CompletePhraseGame, WordSearchGame } from "~/components/activities/games";

interface LoaderData {
    activity: Activity;
    courseId: string;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const activityId = params.activityId;
    const courseId = params.courseId;
    
    if (!activityId || !courseId) {
        throw new Response("Activity ID y Course ID requeridos", { status: 400 });
    }

    try {
        const apiClient = createApiClientFromRequest(request);
        const response = await ActivitiesAPI.getById(activityId, apiClient);
        
        if (!response.success) {
            throw new Response(response.message || "Error cargando actividad", { status: 500 });
        }

        return json<LoaderData>({ 
            activity: response.data,
            courseId 
        });
    } catch (error: any) {
        console.error("Error cargando actividad:", error);
        
        if (error.response?.status === 404) {
            throw new Response("Actividad no encontrada", { status: 404 });
        }
        
        throw new Response("Error cargando actividad", { status: 500 });
    }
};

export default function PlayActivity() {
    const { activity, courseId } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleComplete = async (result: any) => {
        try {
            setIsSaving(true);
            setSaveError(null);

            // Aquí deberías implementar la lógica para guardar el progreso
            // Por ejemplo, llamar a un endpoint de ActivityAttempts
            
            // Simulación de guardado
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Guardando progreso:', {
                activityId: activity.id,
                courseId,
                result,
            });

            setSaveSuccess(true);

            // Esperar un momento para mostrar el mensaje de éxito
            setTimeout(() => {
                navigate(`/courses/make/${courseId}`);
            }, 2000);

        } catch (error: any) {
            console.error('Error guardando progreso:', error);
            setSaveError(error.message || 'Error al guardar el progreso');
        } finally {
            setIsSaving(false);
        }
    };

    const renderGame = () => {
        // fromModule es TRUE porque esto es desde un módulo
        // El progreso se guardará automáticamente
        switch (activity.type) {
            case 'hanging':
                return (
                    <HangingGame 
                        activityId={activity.id} 
                        fromModule={true}
                        onComplete={handleComplete}
                    />
                );
            
            case 'complete_phrase':
                return (
                    <CompletePhraseGame 
                        activityId={activity.id} 
                        fromModule={true}
                        onComplete={handleComplete}
                    />
                );
            
            case 'word_search':
                return (
                    <WordSearchGame 
                        activityId={activity.id} 
                        fromModule={true}
                        onComplete={handleComplete}
                    />
                );
            
            default:
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <p className="text-yellow-800">
                            Tipo de actividad no implementado: {activity.type}
                        </p>
                    </div>
                );
        }
    };

    const translation = activity.translations?.[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
                    <button
                        onClick={() => navigate(`/courses/make/${courseId}`)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver al curso</span>
                    </button>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                                <span className="text-2xl">
                                    {activity.type === 'hanging' && '🎯'}
                                    {activity.type === 'complete_phrase' && '📝'}
                                    {activity.type === 'word_search' && '🔍'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {translation?.title || activity.slug}
                                </h1>
                                <p className="text-gray-600">
                                    {translation?.description || 'Completa esta actividad'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                            <div className="bg-green-100 border-2 border-green-300 rounded-xl px-4 py-2">
                                <p className="text-green-900 font-medium text-sm">
                                    ✓ Progreso guardado
                                </p>
                            </div>
                            {activity?.maxScore && (
                                <p className="text-sm text-gray-600">
                                    Puntos máximos: {activity.maxScore}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mensaje de bienvenida */}
                {translation?.welcomeMessage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">👋</span>
                            <div>
                                <p className="text-sm text-blue-800">
                                    {translation.welcomeMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instrucciones */}
                {translation?.instructions && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">📋</span>
                            <div>
                                <p className="font-medium text-purple-900">Instrucciones</p>
                                <p className="text-sm text-purple-800 mt-1">
                                    {translation.instructions}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado de guardado */}
                {isSaving && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <p className="text-blue-800">Guardando tu progreso...</p>
                        </div>
                    </div>
                )}

                {saveError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800">⚠️ {saveError}</p>
                    </div>
                )}

                {saveSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-green-800 font-medium">
                                ¡Tu progreso ha sido guardado exitosamente! Redirigiendo...
                            </p>
                        </div>
                    </div>
                )}

                {/* Juego */}
                {renderGame()}
            </div>
        </div>
    );
}