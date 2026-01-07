// app/routes/assessments/$id.edit.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { AlertCircle, Trash2, ClipboardList } from 'lucide-react';
import AssessmentForm from '../../components/assessments/AssessmentForm';
import { createApiClientFromRequest } from '~/api/client';
import { CoursesAPI } from '~/api/endpoints/courses';
import { CourseBasic, CourseFromAPI } from '~/api/types/course.types';

interface Assessment {
    id: string;
    slug: string;
    type: string;
    status: string;
    isActive: boolean;
    order: number;
    courseId: string;
    tenantId: string;
    created_at: string;
    updated_at: string;
    translations: Array<{
        languageCode: string;
        title: string;
        description: string;
        instructions: string;
        welcomeMessage: string;
        completionMessage: string;
    }>;
    configuration: {
        isGradable: boolean;
        gradingMethod: string;
        passingScore: number | null;
        maxScore: number;
        timeLimit: number | null;
        strictTimeLimit: boolean;
        maxAttempts: number;
        allowReview: boolean;
        showCorrectAnswers: boolean;
        showScoreImmediately: boolean;
        randomizeOptions: boolean;
        oneQuestionPerPage: boolean;
    };
}

interface LoaderData {
    assessment: Assessment | null;
    error: string | null;
    availableCourses: CourseBasic[];
}

interface ActionData {
    errors?: Array<{ field: string; message: string }>;
    generalError?: string;
    success?: boolean;
}

function processCourseTranslations(
    courses: CourseFromAPI[],
    preferredLanguage: string = 'es'
): CourseBasic[] {
    return courses.map(course => {
        let selectedTranslation = course.translations.find(
            t => t.languageCode === preferredLanguage
        );

        if (!selectedTranslation && course.translations.length > 0) {
            selectedTranslation = course.translations[0];
        }

        if (!selectedTranslation) {
            selectedTranslation = {
                id: '',
                courseId: course.id,
                languageCode: preferredLanguage,
                title: 'Sin título',
                description: 'Sin descripción',
                metadata: {},
                createdAt: course.created_at,
                updatedAt: course.updated_at
            };
        }

        return {
            id: course.id,
            slug: course.slug,
            title: selectedTranslation.title,
            description: selectedTranslation.description,
            isActive: course.isActive,
            tenantId: course.tenantId,
            created_at: course.created_at,
            updated_at: course.updated_at,
            languageCode: selectedTranslation.languageCode,
            allTranslations: course.translations
        };
    });
}

