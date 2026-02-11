// app/routes/activities/$id.preview.tsx

import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ActivitiesAPI } from "~/api/endpoints/activities";
import type { Activity } from "~/api/types/activity.types";
import { HangingGame, CompletePhraseGame, WordSearchGame } from "~/components/activities/games";

interface LoaderData {
    activity: Activity;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const activityId = params.id;
    
    if (!activityId) {
        throw new Response("Activity ID requerido", { status: 400 });
    }

    try {
        const apiClient = createApiClientFromRequest(request);
        const response = await ActivitiesAPI.getById(activityId, apiClient);
        
        if (!response.success) {
            throw new Response(response.message || "Error cargando actividad", { status: 500 });
        }

        return json<LoaderData>({ 
            activity: response.data 
        });
    } catch (error: any) {
        console.error("Error cargando actividad:", error);
        
        if (error.response?.status === 404) {
            throw new Response("Actividad no encontrada", { status: 404 });
        }
        
        throw new Response("Error cargando actividad", { status: 500 });
    }
};

export default function PreviewActivity() {
    const { activity } = useLoaderData<LoaderData>();
    const navigate = useNavigate();

    const renderGame = () => {
        // fromModule es FALSE porque esto es una vista previa
        // No se guardará progreso del usuario
        switch (activity.type) {
            case 'hanging':
                return <HangingGame activityId={activity.id} fromModule={false} />;
            
            case 'complete_phrase':
                return <CompletePhraseGame activityId={activity.id} fromModule={false} />;
            
            case 'word_search':
                return <WordSearchGame activityId={activity.id} fromModule={false} />;
            
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
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver</span>
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
                                    {translation?.description || 'Vista previa de la actividad'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-2">
                            <p className="text-yellow-900 font-medium text-sm">
                                🔒 Modo Previsualización
                            </p>
                            <p className="text-yellow-700 text-xs">
                                El progreso no se guardará
                            </p>
                        </div>
                    </div>
                </div>

                {/* Instrucciones */}
                {translation?.instructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">📋</span>
                            <div>
                                <p className="font-medium text-blue-900">Instrucciones</p>
                                <p className="text-sm text-blue-800 mt-1">
                                    {translation.instructions}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Juego */}
                {renderGame()}
            </div>
        </div>
    );
}