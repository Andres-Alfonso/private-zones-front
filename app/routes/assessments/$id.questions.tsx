// app/routes/assessments/$id.questions.tsx

import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import QuestionBuilder, { Question } from '~/components/assessments/QuestionBuilder/QuestionBuilder';
import { createApiClientFromRequest } from '~/api/client';

interface LoaderData {
    assessmentId: string;
    assessmentTitle: string;
    questions: Question[];
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const assessmentId = params.id as string;

    try {
        // Aquí llamarías a tu API para obtener las preguntas existentes
        // const questions = await AssessmentAPI.getQuestions(assessmentId, requestApiClient);

        // Por ahora devolvemos datos de ejemplo
        const mockData: LoaderData = {
            assessmentId,
            assessmentTitle: 'Evaluación Final - Módulo 1',
            questions: []
        };

        return json(mockData);
    } catch (error: any) {
        console.error('Error loading questions:', error);
        throw new Response('Error al cargar las preguntas', { status: 500 });
    }
};

export const action: ActionFunction = async ({ params, request }) => {
    const assessmentId = params.id as string;
    const formData = await request.formData();

    try {
        const questionsJson = formData.get('questions') as string;
        const questions = JSON.parse(questionsJson) as Question[];

        // Aquí llamarías a tu API para guardar las preguntas
        // const requestApiClient = createApiClientFromRequest(request);
        // await AssessmentAPI.saveQuestions(assessmentId, questions, requestApiClient);

        console.log('Guardando preguntas para assessment:', assessmentId);
        console.log('Preguntas:', questions);

        return json({ success: true, message: 'Preguntas guardadas exitosamente' });
    } catch (error: any) {
        console.error('Error saving questions:', error);
        return json(
            { success: false, error: error.message || 'Error al guardar las preguntas' },
            { status: 500 }
        );
    }
};

export default function AssessmentQuestions() {
    const { assessmentId, assessmentTitle, questions } = useLoaderData<LoaderData>();
    const navigate = useNavigate();

    const handleSaveQuestions = async (updatedQuestions: Question[]) => {
        const formData = new FormData();
        formData.append('questions', JSON.stringify(updatedQuestions));

        const response = await fetch(`/assessments/${assessmentId}/questions`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al guardar las preguntas');
        }
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