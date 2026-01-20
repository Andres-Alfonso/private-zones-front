import { ArrowLeft, ArrowRight, Send } from 'lucide-react';

interface QuestionNavigationProps {
    currentIndex: number;
    totalQuestions: number;
    answers: Record<string, any>;
    questions: Array<{ id: string; isRequired: boolean }>;
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

    const answeredCount = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length;
    const requiredUnanswered = questions.filter(q => q.isRequired && !answers[q.id]).length;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Indicadores de progreso */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progreso: {answeredCount} de {totalQuestions} respondidas</span>
                    {requiredUnanswered > 0 && (
                        <span className="text-red-600 font-semibold">
                            {requiredUnanswered} obligatoria{requiredUnanswered > 1 ? 's' : ''} sin responder
                        </span>
                    )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Navegación por preguntas (solo si está permitido) */}
            {allowNavigation && (
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Ir a pregunta:</p>
                    <div className="grid grid-cols-10 gap-2">
                        {questions.map((question, index) => {
                            const isAnswered = answers[question.id] !== undefined &&
                                answers[question.id] !== null &&
                                answers[question.id] !== '';
                            const isCurrent = index === currentIndex;
                            const isRequired = question.isRequired;

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => onGoToQuestion(index)}
                                    className={`
                                        aspect-square rounded-lg font-semibold text-sm
                                        transition-all
                                        ${isCurrent
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                            : isAnswered
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : isRequired
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
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

            {/* Botones de navegación */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onPrevious}
                    disabled={isFirstQuestion}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Anterior</span>
                </button>

                {isLastQuestion ? (
                    <button
                        onClick={onSubmit}
                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-semibold"
                    >
                        <Send className="h-5 w-5" />
                        <span>Enviar Evaluación</span>
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span>Siguiente</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}