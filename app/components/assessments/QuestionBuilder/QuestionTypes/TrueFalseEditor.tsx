// app/components/assessments/QuestionBuilder/QuestionTypes/TrueFalseEditor.tsx

import { CheckCircle, XCircle } from 'lucide-react';
import type { Question } from '../QuestionBuilder';
import { useEffect } from 'react';

interface TrueFalseEditorProps {
    question: Question;
    onChange: (question: Question) => void;
}

export default function TrueFalseEditor({
    question,
    onChange
}: TrueFalseEditorProps) {

    // Inicializar opciones si no existen
    useEffect(() => {
        if (!question.options || question.options.length === 0) {
            onChange({
                ...question,
                options: [
                    {
                        id: 'true-option',
                        order: 0,
                        isCorrect: false,
                        translations: [
                            {
                                languageCode: 'es',
                                optionText: 'Verdadero',
                                feedback: ''
                            }
                        ]
                    },
                    {
                        id: 'false-option',
                        order: 1,
                        isCorrect: false,
                        translations: [
                            {
                                languageCode: 'es',
                                optionText: 'Falso',
                                feedback: ''
                            }
                        ]
                    }
                ]
            });
        }
    }, []);

    const setCorrectAnswer = (isTrue: boolean) => {
        onChange({
            ...question,
            options: question.options.map(opt => ({
                ...opt,
                isCorrect: opt.id === (isTrue ? 'true-option' : 'false-option')
            }))
        });
    };

    const updateFeedback = (optionId: string, feedback: string) => {
        onChange({
            ...question,
            options: question.options.map(opt =>
                opt.id === optionId
                    ? {
                        ...opt,
                        translations: opt.translations.map(t => ({
                            ...t,
                            feedback
                        }))
                    }
                    : opt
            )
        });
    };

    const trueOption = question.options?.find(o => o.id === 'true-option');
    const falseOption = question.options?.find(o => o.id === 'false-option');
    const trueFeedback = trueOption?.translations.find(t => t.languageCode === 'es')?.feedback || '';
    const falseFeedback = falseOption?.translations.find(t => t.languageCode === 'es')?.feedback || '';

    return (
        <div className="space-y-4">

            {/* Selector de respuesta correcta */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona la respuesta correcta *
                </label>

                <button
                    type="button"
                    onClick={() => setCorrectAnswer(true)}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${trueOption?.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-green-300'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        {trueOption?.isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                            <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="text-lg font-medium text-gray-900">Verdadero</span>
                    </div>
                    {trueOption?.isCorrect && (
                        <span className="text-sm font-medium text-green-600">Correcta</span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setCorrectAnswer(false)}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${falseOption?.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-green-300'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        {falseOption?.isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                            <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="text-lg font-medium text-gray-900">Falso</span>
                    </div>
                    {falseOption?.isCorrect && (
                        <span className="text-sm font-medium text-green-600">Correcta</span>
                    )}
                </button>
            </div>

            {/* Feedback específico */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback si seleccionan "Verdadero"
                    </label>
                    <textarea
                        value={trueFeedback}
                        onChange={(e) => updateFeedback('true-option', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                        placeholder="Feedback para quien seleccione Verdadero..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback si seleccionan "Falso"
                    </label>
                    <textarea
                        value={falseFeedback}
                        onChange={(e) => updateFeedback('false-option', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                        placeholder="Feedback para quien seleccione Falso..."
                    />
                </div>
            </div>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Verdadero/Falso:</strong> Los estudiantes deben indicar si la afirmación es verdadera o falsa.
                </p>
            </div>
        </div>
    );
}