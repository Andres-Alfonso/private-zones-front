// app/routes/activities/create.tsx

import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Gamepad2, X } from "lucide-react";
import GameTypeSelector from "~/components/activities/GameTypeSelector";
import type { GameType } from "~/api/types/activity.types";

interface LoaderData {
    courseId: string;
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const courseId = url.searchParams.get("course");

    if (!courseId) {
        throw new Response("courseId es requerido", {
            status: 400,
            statusText: "Bad Request"
        });
    }

    return json<LoaderData>({ courseId });
};

export default function CreateActivity() {
    const { courseId } = useLoaderData<LoaderData>();
    const navigate = useNavigate();

    const handleGameTypeSelect = (gameType: GameType) => {
        // Navegar directamente al formulario del tipo de juego con el courseId
        navigate(`/activities/create/${gameType}?course=${courseId}`);
    };

    const handleBack = () => {
        navigate(`/activities/course/${courseId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                            <Gamepad2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Actividad</h1>
                            <p className="text-gray-600">Selecciona el tipo de juego para comenzar</p>
                        </div>
                    </div>
                    <button
                        onClick={handleBack}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <X className="h-5 w-5" />
                        <span>Cancelar</span>
                    </button>
                </div>
            </div>

            {/* Selector de tipo de juego */}
            <GameTypeSelector onSelect={handleGameTypeSelect} />
        </div>
    );
}