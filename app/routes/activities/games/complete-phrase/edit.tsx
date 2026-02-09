// app/routes/activities/games/complete-phrase/edit.tsx

import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigate } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import CompletePhraseForm from "~/components/activities/games/complete-phrase/CompletePhraseForm";
import { createApiClientFromRequest } from "~/api/client";
import { CompletePhraseAPI } from "~/api/endpoints/complete-phrase";
import type { CompletePhraseGame } from "~/api/types/complete-phrase.types";

interface LoaderData {
    activityId: string;
    completePhraseGame: CompletePhraseGame;
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
        const response = await CompletePhraseAPI.get(activityId, apiClient);
        
        if (!response.success) {
            throw new Response(response.message || "Error cargando el juego", { status: 500 });
        }

        return json<LoaderData>({ 
            activityId, 
            completePhraseGame: response.data 
        });
    } catch (error: any) {
        console.error("Error cargando el juego:", error);
        
        if (error.response?.status === 404) {
            throw new Response("Juego no encontrado", { status: 404 });
        }
        
        throw new Response("Error cargando el juego", { status: 500 });
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
    
    try {
        const phrasesJson = formData.get("phrases") as string;
        const phrases = JSON.parse(phrasesJson);

        const completePhraseData = {
            phrases,
            caseSensitive: formData.get("caseSensitive") === "true",
            showHints: formData.get("showHints") === "true",
            shuffleOptions: formData.get("shuffleOptions") === "true",
            allowPartialCredit: formData.get("allowPartialCredit") === "true",
            pointsPerBlank: parseInt(formData.get("pointsPerBlank") as string),
            bonusForPerfect: parseInt(formData.get("bonusForPerfect") as string),
            penaltyPerError: parseInt(formData.get("penaltyPerError") as string),
            penaltyPerHint: parseInt(formData.get("penaltyPerHint") as string),
        };

        // Llamada real a la API
        const apiClient = createApiClientFromRequest(request);
        const response = await CompletePhraseAPI.update(activityId, completePhraseData, apiClient);
        
        if (response.success) {
            return redirect(`/activities/course/${courseId}`);
        } else {
            return json<ActionData>({
                success: false,
                generalError: response.message || "Error al actualizar el juego",
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Error actualizando juego:", error);
        
        // Manejar errores de validación del backend
        if (error.response?.data?.message) {
            return json<ActionData>({
                success: false,
                generalError: error.response.data.message,
            }, { status: 400 });
        }

        return json<ActionData>({
            success: false,
            generalError: error.message || "Error al actualizar el juego",
        }, { status: 400 });
    }
};

export default function EditCompletePhraseGame() {
    const { activityId, completePhraseGame } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
                    <button
                        onClick={() => navigate(`/activities/${activityId}`)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver a la actividad</span>
                    </button>
                    
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                            <span className="text-2xl">📝</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editar Completar Frases</h1>
                            <p className="text-gray-600">Modifica las frases y configuración del juego</p>
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
                <CompletePhraseForm
                    activityId={activityId}
                    initialData={completePhraseGame}
                    errors={actionData?.errors}
                    isEdit
                />
            </div>
        </div>
    );
}