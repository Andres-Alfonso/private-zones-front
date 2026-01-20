// app/components/assessments/TakeAssessment/QuestionRenderer.tsx

import { AlertCircle } from 'lucide-react';

interface QuestionRendererProps {
    question: any;
    answer: any;
    onAnswerChange: (answer: any) => void;
    languageCode: string;
}

export default function QuestionRenderer({
    question,
    answer,
    onAnswerChange,
    languageCode = 'es',
}: QuestionRendererProps) {
    const translation = question.translations?.find(
        (t: any) => t.languageCode === languageCode
    ) || question.translations?.[0];

    const renderByType = () => {
        switch (question.type) {
            case 'multiple_choice':
                return (
                    <MultipleChoice
                        options={question.options}
                        selectedOption={answer}
                        onChange={onAnswerChange}
                        languageCode={languageCode}
                    />
                );

            case 'multiple_response':
                return (
                    <MultipleResponse
                        options={question.options}
                        selectedOptions={answer || []}
                        onChange={onAnswerChange}
                        languageCode={languageCode}
                    />
                );

            case 'true_false':
                return (
                    <TrueFalse
                        selectedValue={answer}
                        onChange={onAnswerChange}
                    />
                );

            case 'short_answer':
                return (
                    <ShortAnswer
                        value={answer || ''}
                        onChange={onAnswerChange}
                        maxLength={question.maxLength}
                    />
                );

            case 'essay':
                return (
                    <Essay
                        value={answer || ''}
                        onChange={onAnswerChange}
                        maxLength={question.maxLength}
                    />
                );

            default:
                return (
                    <div className="text-gray-500 italic">
                        Tipo de pregunta no soportado: {question.type}
                    </div>
                );
        }
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex-1">
                        {translation?.text || 'Sin texto'}
                    </h2>
                    <div className="ml-4 flex items-center space-x-2 text-sm">
                        {question.isRequired && (
                            <span className="text-red-500 font-medium">*Requerida</span>
                        )}
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                        </span>
                    </div>
                </div>

                {translation?.explanation && (
                    <p className="text-gray-600 text-sm mt-2">{translation.explanation}</p>
                )}
            </div>

            {renderByType()}
        </div>
    );
}

// Componentes individuales para cada tipo de pregunta

function MultipleChoice({ options, selectedOption, onChange, languageCode }: any) {
    return (
        <div className="space-y-3">
            {options
                .sort((a: any, b: any) => a.order - b.order)
                .map((option: any) => {
                    const translation = option.translations?.find(
                        (t: any) => t.languageCode === languageCode
                    ) || option.translations?.[0];

                    return (
                        <label
                            key={option.id}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === option.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="option"
                                value={option.id}
                                checked={selectedOption === option.id}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-5 h-5 text-blue-600"
                            />
                            <span className="ml-3 text-gray-900">{translation?.text}</span>
                        </label>
                    );
                })}
        </div>
    );
}

function MultipleResponse({ options, selectedOptions, onChange, languageCode }: any) {
    const handleToggle = (optionId: string) => {
        const newSelected = selectedOptions.includes(optionId)
            ? selectedOptions.filter((id: string) => id !== optionId)
            : [...selectedOptions, optionId];
        onChange(newSelected);
    };

    return (
        <div className="space-y-3">
            {options
                .sort((a: any, b: any) => a.order - b.order)
                .map((option: any) => {
                    const translation = option.translations?.find(
                        (t: any) => t.languageCode === languageCode
                    ) || option.translations?.[0];

                    return (
                        <label
                            key={option.id}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOptions.includes(option.id)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(option.id)}
                                onChange={() => handleToggle(option.id)}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className="ml-3 text-gray-900">{translation?.text}</span>
                        </label>
                    );
                })}
        </div>
    );
}

function TrueFalse({ selectedValue, onChange }: any) {
    return (
        <div className="space-y-3">
            <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedValue === 'true'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
            >
                <input
                    type="radio"
                    name="trueFalse"
                    value="true"
                    checked={selectedValue === 'true'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 text-green-600"
                />
                <span className="ml-3 text-gray-900 font-medium">Verdadero</span>
            </label>

            <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedValue === 'false'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
            >
                <input
                    type="radio"
                    name="trueFalse"
                    value="false"
                    checked={selectedValue === 'false'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 text-red-600"
                />
                <span className="ml-3 text-gray-900 font-medium">Falso</span>
            </label>
        </div>
    );
}

function ShortAnswer({ value, onChange, maxLength }: any) {
    return (
        <div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                placeholder="Escribe tu respuesta..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            {maxLength && (
                <p className="text-sm text-gray-500 mt-2">
                    {value.length} / {maxLength} caracteres
                </p>
            )}
        </div>
    );
}

function Essay({ value, onChange, maxLength }: any) {
    return (
        <div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                rows={8}
                placeholder="Escribe tu respuesta..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            />
            {maxLength && (
                <p className="text-sm text-gray-500 mt-2">
                    {value.length} / {maxLength} caracteres
                </p>
            )}
        </div>
    );
}