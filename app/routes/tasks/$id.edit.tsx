// routes/tasks/$id.edit.tsx
import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from '@remix-run/react';
import React, { useState } from 'react'
import { createApiClientFromRequest } from '~/api/client';
import TaskAPI from '~/api/endpoints/tasks';
import { BasicTaskInformation } from '~/components/tasks/BasicTaskInformation';
import { TaskConfiguration } from '~/components/tasks/Taskconfiguration';
import { UpateTaskHeader } from '~/components/tasks/UpdateTaskHeader';
import { AlertCircle } from 'lucide-react';
import { FormActionTask } from '~/components/tasks/FormActionTask';
import { TaskStatus, UpdateTaskPayload } from '~/api/types/task.types';
import { toDateTimeLocal } from '~/utils/date';

type LoaderData = {
    courseId: string | null;
    task: any;
}

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

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const url = new URL(request.url);
        const urlParams = new URLSearchParams(url.search);
        const courseId = urlParams.get('course');
        const { id } = params;

        console.log('PARAMS EN EDIT TASK:', params);

        if (!id) {
            throw new Response("ID de la tarea no proporcionado", { 
                status: 400,
                statusText: "Bad Request"
            });
        }

        if (courseId == null) {
            throw new Response("Error interno del servidor", {
                status: 500,
                statusText: "Internal Server Error"
            });
        }

        const authenticatedApiClient = createApiClientFromRequest(request);
        const response = await TaskAPI.getById(id, authenticatedApiClient);
        console.log('RESPONSE EN EDIT TASK:', response);

        if(!response.success || !response.data){
            throw new Response("Tarea no encontrada", {
                status: 404,
                statusText: "Not Found"
            });
        }

        return json<LoaderData>({ 
            courseId: courseId || null,
            task: response.data
        });

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

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const { id } = params;

    try {
        if (!id) {
            throw new Response("ID de la tarea no proporcionado", { 
                status: 400,
                statusText: "Bad Request"
            });
        }

        const url = new URL(request.url);
        const urlParams = new URLSearchParams(url.search);
        const courseId = urlParams.get('course') ?? 'not_id';

        // Obtener datos del formulario
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const instructions = formData.get('instructions') as string;
        const status = formData.get('status') as string;
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
        const maxSubmissionAttempts = formData.get('maxSubmissionAttempts') as string;
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

        // Validar status
        const validStatuses = ['draft', 'published', 'closed', 'archived'];
        if (status && !validStatuses.includes(status)) {
            errors.status = 'Estado inválido';
        }

        if (Object.keys(errors).length > 0) {
            return json({ errors, fields: Object.fromEntries(formData) }, { status: 400 });
        }

        // Preparar datos para actualizar
        const authenticatedApiClient = createApiClientFromRequest(request);
        
        const updateData: UpdateTaskPayload = {
            title: title,
            description: description,
            instructions: instructions,
            status: status as TaskStatus,
            order: Number(order),
            startDate: startDate || Date.now().toString(),
            endDate,
            lateSubmissionDate: lateSubmissionDate || Date.now().toString(),
            maxPoints: Number(maxPoints),
            lateSubmissionPenalty: Number(lateSubmissionPenalty),
            maxFileUploads: Number(maxAttachments), // Nota: maxAttachments -> maxFileUploads
            maxFileSize: Number(maxFileSize),
            allowedFileTypes: allowedFileTypes ? allowedFileTypes.split(',') : [],
            allowMultipleSubmissions,
            maxSubmissionAttempts: maxSubmissionAttempts === '0' ? null : Number(maxSubmissionAttempts),
            requireSubmission,
            enablePeerReview,
            showGradeToStudent,
            showFeedbackToStudent,
            notifyOnSubmission,
        };

        await TaskAPI.update(id, updateData, authenticatedApiClient);

        return json({ success: true });
    } catch (error: any) {
        console.error('Error al actualizar tarea:', error);
        return json({
            errors: { general: error.message || 'Error al actualizar la tarea' },
            fields: Object.fromEntries(formData)
        }, { status: 500 });
    }
}


