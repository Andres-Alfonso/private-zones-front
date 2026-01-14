// app/components/assessments/QuestionBuilder/QuestionPreview.tsx

import { Eye, CheckCircle, Circle, Square, CheckSquare } from 'lucide-react';
import type { Question } from './QuestionBuilder';

interface QuestionPreviewProps {
    questions: Question[];
}

export default function QuestionPreview({ questions }: QuestionPreviewProps) {

    const getQuestionText = (question: Question): string => {
        const translation = question.translations.find(t => t.languageCode === 'es');
        return translation?.questionText || '';
    };

    const getOptionText = (option: any): string => {
        const translation = option.translations?.find((t: any) => t.languageCode === 'es');
        return translation?.optionText || '';
    };

    const renderQuestion = (question: Question, index: number) => {
        const questionText = getQuestionText(question);

        switch (question.type) {
            case 'multiple_choice':
                return (
                    <div key={question.id} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    {question.isRequired && (
                                        <span className="text-red-500 text-sm">*</span>
                                    )}
                                </div>
                                <p className="text-gray-900 font-medium">{questionText}</p>
                            </div>
                            {question.isGradable && (
                                <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                                    {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 pl-10">
                            {question.options.map((option) => (
                                <label
                                    key={option.id}
                                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <Circle className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-700">{getOptionText(option)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'multiple_response':
                return (
                    <div key={question.id} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    {question.isRequired && (
                                        <span className="text-red-500 text-sm">*</span>
                                    )}
                                </div>
                                <p className="text-gray-900 font-medium">{questionText}</p>
                                <p className="text-sm text-gray-500 mt-1">(Selecciona todas las que apliquen)</p>
                            </div>
                            {question.isGradable && (
                                <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                                    {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 pl-10">
                            {question.options.map((option) => (
                                <label
                                    key={option.id}
                                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <Square className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-700">{getOptionText(option)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'true_false':
                return (
                    <div key={question.id} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    {question.isRequired && (
                                        <span className="text-red-500 text-sm">*</span>
                                    )}
                                </div>
                                <p className="text-gray-900 font-medium">{questionText}</p>
                            </div>
                            {question.isGradable && (
                                <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                                    {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                                </span>
                            )}
                        </div>

                        <div className="flex space-x-4 pl-10">
                            <button className="flex-1 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                                <span className="text-gray-900 font-medium">Verdadero</span>
                            </button>
                            <button className="flex-1 p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
                                <span className="text-gray-900 font-medium">Falso</span>
                            </button>
                        </div>
                    </div>
                );

            case 'short_answer':
                return (
                    <div key={question.id} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    {question.isRequired && (
                                        <span className="text-red-500 text-sm">*</span>
                                    )}
                                </div>
                                <p className="text-gray-900 font-medium">{questionText}</p>
                            </div>
                            {question.isGradable && (
                                <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                                    {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                                </span>
                            )}
                        </div>

                        <div className="pl-10">
                            <input
                                type="text"
                                placeholder="Escribe tu respuesta aquí..."
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                            />
                            {(question.minLength || question.maxLength) && (
                                <p className="text-xs text-gray-500 mt-2">
                                    {question.minLength && `Mínimo ${question.minLength} caracteres`}
                                    {question.minLength && question.maxLength && ' • '}
                                    {question.maxLength && `Máximo ${question.maxLength} caracteres`}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 'essay':
                return (
                    <div key={question.id} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    {question.isRequired && (
                                        <span className="text-red-500 text-sm">*</span>
                                    )}
                                </div>
                                <p className="text-gray-900 font-medium">{questionText}</p>
                            </div>
                            {question.isGradable && (
                                <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                                    {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                                </span>
                            )}
                        </div>

                        <div className="pl-10">
                            <textarea
                                placeholder="Escribe tu ensayo aquí..."
                                disabled
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                            />
                            {(question.minLength || question.maxLength) && (
                                <p className="text-xs text-gray-500 mt-2">
                                    {question.minLength && `Mínimo ${question.minLength} palabras`}
                                    {question.minLength && question.maxLength && ' • '}
                                    {question.maxLength && `Máximo ${question.maxLength} palabras`}
                                </p>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div key={question.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <p className="text-gray-600">Vista previa no disponible para este tipo de pregunta</p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-6">
                <Eye className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Vista Previa</h3>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-12">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No hay preguntas para previsualizar</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                    {questions.map((question, index) => renderQuestion(question, index))}
                </div>
            )}
        </div>
    );
}