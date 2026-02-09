// app/routes/activities/create.$gameType.tsx

import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { Gamepad2, ArrowRight, Loader2 } from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ActivitiesAPI } from "~/api/endpoints/activities";
import type { GameType } from "~/api/types/activity.types";

interface LoaderData {
    courseId: string;
    gameType: GameType;
    gameTypeName: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const url = new URL(request.url);
    const courseId = url.searchParams.get("course");
    const gameType = params.gameType as GameType;

    if (!courseId) {
        throw new Response("courseId es requerido", { status: 400 });
    }

    if (!gameType) {
        throw new Response("gameType es requerido", { status: 400 });
    }

    const gameTypeNames: Record<GameType, string> = {
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

    return json<LoaderData>({
        courseId,
        gameType,
        gameTypeName: gameTypeNames[gameType] || gameType,
    });
};

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const courseId = formData.get("courseId") as string;
    const gameType = params.gameType as GameType;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
        const apiClient = createApiClientFromRequest(request);
        
        // Crear actividad con el formato que espera el backend
        const response = await ActivitiesAPI.create({
            courseId,
            type: gameType,
            status: "draft",
            translations: [
                {
                    languageCode: "es",
                    title: title,
                    description: description || "",
                }
            ],
            configuration: {
                isGradable: true,
                showTimer: true,
                showScore: true,
                showHints: true,
                maxHints: 3,
                showScoreImmediately: true,
                showFeedbackAfterCompletion: true,
            }
        }, apiClient);

        // ✅ Acceder a response.data.id en lugar de activity.id
        return redirect(`/activities/${response.data.id}/games/${gameType}/create?course=${courseId}`);
    } catch (error) {
        console.error("Error creando actividad:", error);
        throw new Response("Error creando la actividad", { status: 500 });
    }
};

export default function CreateGameActivity() {
    const { courseId, gameType, gameTypeName } = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                        <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Actividad: {gameTypeName}</h1>
                        <p className="text-gray-600">Completa la información básica de la actividad</p>
                    </div>
                </div>

                <Form method="post" className="space-y-6">
                    <input type="hidden" name="courseId" value={courseId} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título de la Actividad *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder={`Ej: ${gameTypeName} - Tema 1`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción (opcional)
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Describe brevemente esta actividad..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Creando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continuar</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}