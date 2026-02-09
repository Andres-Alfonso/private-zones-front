// app/routes/activities/games/word_search/create.tsx

import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigate } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import WordSearchForm from "~/components/activities/games/word-search/WordSearchForm";
import { createApiClientFromRequest } from "~/api/client";
import { WordSearchAPI } from "~/api/endpoints/word-search";

interface LoaderData {
    activityId: string;
    courseId: string;
}

interface ActionData {
    success?: boolean;
    errors?: Array<{ field: string; message: string }>;
    generalError?: string;
}

export const loader: LoaderFunction = async ({ params, request }) => {

    const url = new URL(request.url);

    const activityId = params.activityId;
    const courseId = url.searchParams.get("course") || undefined;
    
    if (!activityId) {
        throw new Response("Activity ID requerido", { status: 400 });
    }

    if (!courseId) {
        throw new Response("Course ID requerido", { status: 400 });
    }

    return json<LoaderData>({ activityId, courseId });
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
        const response = await WordSearchAPI.create(activityId, wordSearchData, apiClient);

        if (response.success) {
            // Redirigir a la vista de detalle de la actividad
            return redirect(`/activities/course/${courseId}`);
        } else {
            return json<ActionData>({
                success: false,
                generalError: response.message || "Error al crear la sopa de letras",
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Error creando sopa de letras:", error);
        
        // Manejar errores de validación del backend
        if (error.response?.data?.message) {
            return json<ActionData>({
                success: false,
                generalError: error.response.data.message,
            }, { status: 400 });
        }

        return json<ActionData>({
            success: false,
            generalError: error.message || "Error al crear la sopa de letras",
        }, { status: 400 });
    }
};

export default function CreateWordSearchGame() {
    const { activityId } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigate = useNavigate();

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
                    
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Configurar Sopa de Letras</h1>
                            <p className="text-gray-600">Define las palabras, dimensiones y reglas del juego</p>
                        </div>
                    </div>
                </div>

                {/* Error general */}
                {actionData?.generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800 font-medium">⚠️ {actionData.generalError}</p>
                    </div>
                )}

                {/* Formulario */}
                <WordSearchForm
                    activityId={activityId}
                    errors={actionData?.errors}
                />
            </div>
        </div>
    );
}