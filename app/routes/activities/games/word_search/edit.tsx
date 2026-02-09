// app/routes/activities/games/word_search/edit.tsx

import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigate } from "@remix-run/react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import WordSearchForm from "~/components/activities/games/word-search/WordSearchForm";
import { createApiClientFromRequest } from "~/api/client";
import { WordSearchAPI } from "~/api/endpoints/word-search";
import type { WordSearchGame } from "~/api/types/word-search.types";
import { useState } from "react";

interface LoaderData {
    activityId: string;
    wordSearchGame: WordSearchGame;
}

interface ActionData {
    success?: boolean;
    errors?: Array<{ field: string; message: string }>;
    generalError?: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const activityId = params.activityId;
    
    if (!activityId) {
        throw new Response("Activity ID requerido", { status: 400 });
    }

    try {
        // Llamada real a la API
        const apiClient = createApiClientFromRequest(request);
        const response = await WordSearchAPI.get(activityId, apiClient);
        
        if (!response.success) {
            throw new Response(response.message || "Error cargando la sopa de letras", { status: 500 });
        }

        return json<LoaderData>({ 
            activityId, 
            wordSearchGame: response.data 
        });
    } catch (error: any) {
        console.error("Error cargando la sopa de letras:", error);
        
        if (error.response?.status === 404) {
            throw new Response("Sopa de letras no encontrada", { status: 404 });
        }
        
        throw new Response("Error cargando la sopa de letras", { status: 500 });
    }
};

export const action: ActionFunction = async ({ request, params }) => {
    const activityId = params.activityId;

    const url = new URL(request.url);
    const courseId = url.searchParams.get("course") || undefined;
    
    if (!activityId) {
        return json<ActionData>({
            success: false,
            generalError: "Activity ID requerido",
        }, { status: 400 });
    }

    const formData = await request.formData();
    const actionType = formData.get("_action") as string;

    // Manejar regeneración de seed
    if (actionType === "regenerate_seed") {
        try {
            const apiClient = createApiClientFromRequest(request);
            const response = await WordSearchAPI.regenerateSeed(activityId, apiClient);
            
            if (response.success) {
                return json<ActionData>({
                    success: true,
                }, { status: 200 });
            } else {
                return json<ActionData>({
                    success: false,
                    generalError: response.message || "Error al regenerar el tablero",
                }, { status: 400 });
            }
        } catch (error: any) {
            console.error("Error regenerando seed:", error);
            return json<ActionData>({
                success: false,
                generalError: error.message || "Error al regenerar el tablero",
            }, { status: 400 });
        }
    }

    // Manejar actualización normal
    try {
        const wordsJson = formData.get("words") as string;
        const words = JSON.parse(wordsJson);

        const directionsJson = formData.get("allowedDirections") as string;
        const allowedDirections = JSON.parse(directionsJson);

        const wordSearchData = {
            gridWidth: parseInt(formData.get("gridWidth") as string),
            gridHeight: parseInt(formData.get("gridHeight") as string),
            words,
            allowedDirections,
            fillEmptyCells: formData.get("fillEmptyCells") === "true",
            caseSensitive: formData.get("caseSensitive") === "true",
            showWordList: formData.get("showWordList") === "true",
            showClues: formData.get("showClues") === "true",
            pointsPerWord: parseInt(formData.get("pointsPerWord") as string),
            bonusForSpeed: parseInt(formData.get("bonusForSpeed") as string),
            penaltyPerHint: parseInt(formData.get("penaltyPerHint") as string),
        };

        // Validaciones adicionales
        if (!words || words.length === 0) {
            return json<ActionData>({
                success: false,
                generalError: "Debe proporcionar al menos una palabra",
            }, { status: 400 });
        }

        if (!allowedDirections || allowedDirections.length === 0) {
            return json<ActionData>({
                success: false,
                generalError: "Debe permitir al menos una dirección",
            }, { status: 400 });
        }

        // Llamada real a la API
        const apiClient = createApiClientFromRequest(request);
        const response = await WordSearchAPI.update(activityId, wordSearchData, apiClient);
        
        if (response.success) {
            return redirect(`/activities/course/${courseId}`);
        } else {
            return json<ActionData>({
                success: false,
                generalError: response.message || "Error al actualizar la sopa de letras",
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Error actualizando sopa de letras:", error);
        
        // Manejar errores de validación del backend
        if (error.response?.data?.message) {
            return json<ActionData>({
                success: false,
                generalError: error.response.data.message,
            }, { status: 400 });
        }

        return json<ActionData>({
            success: false,
            generalError: error.message || "Error al actualizar la sopa de letras",
        }, { status: 400 });
    }
};

export default function EditWordSearchGame() {
    const { activityId, wordSearchGame } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigate = useNavigate();
    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleRegenerateSeed = async () => {
        if (!confirm("¿Estás seguro de que quieres regenerar el tablero? Esto creará una nueva disposición de palabras.")) {
            return;
        }

        setIsRegenerating(true);
        const formData = new FormData();
        formData.append("_action", "regenerate_seed");

        try {
            const response = await fetch("", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert("Error al regenerar el tablero");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al regenerar el tablero");
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
                    <button
                        onClick={() => navigate(`/activities/${activityId}`)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver a la actividad</span>
                    </button>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                                <span className="text-2xl">🔍</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Editar Sopa de Letras</h1>
                                <p className="text-gray-600">Modifica las palabras y configuración del juego</p>
                            </div>
                        </div>

                        {/* Botón para regenerar tablero */}
                        <button
                            type="button"
                            onClick={handleRegenerateSeed}
                            disabled={isRegenerating}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                            <span>{isRegenerating ? 'Regenerando...' : 'Regenerar Tablero'}</span>
                        </button>
                    </div>
                </div>

                {/* Info sobre el seed */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <span className="text-2xl">🎲</span>
                        <div>
                            <p className="font-medium text-blue-900">Tablero Actual</p>
                            <p className="text-sm text-blue-700">
                                Seed: <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">{wordSearchGame.seed}</code>
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                💡 Si cambias las palabras o dimensiones, se generará automáticamente un nuevo tablero. 
                                También puedes usar el botón "Regenerar Tablero" para crear una nueva disposición con las mismas palabras.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error general */}
                {actionData?.generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800 font-medium">⚠️ {actionData.generalError}</p>
                    </div>
                )}

                {/* Mensaje de éxito */}
                {actionData?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <p className="text-green-800 font-medium">✅ Tablero regenerado exitosamente</p>
                    </div>
                )}

                {/* Formulario */}
                <WordSearchForm
                    activityId={activityId}
                    initialData={wordSearchGame}
                    errors={actionData?.errors}
                    isEdit
                />
            </div>
        </div>
    );
}