
// app/routes/modules/create.tsx

import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

// Importar componentes
import { CreateModuleHeader } from "~/components/modules/CreateModuleHeader";
import { BasicModuleInformation } from "~/components/modules/BasicModuleInformation";
import { ModuleConfiguration } from "~/components/modules/ModuleConfiguration";
import { ModuleItemsManager } from "~/components/modules/ModuleItemsManager";
import { ModulePreview } from "~/components/modules/ModulePreview";
import { FormActions } from "~/components/modules/FormActions";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { ModuleAPI } from "~/api/endpoints/modules";
import { ContentAPI } from "~/api/endpoints/contents";
import { CourseBasic } from "~/api/types/course.types";
import { ContentItem } from "~/api/types/content.types";

// Tipos para el formulario
export interface ModuleItemData {
    id?: string;
    type: 'content' | 'forum' | 'task' | 'quiz' | 'survey' | 'activity';
    referenceId: string;
    order: number;
    title?: string; // Para mostrar en la UI
}

interface ModuleFormData {
    title: string;
    description: string;
    thumbnailImagePath: string;
    isActive: boolean;
    order: number;
    approvalPercentage: number;
    metadata: Record<string, any>;
    items: ModuleItemData[];
}

interface FormErrors {
    title?: string;
    description?: string;
    order?: string;
    approvalPercentage?: string;
    items?: string;
    general?: string;
}

type LoaderData = {
    course: CourseBasic;
    availableContents: ContentItem[];
    moduleCount: number;
};

// Loader para cargar datos iniciales
export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const { courseId } = params;

        if (!courseId) {
            throw new Response("ID de curso no proporcionado", {
                status: 400,
                statusText: "Bad Request"
            });
        }

        const requestApiClient = createApiClientFromRequest(request);

        // Cargar información del curso
        const courseResult = await CoursesAPI.getById(courseId, requestApiClient);
        if (!courseResult) {
            throw new Response("Curso no encontrado", {
                status: 404,
                statusText: "Not Found"
            });
        }

        // Cargar contenidos disponibles del tenant
        // const contentsResult = await ContentAPI.getByTenant(requestApiClient);

        // Obtener cantidad de módulos existentes para el orden predeterminado
        const modulesResult = await ModuleAPI.getByCourse(courseId, requestApiClient);
        const moduleCount = modulesResult?.length || 0;

        return json<LoaderData>({
            course: courseResult,
            //   availableContents: contentsResult || [],
            moduleCount
        });

    } catch (error: any) {
        if (error instanceof Response) {
            throw error;
        }

        console.error("Error cargando datos para crear módulo:", error);
        // throw new Response("Error interno del servidor", { 
        //   status: 500,
        //   statusText: "Internal Server Error"
        // });

        return json({
            course: null,
            error: error.message
        });
    }
};

// Action para procesar el formulario
export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const { courseId } = params;

    try {
        if (!courseId) {
            throw new Error("ID de curso requerido");
        }

        // Obtener datos del formulario
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const thumbnailImagePath = formData.get('thumbnailImagePath') as string;
        const isActive = formData.get('isActive') === 'true';
        const order = parseInt(formData.get('order') as string);
        const approvalPercentage = parseInt(formData.get('approvalPercentage') as string);
        const metadata = JSON.parse((formData.get('metadata') as string) || '{}');
        const items = JSON.parse((formData.get('items') as string) || '[]') as ModuleItemData[];
        const thumbnailFile = formData.get('thumbnailFile') as File | null;

        // Validaciones básicas
        const errors: FormErrors = {};

        if (!title?.trim()) {
            errors.title = 'El título es obligatorio';
        }

        if (order < 0) {
            errors.order = 'El orden debe ser un número positivo';
        }

        if (approvalPercentage < 0 || approvalPercentage > 100) {
            errors.approvalPercentage = 'El porcentaje debe estar entre 0 y 100';
        }

        // Si hay errores, devolver errores
        if (Object.keys(errors).length > 0) {
            return json({
                errors,
                fields: { title, description, thumbnailImagePath, isActive, order, approvalPercentage, metadata, items }
            }, { status: 400 });
        }

        // Procesar archivo de thumbnail si existe
        let finalThumbnailPath = thumbnailImagePath;
        if (thumbnailFile && thumbnailFile.size > 0) {
            console.log(`Procesando imagen: ${thumbnailFile.name} (${thumbnailFile.size} bytes)`);
            // Aquí se subiría el archivo al servidor/storage
            // finalThumbnailPath = await uploadThumbnail(thumbnailFile);
            finalThumbnailPath = `uploaded-thumbnails/${thumbnailFile.name}`;
        }

        // Preparar datos del módulo
        const moduleData = {
            courseId,
            title: title.trim(),
            description: description?.trim(),
            thumbnailImagePath: finalThumbnailPath,
            configuration: {
                isActive,
                order,
                approvalPercentage,
                metadata
            },
            items: items.map((item, index) => ({
                type: item.type,
                referenceId: item.referenceId,
                order: item.order || index
            }))
        };

        const authenticatedApiClient = createApiClientFromRequest(request);
        const response = await ModuleAPI.create(moduleData, authenticatedApiClient);

        if (response.success) {
            // Redireccionar a la vista del curso con sus módulos
            return redirect(`/courses/${courseId}/modules?created=${response.data.id}`);
        } else {
            throw new Error(response.message || 'Error desconocido');
        }

    } catch (error: any) {
        console.error('Error al crear módulo:', error);
        return json({
            errors: { general: error.message || 'Error al crear el módulo' },
            fields: Object.fromEntries(formData)
        }, { status: 500 });
    }
};

