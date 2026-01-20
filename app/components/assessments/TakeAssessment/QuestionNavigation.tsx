// app/components/assessments/TakeAssessment/QuestionNavigation.tsx

import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface QuestionNavigationProps {
    currentIndex: number;
    totalQuestions: number;
    answers: Record<string, any>;
    questions: any[];
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onGoToQuestion: (index: number) => void;
    allowNavigation: boolean;
}

export default function QuestionNavigation({
    currentIndex,
    totalQuestions,
    answers,
    questions,
    onPrevious,
    onNext,
    onSubmit,
    onGoToQuestion,
    allowNavigation,
}: QuestionNavigationProps) {
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === totalQuestions - 1;

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / totalQuestions) * 100;

    return (
        <div className="space-y-4">
            {/* Progreso */}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso</span>
                    <span className="text-sm font-semibold text-blue-600">
                        {answeredCount} / {totalQuestions} respondidas
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onPrevious}
                    disabled={isFirstQuestion}
                    className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="font-medium">Anterior</span>
                </button>

                {!isLastQuestion ? (
                    <button
                        onClick={onNext}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <span>Siguiente</span>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                ) : (
                    <button
                        onClick={onSubmit}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        <Send className="h-5 w-5" />
                        <span>Enviar Evaluación</span>
                    </button>
                )}
            </div>

            {/* Mapa de preguntas */}
            {allowNavigation && (
                <div className="bg-white rounded-xl shadow p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Vista rápida de preguntas
                    </h3>
                    <div className="grid grid-cols-10 gap-2">
                        {questions.map((question, index) => {
                            const isAnswered = !!answers[question.id];
                            const isCurrent = index === currentIndex;

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => onGoToQuestion(index)}
                                    className={`
                                        aspect-square rounded-lg font-semibold text-sm transition-all
                                        ${isCurrent
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                            : isAnswered
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}