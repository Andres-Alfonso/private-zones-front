// app/routes/assessments/$id.questions.tsx

import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import QuestionBuilder, { Question } from '~/components/assessments/QuestionBuilder/QuestionBuilder';
import { createApiClientFromRequest } from '~/api/client';
import { QuestionsApi } from '~/api/endpoints/questions';
import { AssessmentApi } from '~/api/endpoints/assessments';
import apiClient from '~/api/client';

interface LoaderData {
    assessmentId: string;
    assessmentTitle: string;
    questions: Question[];
    error?: string;
}

interface ActionData {
    success?: boolean;
    message?: string;
    error?: string;
    data?: Question[];
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const assessmentId = params.id as string;

    try {
        const apiClient = createApiClientFromRequest(request);

        // Obtener información del assessment
        const assessmentResponse = await AssessmentApi.getById(assessmentId, apiClient);
        const assessment = assessmentResponse.data;

        // Obtener preguntas
        const questions = await QuestionsApi.getQuestions(assessmentId, apiClient);

        const translation = assessment.translations?.find((t: any) => t.languageCode === 'es')
            || assessment.translations?.[0];

        return json<LoaderData>({
            assessmentId,
            assessmentTitle: translation?.title || 'Evaluación',
            questions: questions || [],
        });
    } catch (error: any) {
        console.error('Error loading questions:', error);
        return json<LoaderData>(
            {
                assessmentId,
                assessmentTitle: 'Evaluación',
                questions: [],
                error: error.message || 'Error al cargar las preguntas',
            },
            { status: 500 }
        );
    }
};

export const action: ActionFunction = async ({ params, request }) => {
    const assessmentId = params.id as string;

    try {
        const formData = await request.formData();
        const questionsJson = formData.get('questions') as string;
        const questions = JSON.parse(questionsJson) as Question[];

        const apiClient = createApiClientFromRequest(request);
        const savedQuestions = await QuestionsApi.saveQuestions(
            assessmentId,
            questions,
            apiClient
        );

        return json<ActionData>({
            success: true,
            message: 'Preguntas guardadas exitosamente',
            data: savedQuestions,
        });
    } catch (error: any) {
        console.error('Error saving questions:', error);
        return json<ActionData>(
            {
                success: false,
                error: error.message || 'Error al guardar las preguntas',
            },
            { status: 500 }
        );
    }
};

export default function AssessmentQuestions() {
    const { assessmentId, assessmentTitle, questions, error: loaderError } = useLoaderData<LoaderData>();
    const navigate = useNavigate();

    const handleSaveQuestions = async (updatedQuestions: Question[]) => {
        // Llamar directamente al backend usando el apiClient del navegador
        const savedQuestions = await QuestionsApi.saveQuestions(
            assessmentId,
            updatedQuestions
        );

        return savedQuestions;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(`/assessments/${assessmentId}/edit`)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Preguntas de la Evaluación
                                </h1>
                                <p className="text-gray-600 mt-1">{assessmentTitle}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/assessments/${assessmentId}`)}
                            className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                        >
                            <CheckCircle className="h-4 w-4" />
                            <span>Finalizar y Publicar</span>
                        </button>
                    </div>
                </div>

                {/* Mensaje de error del loader */}
                {loaderError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-800 font-medium">Error al cargar las preguntas</p>
                            <p className="text-red-600 text-sm mt-1">{loaderError}</p>
                        </div>
                    </div>
                )}

                {/* Question Builder */}
                <QuestionBuilder
                    assessmentId={assessmentId}
                    initialQuestions={questions}
                    onSave={handleSaveQuestions}
                />
            </div>
        </div>
    );
}