// ~/components/modules/CreateModuleHeader.tsx

import { ArrowLeft, Eye, BookOpen, Layers } from "lucide-react";
import { CourseBasic } from "~/api/types/course.types";

interface CreateModuleHeaderProps {
    course: CourseBasic;
    onBack: () => void;
    onPreview: () => void;
    isValid: boolean;
}

export function CreateModuleHeader({
    course,
    onBack,
    onPreview,
    isValid
}: CreateModuleHeaderProps) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver</span>
                    </button>

                    <div className="h-6 w-px bg-gray-300" />

                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Layers className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Crear Módulo</h1>
                            {/* <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BookOpen className="h-4 w-4" />
                                <span>Curso: {course.title}</span>
                            </div> */}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={onPreview}
                        disabled={!isValid}
                        className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200
              ${isValid
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            }
            `}
                    >
                        <Eye className="h-4 w-4" />
                        <span>Vista Previa</span>
                    </button>
                </div>
            </div>
        </div>
    );
}