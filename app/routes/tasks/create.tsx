import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from '@remix-run/react';
import React, { useState } from 'react'
import { BasicTaskInformation } from '~/components/tasks/BasicTaskInformation';
import { TaskConfiguration } from '~/components/tasks/Taskconfiguration';
import { CreateTaskHeader } from '~/components/tasks/CreateTaskHeader';
import { AlertCircle } from 'lucide-react';
import { FormActionTask } from '~/components/tasks/FormActionTask';

interface FormErrors {
    title?: string;
    description?: string;
    category?: string;
    thumbnailUrl?: string;
    file?: string;
    expirationDate?: string;
    maxAttachments?: string;
    supportDocument?: string;
    taskInfo?: string;
    general?: string;
}

type LoaderData = {
    courseId: string | null;
}

// Tipos para el formulario
interface TaskFormData {
    title: string;
    description: string;
    category: string;
    thumbnailUrl: string;
    isActive: boolean;
    isPinned: boolean;
    expirationDate: string;
    maxAttachments: number;
    isAutoGradable: boolean;
    taskInfo: string;
    tags: string[];
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
        const expirationDate = formData.get('expirationDate') as string;
        const maxAttachments = formData.get('maxAttachments') as string;
        const isAutoGradable = formData.get('isAutoGradable') === 'true';
        const taskInfo = formData.get('taskInfo') as string;

        // Validaciones básicas
        const errors: FormErrors = {};

        if (!title?.trim()) {
            errors.title = 'El título es obligatorio';
        }

        return json({ success: true });
    } catch (error: any) {
        console.error('Error al crear foro:', error);
        return json({
            errors: { general: error.message || 'Error al crear el foro' },
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
    
    // ✅ Usar navigation.state para saber si está enviando
    const isSubmitting = navigation.state === 'submitting';
    
    const [formData, setFormData] = useState<TaskFormData>({
        title: actionData?.fields?.title || '',
        description: actionData?.fields?.description || '',
        category: actionData?.fields?.category || '',
        thumbnailUrl: actionData?.fields?.thumbnailUrl || '',
        isActive: actionData?.fields?.isActive ?? true,
        isPinned: actionData?.fields?.isPinned ?? false,
        expirationDate: actionData?.fields?.expirationDate || '',
        maxAttachments: actionData?.fields?.maxAttachments || 1,
        isAutoGradable: actionData?.fields?.isAutoGradable ?? false,
        taskInfo: actionData?.fields?.taskInfo || '',
        tags: actionData?.fields?.tags || []
    });

    const handleBack = () => {
        if (courseId) {
            navigate(`/tasks/course/${courseId}`);
        } else {
            navigate("/tasks");
        }
    };

    const isValid = formData.title.trim().length > 0;
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
                        thumbnail={thumbnailFile}
                        onTitleChange={(value) => handleFormChange('title', value)}
                        onDescriptionChange={(value) => handleFormChange('description', value)}
                        onThumbnailChange={setThumbnailFile}
                        errors={errors}
                    />
                </div>

                {/* Configuración */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                    <TaskConfiguration
                        expirationDate={formData.expirationDate}
                        maxAttachments={formData.maxAttachments}
                        isAutoGradable={formData.isAutoGradable}
                        taskInfo={formData.taskInfo}
                        supportDocument={supportDocFile}
                        onExpirationDateChange={(value) => handleFormChange('expirationDate', value)}
                        onMaxAttachmentsChange={(value) => handleFormChange('maxAttachments', value)}
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
                        onChange={(e) => {
                        }}
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
                        onChange={(e) => {
                        }}
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
                <input type="hidden" name="expirationDate" value={formData.expirationDate} />
                <input type="hidden" name="maxAttachments" value={String(formData.maxAttachments)} />
                <input type="hidden" name="isAutoGradable" value={String(formData.isAutoGradable)} />
                <input type="hidden" name="taskInfo" value={formData.taskInfo} />
                <input type="hidden" name="isActive" value={String(formData.isActive)} />

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