import { useState } from 'react';

interface QuestionRendererProps {
    question: {
        id: string;
        type: string;
        points: number;
        isRequired: boolean;
        translations: Array<{
            languageCode: string;
            questionText: string;
            hint?: string;
        }>;
        options: Array<{
            id: string;
            order: number;
            translations: Array<{
                languageCode: string;
                optionText: string;
            }>;
        }>;
        caseSensitive?: boolean;
        minLength?: number;
        maxLength?: number;
        scaleMin?: number;
        scaleMax?: number;
        scaleStep?: number;
    };
    answer: any;
    onAnswerChange: (answer: any) => void;
    languageCode: string;
}

export default function QuestionRenderer({
    question,
    answer,
    onAnswerChange,
    languageCode
}: QuestionRendererProps) {
    const translation = question.translations.find(t => t.languageCode === languageCode);
    const questionText = translation?.questionText || '';
    const hint = translation?.hint;

    const renderQuestion = () => {
        switch (question.type) {
            case 'multiple_choice':
                return (
                    <div className="space-y-3">
                        {question.options
                            .sort((a, b) => a.order - b.order)
                            .map((option) => {
                                const optionTranslation = option.translations.find(
                                    t => t.languageCode === languageCode
                                );
                                return (
                                    <label
                                        key={option.id}
                                        className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option.id}
                                            checked={answer === option.id}
                                            onChange={(e) => onAnswerChange(e.target.value)}
                                            className="mt-1 mr-3"
                                        />
                                        <span className="flex-1">{optionTranslation?.optionText}</span>
                                    </label>
                                );
                            })}
                    </div>
                );

            case 'multiple_response':
                return (
                    <div className="space-y-3">
                        {question.options
                            .sort((a, b) => a.order - b.order)
                            .map((option) => {
                                const optionTranslation = option.translations.find(
                                    t => t.languageCode === languageCode
                                );
                                const selectedOptions = Array.isArray(answer) ? answer : [];
                                return (
                                    <label
                                        key={option.id}
                                        className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            value={option.id}
                                            checked={selectedOptions.includes(option.id)}
                                            onChange={(e) => {
                                                const newAnswer = e.target.checked
                                                    ? [...selectedOptions, option.id]
                                                    : selectedOptions.filter(id => id !== option.id);
                                                onAnswerChange(newAnswer);
                                            }}
                                            className="mt-1 mr-3"
                                        />
                                        <span className="flex-1">{optionTranslation?.optionText}</span>
                                    </label>
                                );
                            })}
                    </div>
                );

            case 'true_false':
                return (
                    <div className="space-y-3">
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value="true"
                                checked={answer === 'true'}
                                onChange={(e) => onAnswerChange(e.target.value)}
                                className="mr-3"
                            />
                            <span>Verdadero</span>
                        </label>
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value="false"
                                checked={answer === 'false'}
                                onChange={(e) => onAnswerChange(e.target.value)}
                                className="mr-3"
                            />
                            <span>Falso</span>
                        </label>
                    </div>
                );

            case 'short_answer':
                return (
                    <input
                        type="text"
                        value={answer || ''}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        minLength={question.minLength}
                        maxLength={question.maxLength}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Escribe tu respuesta..."
                    />
                );

            case 'essay':
                return (
                    <textarea
                        value={answer || ''}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        minLength={question.minLength}
                        maxLength={question.maxLength}
                        rows={6}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Escribe tu respuesta..."
                    />
                );

            case 'scale':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{question.scaleMin}</span>
                            <span>{question.scaleMax}</span>
                        </div>
                        <input
                            type="range"
                            min={question.scaleMin}
                            max={question.scaleMax}
                            step={question.scaleStep || 1}
                            value={answer || question.scaleMin}
                            onChange={(e) => onAnswerChange(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-center text-lg font-semibold">
                            Valor seleccionado: {answer || question.scaleMin}
                        </div>
                    </div>
                );

            default:
                return <p className="text-gray-500">Tipo de pregunta no soportado</p>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {hint && (
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
                            💡 <strong>Pista:</strong> {hint}
                        </p>
                    )}
                </div>
                <div className="ml-4 bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold text-blue-800">
                    {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                </div>
            </div>

            {renderQuestion()}
        </div>
    );
}