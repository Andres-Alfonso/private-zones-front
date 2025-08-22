// app/components/contents/CreateContentHeader.tsx

import { ArrowLeft, Eye } from "lucide-react";

interface CreateContentHeaderProps {
    onBack: () => void;
    onPreview: () => void;
    isValid: boolean;
    currentStep: number;
    totalSteps: number;
}

export const CreateContentHeader = ({
    onBack,
    onPreview,
    isValid,
    currentStep,
    totalSteps
}: CreateContentHeaderProps) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Volver</span>
                    </button>

                    <div className="h-6 w-px bg-gray-300"></div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Contenido</h1>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={onPreview}
                        disabled={!isValid}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Eye className="h-4 w-4" />
                        <span>Vista Previa</span>
                    </button>
                </div>
            </div>

            {/* Indicador de progreso */}
            {/* <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>Progreso</span>
                    <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                </div>
            </div> */}
        </div>
    );
};