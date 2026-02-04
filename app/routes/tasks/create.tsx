// routes/tasks/create.tsx
import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { Form, redirect, useActionData, useLoaderData, useNavigate, useNavigation } from '@remix-run/react';
import React, { useState } from 'react'
import { BasicTaskInformation } from '~/components/tasks/BasicTaskInformation';
import { TaskConfiguration } from '~/components/tasks/Taskconfiguration';
import { CreateTaskHeader } from '~/components/tasks/CreateTaskHeader';
import { AlertCircle } from 'lucide-react';
import { FormActionTask } from '~/components/tasks/FormActionTask';
import { createApiClientFromRequest } from '~/api/client';
import TaskAPI, { TaskStatus } from '~/api/endpoints/tasks';

interface FormErrors {
    title?: string;
    description?: string;
    instructions?: string;
    thumbnailUrl?: string;
    file?: string;
    startDate?: string;
    endDate?: string;
    lateSubmissionDate?: string;
    maxPoints?: string;
    lateSubmissionPenalty?: string;
    maxAttachments?: string;
    maxFileSize?: string;
    allowedFileTypes?: string;
    maxSubmissionAttempts?: string;
    supportDocument?: string;
    taskInfo?: string;
    status?: string;
    order?: string;
    general?: string;
}

type LoaderData = {
    courseId: string | null;
}

interface TaskFormData {
    title: string;
    description: string;
    instructions: string;
    thumbnailUrl: string;
    status: string;
    order: number;
    startDate: string;
    endDate: string;
    lateSubmissionDate: string;
    maxPoints: number;
    lateSubmissionPenalty: number;
    maxAttachments: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    allowMultipleSubmissions: boolean;
    maxSubmissionAttempts: number | null;
    requireSubmission: boolean;
    enablePeerReview: boolean;
    showGradeToStudent: boolean;
    showFeedbackToStudent: boolean;
    notifyOnSubmission: boolean;
    isAutoGradable: boolean;
    taskInfo: string;
}

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const urlParams = new URLSearchParams(url.search);
        const courseId = urlParams.get('course');

        if (courseId == null) {
            throw new Response("Error interno del servidor", {
                status: 500,
                statusText: "Internal Server Error"
            });
        }

        return json<LoaderData>({ courseId: courseId || null });

    } catch (error) {
        if (error instanceof Response) {
            throw error;
        }

        console.error("Error cargando datos:", error);
        throw new Response("Error interno del servidor", {
            status: 500,
            statusText: "Internal Server Error"
        });
    }
}


export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    try {
        const url = new URL(request.url);
        const urlParams = new URLSearchParams(url.search);
        const courseId = urlParams.get('course') ?? 'not_id';

        // Obtener datos del formulario
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const instructions = formData.get('instructions') as string;
        const status = formData.get('status') as TaskStatus ?? 'draft';
        const order = formData.get('order') as string;
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        const lateSubmissionDate = formData.get('lateSubmissionDate') as string;
        const maxPoints = formData.get('maxPoints') as string;
        const lateSubmissionPenalty = formData.get('lateSubmissionPenalty') as string;
        const maxAttachments = formData.get('maxAttachments') as string;
        const maxFileSize = formData.get('maxFileSize') as string;
        const allowedFileTypes = formData.get('allowedFileTypes') as string;
        const allowMultipleSubmissions = formData.get('allowMultipleSubmissions') === 'true';
        const maxSubmissionAttempts = formData.get('maxSubmissionAttempts') ?? '1' as string;
        const requireSubmission = formData.get('requireSubmission') === 'true';
        const enablePeerReview = formData.get('enablePeerReview') === 'true';
        const showGradeToStudent = formData.get('showGradeToStudent') === 'true';
        const showFeedbackToStudent = formData.get('showFeedbackToStudent') === 'true';
        const notifyOnSubmission = formData.get('notifyOnSubmission') === 'true';
        const isAutoGradable = formData.get('isAutoGradable') === 'true';
        const taskInfo = formData.get('taskInfo') as string;

        // Validaciones básicas
        const errors: FormErrors = {};

        if (!title?.trim()) {
            errors.title = 'El título es obligatorio';
        }

        if (!endDate) {
            errors.endDate = 'La fecha límite es obligatoria';
        }

        if (Object.keys(errors).length > 0) {
            return json({ errors, fields: Object.fromEntries(formData) }, { status: 400 });
        }

        const forumData = {
            courseId,
            title,
            description,
            instructions,
            status,
            order: Number(order),
            startDate,
            endDate,
            lateSubmissionDate,
            maxPoints: Number(maxPoints),
            lateSubmissionPenalty: Number(lateSubmissionPenalty),
            maxFileUploads: Number(maxAttachments),
            maxFileSize: Number(maxFileSize),
            allowedFileTypes: allowedFileTypes ? allowedFileTypes.split(',') : [],
            allowMultipleSubmissions,
            maxSubmissionAttempts: maxSubmissionAttempts ? Number(maxSubmissionAttempts) : null,
            requireSubmission,
            enablePeerReview,
            showGradeToStudent,
            showFeedbackToStudent,
            notifyOnSubmission,
            isAutoGradable,
            // taskInfo,
        }

        // Simular delay de creación
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        const authenticatedApiClient = createApiClientFromRequest(request);
        const response = await TaskAPI.create(forumData, authenticatedApiClient);
    
        if (response) {
            // Redireccionar según contexto
            if (courseId) {
            return redirect(`/tasks/courses/${courseId}?created=true`);
            } else {
            return redirect(`/tasks?created=true`);
            }
        } else {
            throw new Error('Error al crear la tarea');
        }
    } catch (error: any) {
        console.error('Error al crear tarea:', error);
        return json({
            errors: { general: error.message || 'Error al crear la tarea' },
            fields: Object.fromEntries(formData)
        }, { status: 500 });
    }
}

