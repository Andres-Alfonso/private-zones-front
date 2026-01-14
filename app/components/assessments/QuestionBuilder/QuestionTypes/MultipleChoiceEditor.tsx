// app/components/assessments/QuestionBuilder/QuestionTypes/MultipleChoiceEditor.tsx

import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import type { Question, QuestionOption } from '../QuestionBuilder';

interface MultipleChoiceEditorProps {
    question: Question;
    onChange: (question: Question) => void;
}

export default function MultipleChoiceEditor({
    question,
    onChange
}: MultipleChoiceEditorProps) {

    const addOption = () => {
        const newOption: QuestionOption = {
            id: `temp-opt-${Date.now()}`,
            order: question.options.length,
            isCorrect: false,
            translations: [
                {
                    languageCode: 'es',
                    optionText: '',
                    feedback: ''
                }
            ]
        };

        onChange({
            ...question,
            options: [...question.options, newOption]
        });
    };

    const updateOption = (optionId: string, field: string, value: any) => {
        onChange({
            ...question,
            options: question.options.map(opt =>
                opt.id === optionId
                    ? {
                        ...opt,
                        translations: opt.translations.map(t =>
                            t.languageCode === 'es'
                                ? { ...t, [field]: value }
                                : t
                        )
                    }
                    : opt
            )
        });
    };

    const setCorrectOption = (optionId: string) => {
        onChange({
            ...question,
            options: question.options.map(opt => ({
                ...opt,
                isCorrect: opt.id === optionId
            }))
        });
    };

    const deleteOption = (optionId: string) => {
        onChange({
            ...question,
            options: question.options.filter(opt => opt.id !== optionId)
        });
    };

    const getOptionText = (option: QuestionOption): string => {
        const translation = option.translations.find(t => t.languageCode === 'es');
        return translation?.optionText || '';
    };

    const getOptionFeedback = (option: QuestionOption): string => {
        const translation = option.translations.find(t => t.languageCode === 'es');
        return translation?.feedback || '';
    };

    return (
        <div className="space-y-4">

            {question.options.map((option, index) => (
                <div
                    key={option.id}
                    className={`border-2 rounded-xl p-4 transition-all ${option.isCorrect
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-start space-x-3">

                        {/* Radio button para marcar como correcta */}
                        <button
                            type="button"
                            onClick={() => setCorrectOption(option.id)}
                            className="flex-shrink-0 mt-2"
                            title="Marcar como respuesta correcta"
                        >
                            {option.isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                                <Circle className="h-6 w-6 text-gray-400 hover:text-green-600 transition-colors" />
                            )}
                        </button>

                        {/* Contenido de la opción */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Opción {String.fromCharCode(65 + index)} *
                                </label>
                                <input
                                    type="text"
                                    value={getOptionText(option)}
                                    onChange={(e) => updateOption(option.id, 'optionText', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={`Texto de la opción ${String.fromCharCode(65 + index)}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback para esta opción (opcional)
                                </label>
                                <textarea
                                    value={getOptionFeedback(option)}
                                    onChange={(e) => updateOption(option.id, 'feedback', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                                    placeholder="Feedback específico para quien seleccione esta opción..."
                                />
                            </div>
                        </div>

                        {/* Botón eliminar */}
                        <button
                            type="button"
                            onClick={() => deleteOption(option.id)}
                            disabled={question.options.length <= 2}
                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Eliminar opción"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}

            {/* Botón agregar opción */}
            <button
                type="button"
                onClick={addOption}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors text-gray-600 hover:text-purple-600"
            >
                <Plus className="h-5 w-5" />
                <span>Agregar Opción</span>
            </button>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Opción Múltiple:</strong> Los estudiantes deben seleccionar UNA respuesta correcta.
                    Haz clic en el círculo junto a la opción para marcarla como correcta.
                </p>
            </div>
        </div>
    );
}