// Función de validación (la misma que en create)
function validateAssessmentForm(formData: FormData): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>
} {
    const errors: Array<{ field: string; message: string }> = [];

    const title = formData.get('title') as string;
    if (!title || title.trim() === '') {
        errors.push({ field: 'title', message: 'El título es requerido' });
    }

    const slug = formData.get('slug') as string;
    if (!slug || slug.trim() === '') {
        errors.push({ field: 'slug', message: 'El slug es requerido' });
    }

    const courseId = formData.get('courseId') as string;
    if (!courseId || courseId.trim() === '') {
        errors.push({ field: 'courseId', message: 'Debe seleccionar un curso' });
    }

    const isGradable = formData.get('isGradable') === 'true';
    if (isGradable) {
        const maxScore = parseFloat(formData.get('maxScore') as string);
        if (isNaN(maxScore) || maxScore <= 0) {
            errors.push({ field: 'maxScore', message: 'El puntaje máximo debe ser mayor a 0' });
        }

        const passingScore = formData.get('passingScore') as string;
        if (passingScore) {
            const passingScoreNum = parseFloat(passingScore);
            if (isNaN(passingScoreNum) || passingScoreNum < 0 || passingScoreNum > maxScore) {
                errors.push({ field: 'passingScore', message: 'La nota mínima debe estar entre 0 y el puntaje máximo' });
            }
        }
    }

    const maxAttempts = parseInt(formData.get('maxAttempts') as string);
    if (isNaN(maxAttempts) || maxAttempts < 1) {
        errors.push({ field: 'maxAttempts', message: 'Debe permitir al menos 1 intento' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export const loader: LoaderFunction = async ({ params, request }) => {
    try {
        const assessmentId = params.id as string;

        if (!assessmentId) {
            throw new Error('ID de evaluación no proporcionado');
        }

        const requestApiClient = createApiClientFromRequest(request);

        // Aquí deberías llamar a tu API para obtener el assessment
        // const assessment = await AssessmentAPI.getById(assessmentId, requestApiClient);

        // Por ahora simulamos datos
        const mockAssessment: Assessment = {
            id: assessmentId,
            slug: 'evaluacion-ejemplo',
            type: 'evaluation',
            status: 'draft',
            isActive: true,
            order: 0,
            courseId: '',
            tenantId: 'tenant-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            translations: [
                {
                    languageCode: 'es',
                    title: 'Evaluación de Ejemplo',
                    description: 'Esta es una evaluación de ejemplo',
                    instructions: 'Lee cuidadosamente cada pregunta',
                    welcomeMessage: 'Bienvenido a esta evaluación',
                    completionMessage: 'Has completado la evaluación'
                }
            ],
            configuration: {
                isGradable: true,
                gradingMethod: 'automatic',
                passingScore: 70,
                maxScore: 100,
                timeLimit: 60,
                strictTimeLimit: false,
                maxAttempts: 3,
                allowReview: true,
                showCorrectAnswers: false,
                showScoreImmediately: true,
                randomizeOptions: false,
                oneQuestionPerPage: false
            }
        };

        // Obtener cursos disponibles
        const coursesResult = await CoursesAPI.getByTenant(requestApiClient);
        let availableCourses: CourseBasic[] = [];

        if (coursesResult && !('error' in coursesResult)) {
            if (Array.isArray(coursesResult)) {
                availableCourses = processCourseTranslations(coursesResult, 'es');
            }
        }

        return json<LoaderData>({
            assessment: mockAssessment,
            error: null,
            availableCourses
        });
    } catch (error: any) {
        console.error('Error loading assessment for edit:', error);
        return json<LoaderData>({
            assessment: null,
            error: error.message || 'Error al cargar la evaluación',
            availableCourses: []
        });
    }
};

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const assessmentId = params.id as string;
    const intent = formData.get('intent') as string;

    try {
        switch (intent) {
            case 'update':
                const validation = validateAssessmentForm(formData);

                if (!validation.isValid) {
                    return json<ActionData>({
                        errors: validation.errors
                    }, { status: 400 });
                }

                const requestApiClient = createApiClientFromRequest(request);

                // Preparar datos del assessment
                const assessmentData = {
                    slug: formData.get('slug') as string,
                    type: formData.get('type') as string,
                    status: formData.get('status') as string,
                    isActive: formData.get('isActive') === 'true',
                    order: parseInt(formData.get('order') as string) || 0,
                    courseId: formData.get('courseId') as string,
                    // Traducción
                    translation: {
                        languageCode: 'es',
                        title: formData.get('title') as string,
                        description: formData.get('description') as string || '',
                        instructions: formData.get('instructions') as string || '',
                        welcomeMessage: formData.get('welcomeMessage') as string || '',
                        completionMessage: formData.get('completionMessage') as string || '',
                    },
                    // Configuración
                    configuration: {
                        isGradable: formData.get('isGradable') === 'true',
                        gradingMethod: formData.get('gradingMethod') as string,
                        passingScore: formData.get('passingScore') ? parseFloat(formData.get('passingScore') as string) : null,
                        maxScore: parseFloat(formData.get('maxScore') as string),
                        timeLimit: formData.get('timeLimit') ? parseInt(formData.get('timeLimit') as string) : null,
                        strictTimeLimit: formData.get('strictTimeLimit') === 'true',
                        maxAttempts: parseInt(formData.get('maxAttempts') as string),
                        allowReview: formData.get('allowReview') === 'true',
                        showCorrectAnswers: formData.get('showCorrectAnswers') === 'true',
                        showScoreImmediately: formData.get('showScoreImmediately') === 'true',
                        randomizeOptions: formData.get('randomizeOptions') === 'true',
                        oneQuestionPerPage: formData.get('oneQuestionPerPage') === 'true',
                    }
                };

                // Aquí deberías llamar a tu API para actualizar el assessment
                // const result = await AssessmentAPI.update(assessmentId, assessmentData, requestApiClient);

                console.log('Assessment data to update:', assessmentData);

                return redirect(`/assessments?updated=true`);

            case 'delete':
                console.log('Eliminar evaluación:', assessmentId);
                // Aquí deberías llamar a tu API para eliminar
                // await AssessmentAPI.delete(assessmentId, requestApiClient);
                return redirect('/assessments?deleted=true');

            default:
                return json<ActionData>({
                    generalError: 'Acción no válida'
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Error in action:', error);

        return json<ActionData>({
            generalError: error.message || 'Error interno del servidor'
        }, { status: 500 });
    }
};

export default function EditAssessment() {
    const { assessment, error, availableCourses } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const navigate = useNavigate();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const isSubmitting = navigation.state === 'submitting';
    const errors = actionData?.errors || [];

    useEffect(() => {
        if (actionData?.success) {
            const timer = setTimeout(() => { }, 3000);
            return () => clearTimeout(timer);
        }
    }, [actionData?.success]);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md w-full">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la evaluación</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/assessments')}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Volver a Evaluaciones
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-center text-gray-600 mt-4">Cargando evaluación...</p>
                </div>
            </div>
        );
    }

    const handleCancel = () => {
        if (hasChanges) {
            if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
                navigate('/assessments');
            }
        } else {
            navigate('/assessments');
        }
    };

    // Preparar datos iniciales para el formulario
    const initialData = {
        slug: assessment.slug,
        type: assessment.type as 'evaluation' | 'survey' | 'self_assessment',
        status: assessment.status as 'draft' | 'published' | 'archived' | 'suspended',
        isActive: assessment.isActive,
        order: assessment.order,
        courseId: assessment.courseId,
        title: assessment.translations[0]?.title || '',
        description: assessment.translations[0]?.description || '',
        instructions: assessment.translations[0]?.instructions || '',
        welcomeMessage: assessment.translations[0]?.welcomeMessage || '',
        completionMessage: assessment.translations[0]?.completionMessage || '',
        isGradable: assessment.configuration.isGradable,
        gradingMethod: assessment.configuration.gradingMethod as 'automatic' | 'manual' | 'hybrid',
        passingScore: assessment.configuration.passingScore,
        maxScore: assessment.configuration.maxScore,
        timeLimit: assessment.configuration.timeLimit,
        strictTimeLimit: assessment.configuration.strictTimeLimit,
        maxAttempts: assessment.configuration.maxAttempts,
        allowReview: assessment.configuration.allowReview,
        showCorrectAnswers: assessment.configuration.showCorrectAnswers,
        showScoreImmediately: assessment.configuration.showScoreImmediately,
        randomizeOptions: assessment.configuration.randomizeOptions,
        oneQuestionPerPage: assessment.configuration.oneQuestionPerPage,
    };

    return (
        <div className="container mx-auto px-4">

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                            <ClipboardList className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editar Evaluación</h1>
                            <p className="text-gray-600">{assessment.translations[0]?.title || assessment.slug} • /{assessment.slug}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar evaluación"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Error general */}
            {actionData?.generalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                        <p className="text-red-800">{actionData.generalError}</p>
                    </div>
                </div>
            )}

            {/* Formulario */}
            <AssessmentForm
                initialData={initialData}
                errors={errors}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                submitLabel="Guardar Cambios"
                availableCourses={availableCourses}
            />

            {/* Modal de confirmación de eliminación */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                ¿Eliminar evaluación?
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Esta acción no se puede deshacer. La evaluación "{assessment.translations[0]?.title}"
                                y todas sus preguntas serán eliminadas permanentemente.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <form method="post" className="flex-1">
                                    <input type="hidden" name="intent" value="delete" />
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje de éxito */}
            {actionData?.success && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
                    Evaluación actualizada con éxito
                </div>
            )}
        </div>
    );
}