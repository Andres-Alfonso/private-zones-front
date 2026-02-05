// app/routes/activities/games/hanging/edit.tsx

import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigate } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import HangingForm from "~/components/activities/games/hanging/HangingForm";
import { createApiClientFromRequest } from "~/api/client";
import { HangingAPI } from "~/api/endpoints/hanging";
import type { HangingGame } from "~/api/types/hanging.types";

interface LoaderData {
    activityId: string;
    hangingGame: HangingGame;
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
        // ✅ Llamada real a la API
        const apiClient = createApiClientFromRequest(request);
        const response = await HangingAPI.get(activityId, apiClient);
        
        if (!response.success) {
            throw new Response(response.message || "Error cargando el juego", { status: 500 });
        }

        return json<LoaderData>({ 
            activityId, 
            hangingGame: response.data 
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

        const hangingData = {
            words,
            maxAttempts: parseInt(formData.get("maxAttempts") as string),
            caseSensitive: formData.get("caseSensitive") === "true",
            showCategory: formData.get("showCategory") === "true",
            showWordLength: formData.get("showWordLength") === "true",
            pointsPerWord: parseInt(formData.get("pointsPerWord") as string),
            bonusForNoErrors: parseInt(formData.get("bonusForNoErrors") as string),
            penaltyPerError: parseInt(formData.get("penaltyPerError") as string),
            penaltyPerHint: parseInt(formData.get("penaltyPerHint") as string),
        };

        // ✅ Llamada real a la API
        const apiClient = createApiClientFromRequest(request);
        const response = await HangingAPI.update(activityId, hangingData, apiClient);
        
        if (response.success) {
            return redirect(`/activities/${activityId}`);
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

export default function EditHangingGame() {
    const { activityId, hangingGame } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 py-8">
            {/* ✅ Cambio de max-w-4xl a max-w-6xl para más ancho */}
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
                    <button
                        onClick={() => navigate(`/activities/${activityId}`)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver a la actividad</span>
                    </button>
                    
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-2xl shadow-lg">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editar Ahorcado</h1>
                            <p className="text-gray-600">Modifica las palabras y configuración del juego</p>
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
                <HangingForm
                    activityId={activityId}
                    initialData={hangingGame}
                    errors={actionData?.errors}
                    isEdit
                />
            </div>
        </div>
    );
}