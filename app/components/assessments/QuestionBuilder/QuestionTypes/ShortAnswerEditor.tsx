// app/components/assessments/QuestionBuilder/QuestionTypes/ShortAnswerEditor.tsx

import { AlertCircle } from 'lucide-react';
import type { Question } from '../QuestionBuilder';
import Checkbox from '~/components/ui/Checkbox';
import Input from '~/components/ui/Input';

interface ShortAnswerEditorProps {
    question: Question;
    onChange: (question: Question) => void;
}

export default function ShortAnswerEditor({
    question,
    onChange
}: ShortAnswerEditorProps) {

    const updateField = (field: keyof Question, value: any) => {
        onChange({
            ...question,
            [field]: value
        });
    };

    return (
        <div className="space-y-6">

            {/* Configuración de sensibilidad */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Configuración de Respuesta</h4>

                <Checkbox
                    id="caseSensitive"
                    label="Sensible a mayúsculas/minúsculas"
                    checked={question.caseSensitive || false}
                    onChange={(checked) => updateField('caseSensitive', checked)}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        id="minLength"
                        label="Longitud mínima (caracteres)"
                        type="number"
                        value={question.minLength || ''}
                        onChange={(e) => updateField('minLength', parseInt(e.target.value) || undefined)}
                        min="1"
                        placeholder="Ej: 10"
                    />

                    <Input
                        id="maxLength"
                        label="Longitud máxima (caracteres)"
                        type="number"
                        value={question.maxLength || ''}
                        onChange={(e) => updateField('maxLength', parseInt(e.target.value) || undefined)}
                        min="1"
                        placeholder="Ej: 100"
                    />
                </div>
            </div>

            {/* Información sobre calificación */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Calificación Manual Requerida</p>
                        <p>
                            Las preguntas de respuesta corta deben ser calificadas manualmente por un instructor.
                            Los estudiantes recibirán su puntaje final una vez que la respuesta sea revisada.
                        </p>
                    </div>
                </div>
            </div>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Respuesta Corta:</strong> Los estudiantes escriben una respuesta breve en un campo de texto.
                    Ideal para preguntas que requieren respuestas específicas pero no extensas.
                </p>
            </div>
        </div>
    );
}