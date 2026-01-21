// app/routes/assessments/$id.start.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { ClipboardList, Clock, FileQuestion, CheckCircle, AlertCircle } from 'lucide-react';
import { createApiClientFromRequest } from '~/api/client';
import { AssessmentApi } from '~/api/endpoints/assessments';

interface LoaderData {
    assessment: {
        id: string;
        title: string;
        description: string;
        instructions: string;
        welcomeMessage: string;
        type: string;
        configuration: {
            timeLimit: number | null;
            maxAttempts: number;
            passingScore: number | null;
            maxScore: number;
            isGradable: boolean;
        };
        questionCount: number;
    };
    userAttempts: {
        count: number;
        canAttempt: boolean;
        lastAttempt?: {
            score: number;
            passed: boolean;
            completedAt: string;
        };
    };
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const assessmentId = params.id;
    
    if (!assessmentId) {
        throw new Response("ID de evaluación no proporcionado", { status: 400 });
    }

    try {
        const apiClient = createApiClientFromRequest(request);

        // Usamos el nuevo método del servicio
        const response = await AssessmentApi.getStartInfo(assessmentId, apiClient);
        
        // El servicio devuelve la estructura que ya manejabas (data.assessment, etc.)
        return json<LoaderData>({
            assessment: response.data.assessment,
            userAttempts: response.data.userAttempts,
        });
    } catch (error: any) {
        console.error('Error loading assessment start:', error);
        throw new Response('Error al cargar la evaluación', { status: 500 });
    }
};

export const action: ActionFunction = async ({ params, request }) => {
    const assessmentId = params.id;

    if (!assessmentId) {
        return json({ error: 'ID de evaluación faltante' }, { status: 400 });
    }

    try {
        const apiClient = createApiClientFromRequest(request);

        // Creamos la sesión usando el servicio
        const result = await AssessmentApi.createSession(assessmentId, apiClient);
        
        const { token } = result.data;

        // Redirigir a la evaluación con el token
        return redirect(`/assessments/${assessmentId}/take?token=${token}`);
    } catch (error: any) {
        // Manejo de errores basado en la respuesta de Axios si está disponible
        const errorMessage = error.response?.data?.message || 'Error al iniciar la evaluación';
        console.error('Error starting assessment:', error);
        
        return json(
            { error: errorMessage },
            { status: error.response?.status || 500 }
        );
    }
};

export default function StartAssessment() {
    const { assessment, userAttempts } = useLoaderData<LoaderData>();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                                <ClipboardList className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {assessment.title}
                                </h1>
                                {assessment.description && (
                                    <p className="text-gray-600">{assessment.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información de intentos previos */}
                    {userAttempts.count > 0 && userAttempts.lastAttempt && (
                        <div className={`border-2 rounded-xl p-6 mb-6 ${userAttempts.lastAttempt.passed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-yellow-50 border-yellow-200'
                            }`}>
                            <div className="flex items-start space-x-3">
                                {userAttempts.lastAttempt.passed ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                                )}
                                <div>
                                    <h3 className={`font-semibold mb-1 ${userAttempts.lastAttempt.passed
                                            ? 'text-green-900'
                                            : 'text-yellow-900'
                                        }`}>
                                        {userAttempts.lastAttempt.passed
                                            ? '¡Evaluación Aprobada!'
                                            : 'Último Intento'}
                                    </h3>
                                    <p
                                        className={`text-sm ${
                                            userAttempts.lastAttempt?.passed
                                            ? 'text-green-700'
                                            : 'text-yellow-700'
                                        }`}
                                        >
                                        Calificación:{' '}
                                        {Number(userAttempts.lastAttempt?.score || 0).toFixed(2)} /{' '}
                                        {assessment.configuration.maxScore}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        Intentos realizados: {userAttempts.count} / {assessment.configuration.maxAttempts}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No puede realizar más intentos */}
                    {!userAttempts.canAttempt && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-red-900 mb-1">
                                        No hay intentos disponibles
                                    </h3>
                                    <p className="text-sm text-red-700">
                                        Has alcanzado el número máximo de intentos permitidos para esta evaluación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detalles de la evaluación */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Detalles de la Evaluación
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <FileQuestion className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total de preguntas</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {assessment.questionCount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {assessment.configuration.timeLimit && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Tiempo límite</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {assessment.configuration.timeLimit} minutos
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {assessment.configuration.isGradable && (
                                <>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-600">Puntaje máximo</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {assessment.configuration.maxScore}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {assessment.configuration.passingScore && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Nota mínima</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {assessment.configuration.passingScore}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Instrucciones */}
                        {assessment.instructions && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">
                                    📋 Instrucciones:
                                </h3>
                                <p className="text-blue-800 text-sm whitespace-pre-wrap">
                                    {assessment.instructions}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botón de inicio */}
                    <Form method="post">
                        <button
                            type="submit"
                            disabled={!userAttempts.canAttempt || isSubmitting || assessment.questionCount === 0}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
                        >
                            {isSubmitting
                                ? 'Iniciando...'
                                : assessment.questionCount === 0
                                    ? 'Sin preguntas disponibles'
                                    : userAttempts.canAttempt
                                        ? 'Comenzar Evaluación'
                                        : 'No Disponible'}
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}