// app/components/assessments/QuestionBuilder/QuestionTypes/EssayEditor.tsx

import { AlertCircle, FileText } from 'lucide-react';
import type { Question } from '../QuestionBuilder';
import Input from '~/components/ui/Input';

interface EssayEditorProps {
    question: Question;
    onChange: (question: Question) => void;
}

export default function EssayEditor({
    question,
    onChange
}: EssayEditorProps) {

    const updateField = (field: keyof Question, value: any) => {
        onChange({
            ...question,
            [field]: value
        });
    };

    return (
        <div className="space-y-6">

            {/* Configuración de longitud */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Límites de Texto</h4>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        id="minLength"
                        label="Palabras mínimas"
                        type="number"
                        value={question.minLength || ''}
                        onChange={(e) => updateField('minLength', parseInt(e.target.value) || undefined)}
                        min="1"
                        placeholder="Ej: 100"
                    />

                    <Input
                        id="maxLength"
                        label="Palabras máximas"
                        type="number"
                        value={question.maxLength || ''}
                        onChange={(e) => updateField('maxLength', parseInt(e.target.value) || undefined)}
                        min="1"
                        placeholder="Ej: 1000"
                    />
                </div>

                <p className="text-sm text-gray-600">
                    Define los límites de longitud para la respuesta del estudiante.
                    Dejar vacío significa sin límite.
                </p>
            </div>

            {/* Rúbrica de calificación (placeholder) */}
            <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-start">
                    <FileText className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-medium text-purple-900 mb-1">Rúbrica de Calificación</h4>
                        <p className="text-sm text-purple-800">
                            Puedes crear una rúbrica de calificación para esta pregunta que ayudará a los instructores
                            a evaluar las respuestas de manera consistente.
                        </p>
                        <button
                            type="button"
                            className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                            onClick={() => alert('Funcionalidad de rúbrica en desarrollo')}
                        >
                            + Agregar Rúbrica
                        </button>
                    </div>
                </div>
            </div>

            {/* Información sobre calificación */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Calificación Manual Requerida</p>
                        <p>
                            Las preguntas tipo ensayo deben ser calificadas manualmente por un instructor.
                            Se recomienda proporcionar una rúbrica clara para mantener consistencia en la evaluación.
                        </p>
                    </div>
                </div>
            </div>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Ensayo:</strong> Los estudiantes escriben una respuesta extensa y detallada.
                    Ideal para evaluar pensamiento crítico, análisis y habilidades de redacción.
                </p>
            </div>
        </div>
    );
}