export default function EditCourseTask() {
    const { courseId, task } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const navigation = useNavigation();

    const actionData = useActionData<{
        errors?: FormErrors;
        fields?: any;
    }>();

    const isSubmitting = navigation.state === 'submitting';
    
    // Estado principal del formulario
    const [formData, setFormData] = useState<TaskFormData>({
        title: actionData?.fields?.title || task?.title || '',
        description: actionData?.fields?.description || task?.description || '',
        instructions: actionData?.fields?.instructions || task?.instructions || '',
        thumbnailUrl: actionData?.fields?.thumbnailUrl || task?.thumbnailUrl || '',
        status: actionData?.fields?.status || task?.status || 'draft',
        order: actionData?.fields?.order || task?.order || 0,
        startDate: toDateTimeLocal(actionData?.fields?.startDate || task?.startDate),
        endDate: toDateTimeLocal(actionData?.fields?.endDate || task?.endDate),
        lateSubmissionDate: toDateTimeLocal(actionData?.fields?.lateSubmissionDate || task?.lateSubmissionDate),
        maxPoints: actionData?.fields?.maxPoints || task?.maxPoints || 100,
        lateSubmissionPenalty: actionData?.fields?.lateSubmissionPenalty || task?.lateSubmissionPenalty || 0,
        maxAttachments: actionData?.fields?.maxAttachments || task?.maxAttachments || 5,
        maxFileSize: actionData?.fields?.maxFileSize || task?.maxFileSize || 10,
        allowedFileTypes: actionData?.fields?.allowedFileTypes?.split(',') || task?.allowedFileTypes || ['pdf', 'doc', 'docx'],
        allowMultipleSubmissions: actionData?.fields?.allowMultipleSubmissions ?? task?.allowMultipleSubmissions ?? true,
        maxSubmissionAttempts: actionData?.fields?.maxSubmissionAttempts || task?.maxSubmissionAttempts || null,
        requireSubmission: actionData?.fields?.requireSubmission ?? task?.requireSubmission ?? true,
        enablePeerReview: actionData?.fields?.enablePeerReview ?? task?.enablePeerReview ?? false,
        showGradeToStudent: actionData?.fields?.showGradeToStudent ?? task?.showGradeToStudent ?? true,
        showFeedbackToStudent: actionData?.fields?.showFeedbackToStudent ?? task?.showFeedbackToStudent ?? true,
        notifyOnSubmission: actionData?.fields?.notifyOnSubmission ?? task?.notifyOnSubmission ?? false,
        isAutoGradable: actionData?.fields?.isAutoGradable ?? task?.isAutoGradable ?? false,
        taskInfo: actionData?.fields?.taskInfo || task?.taskInfo || '',
    });

    // Estados para archivos
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [supportDocFile, setSupportDocFile] = useState<File | null>(null);

    // Función para actualizar el formulario
    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBack = () => {
        if (courseId) {
            navigate(`/tasks/courses/${courseId}`);
        } else {
            navigate("/tasks");
        }
    };

    const isValid = formData.title.trim().length > 0 && formData.endDate.trim().length > 0;
    const errors = actionData?.errors || {};

    return (
        <div className='max-w-6xl mx-auto space-y-8'>
            <UpateTaskHeader
                onBack={handleBack}
                isValid={isValid}
            />

            <Form 
                id="task-form" 
                method="post" 
                encType="multipart/form-data" 
                className="space-y-8"
            >
                {/* Información Básica */}
                <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8'>
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
                <input type="hidden" name="taskInfo" value={formData.taskInfo} />

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
            {/* 
            {actionData?.success && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-green-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">¡Tarea actualizada exitosamente!</span>
                    </div>
                </div>
            )} */}
        </div>
    )
}