// app/routes/assessments/$id.take.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useNavigate, Form, useActionData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { createApiClientFromRequest } from '~/api/client';
import { AssessmentApi } from '~/api/endpoints/assessments';
import QuestionRenderer from '~/components/assessments/TakeAssessment/QuestionRenderer';
import AssessmentTimer from '~/components/assessments/TakeAssessment/AssessmentTimer';
import QuestionNavigation from '~/components/assessments/TakeAssessment/QuestionNavigation';

interface Question {
    id: string;
    type: string;
    order: number;
    points: number;
    isRequired: boolean;
    translations: Array<{
        languageCode: string;
        text: string;
        explanation?: string;
    }>;
    options: Array<{
        id: string;
        order: number;
        translations: Array<{
            languageCode: string;
            text: string;
        }>;
    }>;
}

interface LoaderData {
    assessment: {
        id: string;
        title: string;
        description: string;
        instructions: string;
        welcomeMessage: string;
        questions: Question[];
        configuration: {
            timeLimit: number | null;
            strictTimeLimit: boolean;
            oneQuestionPerPage: boolean;
            allowNavigationBetweenQuestions: boolean;
            randomizeOptions: boolean;
        };
    };
    token: string;
    attemptId: string;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const assessmentId = params.id;

    if (!assessmentId) {
        throw new Response("ID de evaluación no proporcionado", { status: 400 });
    }

    // Validar token
    if (!token) {
        console.log('No token provided, redirecting to start');
        return redirect(`/assessments/${assessmentId}/start`);
    }

    try {
        const apiClient = createApiClientFromRequest(request);

        // Validar sesión con el token
        const sessionValidation = await AssessmentApi.validateSession(token, assessmentId, apiClient);

        if (!sessionValidation.success) {
            console.log('Token validation failed, redirecting to start');
            return redirect(`/assessments/${assessmentId}/start`);
        }

        // Obtener evaluación con preguntas
        const assessmentData = await AssessmentApi.getToTake(assessmentId, apiClient);

        return json<LoaderData>({
            assessment: assessmentData.data,
            token,
            attemptId: sessionValidation.data.attemptId,
        });
    } catch (error: any) {
        console.error('Error loading assessment:', error);
        return redirect(`/assessments/${assessmentId}/start`);
    }
};

export const action: ActionFunction = async ({ params, request }) => {
    const formData = await request.formData();
    const answersJson = formData.get('answers') as string;
    const attemptId = formData.get('attemptId') as string;
    const assessmentId = params.id;

    try {
        const apiClient = createApiClientFromRequest(request);
        const answers = JSON.parse(answersJson);

        // Enviar respuestas al backend
        const result = await AssessmentApi.submitAttempt(attemptId, answers, apiClient);

        // Redirigir a resultados
        return redirect(`/assessments/${assessmentId}/results/${attemptId}`);
    } catch (error: any) {
        console.error('Error submitting assessment:', error);
        return json(
            { error: error.response?.data?.message || 'Error al enviar las respuestas' },
            { status: 500 }
        );
    }
};

export default function TakeAssessment() {
    const { assessment, token, attemptId } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const actionData = useActionData<{ error?: string }>();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [showWelcome, setShowWelcome] = useState(!!assessment.welcomeMessage);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(
        assessment.configuration.timeLimit ? assessment.configuration.timeLimit * 60 : null
    );

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const totalQuestions = assessment.questions.length;

    // Guardar token en sessionStorage
    useEffect(() => {
        sessionStorage.setItem(`assessment_token_${assessment.id}`, token);
    }, [assessment.id, token]);

    // Prevenir salida accidental
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleTimeUp = () => {
        if (assessment.configuration.strictTimeLimit) {
            alert('El tiempo ha terminado. Tu evaluación será enviada automáticamente.');
            const form = document.getElementById('assessment-form') as HTMLFormElement;
            if (form) {
                form.submit();
            }
        } else {
            alert('El tiempo ha terminado. Por favor, envía tu evaluación.');
        }
    };

    const handleSubmit = () => {
        // Verificar preguntas requeridas sin responder
        const unansweredRequired = assessment.questions.filter(
            q => q.isRequired && !answers[q.id]
        );

        if (unansweredRequired.length > 0) {
            alert(`Tienes ${unansweredRequired.length} pregunta(s) requerida(s) sin responder.`);
            return;
        }

        if (!confirm('¿Estás seguro de enviar tu evaluación? No podrás modificar tus respuestas.')) {
            return;
        }

        const form = document.getElementById('assessment-form') as HTMLFormElement;
        if (form) {
            form.submit();
        }
    };

    // Pantalla de bienvenida
    if (showWelcome && assessment.welcomeMessage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {assessment.title}
                    </h1>
                    <div className="prose prose-sm max-w-none mb-6">
                        <p className="text-gray-600">{assessment.welcomeMessage}</p>
                    </div>

                    {assessment.instructions && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
                            <p className="text-blue-800 text-sm">{assessment.instructions}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600">Total de preguntas</p>
                            <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                        </div>
                        {assessment.configuration.timeLimit && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600">Tiempo límite</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {assessment.configuration.timeLimit} min
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowWelcome(false)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        Comenzar Evaluación
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Form id="assessment-form" method="post">
                <input type="hidden" name="answers" value={JSON.stringify(answers)} />
                <input type="hidden" name="attemptId" value={attemptId} />
            </Form>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header con timer */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
                            <p className="text-gray-600 text-sm mt-1">
                                Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                            </p>
                        </div>
                        {timeRemaining !== null && (
                            <AssessmentTimer
                                initialTime={timeRemaining}
                                onTimeUp={handleTimeUp}
                            />
                        )}
                    </div>
                </div>

                {/* Error de envío */}
                {actionData?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-800">{actionData.error}</p>
                        </div>
                    </div>
                )}

                {/* Pregunta actual */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <QuestionRenderer
                        question={currentQuestion}
                        answer={answers[currentQuestion.id]}
                        onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                        languageCode="es"
                    />
                </div>

                {/* Navegación */}
                <QuestionNavigation
                    currentIndex={currentQuestionIndex}
                    totalQuestions={totalQuestions}
                    answers={answers}
                    questions={assessment.questions}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    onGoToQuestion={setCurrentQuestionIndex}
                    allowNavigation={assessment.configuration.allowNavigationBetweenQuestions}
                />
            </div>
        </div>
    );
}