// Componente principal
export default function CreateModule() {
    const { course, availableContents, moduleCount } = useLoaderData<LoaderData>();
    const actionData = useActionData<{
        errors?: FormErrors;
        fields?: any;
    }>();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const { courseId } = useParams();

    const [showPreview, setShowPreview] = useState(false);
    const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<ModuleFormData>({
        title: actionData?.fields?.title || '',
        description: actionData?.fields?.description || '',
        thumbnailImagePath: actionData?.fields?.thumbnailImagePath || '',
        isActive: actionData?.fields?.isActive ?? true,
        order: actionData?.fields?.order ?? (moduleCount + 1),
        approvalPercentage: actionData?.fields?.approvalPercentage ?? 80,
        metadata: actionData?.fields?.metadata || {},
        items: actionData?.fields?.items || []
    });

    const isSubmitting = navigation.state === 'submitting';
    const errors = actionData?.errors || {};

    // Validación del formulario
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }

        if (formData.order < 0) {
            newErrors.order = 'El orden debe ser un número positivo';
        }

        if (formData.approvalPercentage < 0 || formData.approvalPercentage > 100) {
            newErrors.approvalPercentage = 'El porcentaje debe estar entre 0 y 100';
        }

        return Object.keys(newErrors).length === 0;
    };

    // Determinar si el formulario es válido
    const isValid = formData.title.trim().length > 0 &&
        formData.order >= 0 &&
        formData.approvalPercentage >= 0 &&
        formData.approvalPercentage <= 100;

    // Manejar cambios en el formulario
    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Manejar envío del formulario
    const handleSubmit = () => {
        if (validateForm()) {
            const form = document.getElementById('module-form') as HTMLFormElement;
            if (form) {
                // Agregar archivo de thumbnail si existe
                if (selectedThumbnailFile) {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.name = 'thumbnailFile';
                    fileInput.style.display = 'none';
                    form.appendChild(fileInput);

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(selectedThumbnailFile);
                    fileInput.files = dataTransfer.files;
                }

                form.submit();
            }
        }
    };

    // Función onBack
    const handleBack = () => {
        navigate(`/courses/${courseId}/modules`);
    };


    // if (error) {
    //     return (
    //         <div className="text-center py-16">
    //             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/60 max-w-md mx-auto hover:shadow-2xl transition-all duration-300">
    //                 <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
    //                 <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
    //                 <p className="text-gray-600">{error}</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <CreateModuleHeader
                course={course}
                onBack={handleBack}
                onPreview={() => setShowPreview(true)}
                isValid={!!isValid}
            />

            <Form id="module-form" method="post" encType="multipart/form-data" className="space-y-8">
                {/* Información Básica */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                    <BasicModuleInformation
                        formData={formData}
                        onFormChange={handleFormChange}
                        onThumbnailFileChange={setSelectedThumbnailFile}
                        selectedThumbnailFile={selectedThumbnailFile}
                        errors={errors}
                    />
                </div>

                {/* Configuración del Módulo */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                    <ModuleConfiguration
                        formData={formData}
                        onFormChange={handleFormChange}
                        errors={errors}
                    />
                </div>

                {/* Gestor de Items del Módulo */}
                {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <ModuleItemsManager
            items={formData.items}
            availableContents={availableContents}
            onItemsChange={(items) => handleFormChange('items', items)}
            error={errors.items}
          />
        </div> */}

                {/* Acciones del Formulario */}
                <FormActions
                    onSave={handleSubmit}
                    isSubmitting={isSubmitting}
                    isValid={!!isValid}
                />

                {/* Campos ocultos para el formulario */}
                <input type="hidden" name="title" value={formData.title} />
                <input type="hidden" name="description" value={formData.description} />
                <input type="hidden" name="thumbnailImagePath" value={formData.thumbnailImagePath} />
                <input type="hidden" name="isActive" value={formData.isActive.toString()} />
                <input type="hidden" name="order" value={formData.order.toString()} />
                <input type="hidden" name="approvalPercentage" value={formData.approvalPercentage.toString()} />
                <input type="hidden" name="metadata" value={JSON.stringify(formData.metadata)} />
                <input type="hidden" name="items" value={JSON.stringify(formData.items)} />
            </Form>

            {/* Modal de Vista Previa */}
            {/* {showPreview && (
        <ModulePreview
          formData={formData}
          course={course}
          availableContents={availableContents}
          selectedThumbnailFile={selectedThumbnailFile}
          onClose={() => setShowPreview(false)}
        />
      )} */}

            {/* Error general */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Error: {errors.general}</span>
                    </div>
                </div>
            )}

            {/* Mensaje de éxito (si viene de query params) */}
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('created') && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-green-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">¡Módulo creado exitosamente!</span>
                    </div>
                </div>
            )}
        </div>
    );
}