export default function CreateTask() {
    const { courseId } = useLoaderData<LoaderData>();
    const actionData = useActionData<{
        errors?: FormErrors;
        fields?: any;
    }>();
    const navigation = useNavigation();
    const navigate = useNavigate();

    const [showPreview, setShowPreview] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [supportDocFile, setSupportDocFile] = useState<File | null>(null);
    
    const isSubmitting = navigation.state === 'submitting';
    
    const [formData, setFormData] = useState<TaskFormData>({
        title: actionData?.fields?.title || '',
        description: actionData?.fields?.description || '',
        instructions: actionData?.fields?.instructions || '',
        thumbnailUrl: actionData?.fields?.thumbnailUrl || '',
        status: actionData?.fields?.status || 'draft',
        order: actionData?.fields?.order || 0,
        startDate: actionData?.fields?.startDate || '',
        endDate: actionData?.fields?.endDate || '',
        lateSubmissionDate: actionData?.fields?.lateSubmissionDate || '',
        maxPoints: actionData?.fields?.maxPoints || 100,
        lateSubmissionPenalty: actionData?.fields?.lateSubmissionPenalty || 0,
        maxAttachments: actionData?.fields?.maxAttachments || 5,
        maxFileSize: actionData?.fields?.maxFileSize || 10,
        allowedFileTypes: actionData?.fields?.allowedFileTypes?.split(',') || ['pdf', 'doc', 'docx'],
        allowMultipleSubmissions: actionData?.fields?.allowMultipleSubmissions ?? true,
        maxSubmissionAttempts: actionData?.fields?.maxSubmissionAttempts || null,
        requireSubmission: actionData?.fields?.requireSubmission ?? true,
        enablePeerReview: actionData?.fields?.enablePeerReview ?? false,
        showGradeToStudent: actionData?.fields?.showGradeToStudent ?? true,
        showFeedbackToStudent: actionData?.fields?.showFeedbackToStudent ?? true,
        notifyOnSubmission: actionData?.fields?.notifyOnSubmission ?? false,
        isAutoGradable: actionData?.fields?.isAutoGradable ?? false,
        taskInfo: actionData?.fields?.taskInfo || '',
    });

    const handleBack = () => {
        if (courseId) {
            navigate(`/tasks/courses/${courseId}`);
        } else {
            navigate("/tasks");
        }
    };

    const isValid = formData.title.trim().length > 0 && formData.endDate.trim().length > 0;
    const errors = actionData?.errors || {};

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className='max-w-6xl mx-auto space-y-8'>
            <CreateTaskHeader
                onBack={handleBack}
                onPreview={() => setShowPreview(true)}
                isValid={isValid}
            />

            <Form 
                id="task-form" 
                method="post" 
                encType="multipart/form-data" 
                className="space-y-8"
            >
                {/* Información Básica */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                    <BasicTaskInformation
                        title={formData.title}
                        description={formData.description}
                        instructions={formData.instructions}
                        thumbnail={thumbnailFile}
                        status={formData.status}
                        order={formData.order}
                        onTitleChange={(value) => handleFormChange('title', value)}
                        onDescriptionChange={(value) => handleFormChange('description', value)}
                        onInstructionsChange={(value) => handleFormChange('instructions', value)}
                        onThumbnailChange={setThumbnailFile}
                        onStatusChange={(value) => handleFormChange('status', value)}
                        onOrderChange={(value) => handleFormChange('order', value)}
                        errors={errors}
                    />
                </div>

                {/* Configuración */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                    <TaskConfiguration
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        lateSubmissionDate={formData.lateSubmissionDate}
                        maxPoints={formData.maxPoints}
                        lateSubmissionPenalty={formData.lateSubmissionPenalty}
                        maxAttachments={formData.maxAttachments}
                        maxFileSize={formData.maxFileSize}
                        allowedFileTypes={formData.allowedFileTypes}
                        allowMultipleSubmissions={formData.allowMultipleSubmissions}
                        maxSubmissionAttempts={formData.maxSubmissionAttempts}
                        requireSubmission={formData.requireSubmission}
                        enablePeerReview={formData.enablePeerReview}
                        showGradeToStudent={formData.showGradeToStudent}
                        showFeedbackToStudent={formData.showFeedbackToStudent}
                        notifyOnSubmission={formData.notifyOnSubmission}
                        isAutoGradable={formData.isAutoGradable}
                        taskInfo={formData.taskInfo}
                        supportDocument={supportDocFile}
                        onStartDateChange={(value) => handleFormChange('startDate', value)}
                        onEndDateChange={(value) => handleFormChange('endDate', value)}
                        onLateSubmissionDateChange={(value) => handleFormChange('lateSubmissionDate', value)}
                        onMaxPointsChange={(value) => handleFormChange('maxPoints', value)}
                        onLateSubmissionPenaltyChange={(value) => handleFormChange('lateSubmissionPenalty', value)}
                        onMaxAttachmentsChange={(value) => handleFormChange('maxAttachments', value)}
                        onMaxFileSizeChange={(value) => handleFormChange('maxFileSize', value)}
                        onAllowedFileTypesChange={(value) => handleFormChange('allowedFileTypes', value)}
                        onAllowMultipleSubmissionsChange={(value) => handleFormChange('allowMultipleSubmissions', value)}
                        onMaxSubmissionAttemptsChange={(value) => handleFormChange('maxSubmissionAttempts', value)}
                        onRequireSubmissionChange={(value) => handleFormChange('requireSubmission', value)}
                        onEnablePeerReviewChange={(value) => handleFormChange('enablePeerReview', value)}
                        onShowGradeToStudentChange={(value) => handleFormChange('showGradeToStudent', value)}
                        onShowFeedbackToStudentChange={(value) => handleFormChange('showFeedbackToStudent', value)}
                        onNotifyOnSubmissionChange={(value) => handleFormChange('notifyOnSubmission', value)}
                        onIsAutoGradableChange={(value) => handleFormChange('isAutoGradable', value)}
                        onTaskInfoChange={(value) => handleFormChange('taskInfo', value)}
                        onSupportDocumentChange={setSupportDocFile}
                        errors={errors}
                    />
                </div>

                {thumbnailFile && (
                    <input
                        type="file"
                        name="thumbnail"
                        className="sr-only"
                        onChange={(e) => {}}
                        ref={(input) => {
                            if (input && thumbnailFile) {
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(thumbnailFile);
                                input.files = dataTransfer.files;
                            }
                        }}
                    />
                )}

                {supportDocFile && (
                    <input
                        type="file"
                        name="supportDocument"
                        className="sr-only"
                        onChange={(e) => {}}
                        ref={(input) => {
                            if (input && supportDocFile) {
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(supportDocFile);
                                input.files = dataTransfer.files;
                            }
                        }}
                    />
                )}

                {/* Campos hidden */}
                <input type="hidden" name="title" value={formData.title} />
                <input type="hidden" name="description" value={formData.description} />
                <input type="hidden" name="instructions" value={formData.instructions} />
                <input type="hidden" name="status" value={formData.status} />
                <input type="hidden" name="order" value={String(formData.order)} />
                <input type="hidden" name="startDate" value={formData.startDate} />
                <input type="hidden" name="endDate" value={formData.endDate} />
                <input type="hidden" name="lateSubmissionDate" value={formData.lateSubmissionDate} />
                <input type="hidden" name="maxPoints" value={String(formData.maxPoints)} />
                <input type="hidden" name="lateSubmissionPenalty" value={String(formData.lateSubmissionPenalty)} />
                <input type="hidden" name="maxAttachments" value={String(formData.maxAttachments)} />
                <input type="hidden" name="maxFileSize" value={String(formData.maxFileSize)} />
                <input type="hidden" name="allowedFileTypes" value={formData.allowedFileTypes.join(',')} />
                <input type="hidden" name="allowMultipleSubmissions" value={String(formData.allowMultipleSubmissions)} />
                <input type="hidden" name="maxSubmissionAttempts" value={String(formData.maxSubmissionAttempts ?? 0)} />
                <input type="hidden" name="requireSubmission" value={String(formData.requireSubmission)} />
                <input type="hidden" name="enablePeerReview" value={String(formData.enablePeerReview)} />
                <input type="hidden" name="showGradeToStudent" value={String(formData.showGradeToStudent)} />
                <input type="hidden" name="showFeedbackToStudent" value={String(formData.showFeedbackToStudent)} />
                <input type="hidden" name="notifyOnSubmission" value={String(formData.notifyOnSubmission)} />
                <input type="hidden" name="isAutoGradable" value={String(formData.isAutoGradable)} />
                {/* <input type="hidden" name="taskInfo" value={formData.taskInfo} />  */}

                <FormActionTask
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                />
            </Form>

            {/* Mensajes de error y éxito */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Error: {errors.general}</span>
                    </div>
                </div>
            )}

            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('created') === 'true' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-green-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">¡Tarea creada exitosamente!</span>
                    </div>
                </div>
            )}
        </div>
    )
}