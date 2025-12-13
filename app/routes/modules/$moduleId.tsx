// app/routes/modules/$moduleId/edit.tsx

import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useNavigate, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { AlertCircle, Save, X, Layers, BookOpen, ArrowLeft } from "lucide-react";

// Importar componentes
import { BasicModuleInformation } from "~/components/modules/BasicModuleInformation";
import { ModuleConfiguration } from "~/components/modules/ModuleConfiguration";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { ModuleAPI } from "~/api/endpoints/modules";
import { CourseBasic } from "~/api/types/course.types";

// Tipos para el formulario
export interface ModuleItemData {
    id?: string;
    type: 'content' | 'forum' | 'task' | 'quiz' | 'survey' | 'activity';
    referenceId: string;
    order: number;
    title?: string;
}

export interface ModuleFormData {
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
    module: any;
    course: CourseBasic;
};

// Loader para cargar datos del módulo existente
export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const { moduleId } = params;

        if (!moduleId) {
            throw new Response("ID de módulo no proporcionado", {
                status: 400,
                statusText: "Bad Request"
            });
        }

        const requestApiClient = createApiClientFromRequest(request);

        const includes = {
            includeCourse: true,
            includeModule: true,
            includeNavigation: true,
        }

        // Cargar información del módulo
        const moduleResult = await ModuleAPI.getById(moduleId, includes, requestApiClient);
        if (!moduleResult) {
            throw new Response("Módulo no encontrado", {
                status: 404,
                statusText: "Not Found"
            });
        }

        console.log("Module loaded in edit:", moduleResult);

        // Cargar información del curso
        const courseResult = await CoursesAPI.getById(moduleResult.data.courseId, requestApiClient);
        if (!courseResult) {
            throw new Response("Curso no encontrado", {
                status: 404,
                statusText: "Not Found"
            });
        }

        console.log("Course loaded in edit:", courseResult);

        return json<LoaderData>({
            module: moduleResult.data,
            course: courseResult
        });

    } catch (error: any) {
        if (error instanceof Response) {
            throw error;
        }

        console.error("Error cargando datos del módulo:", error);
        return json({
            module: null,
            course: null,
            error: error.message
        }, { status: 500 });
    }
};

// Action para procesar la actualización
export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const { moduleId } = params;

    try {
        if (!moduleId) {
            throw new Error("ID de módulo requerido");
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
        const courseId = formData.get('courseId') as string;

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
            finalThumbnailPath = `uploaded-thumbnails/${thumbnailFile.name}`;
        }

        // Preparar datos del módulo
        const moduleData = {
            title: title.trim(),
            description: description?.trim(),
            thumbnailImagePath: finalThumbnailPath,
            configuration: {
                isActive,
                order,
                approvalPercentage,
                metadata
            },
        };

        const authenticatedApiClient = createApiClientFromRequest(request);
        const response = await ModuleAPI.update(moduleId, moduleData, authenticatedApiClient);

        if (response.success) {
            return redirect(`/modules/course/${courseId}?updated=${moduleId}`);
        } else {
            throw new Error(response.message || 'Error desconocido');
        }

    } catch (error: any) {
        console.error('Error al actualizar módulo:', error);
        return json({
            errors: { general: error.message || 'Error al actualizar el módulo' },
            fields: Object.fromEntries(formData)
        }, { status: 500 });
    }
};

// Componente principal
export default function EditModule() {
    const { module, course } = useLoaderData<LoaderData>();
    const actionData = useActionData<{
        errors?: FormErrors;
        fields?: any;
    }>();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const { moduleId } = useParams();

    const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [formData, setFormData] = useState<ModuleFormData>({
        title: '',
        description: '',
        thumbnailImagePath: '',
        isActive: true,
        order: 1,
        approvalPercentage: 80,
        metadata: {},
        items: []
    });

    // Inicializar formData con los datos del módulo
    useEffect(() => {
        if (module) {
            setFormData({
                title: module.title || '',
                description: module.description || '',
                thumbnailImagePath: module.thumbnailImagePath || '',
                isActive: module.configuration?.isActive ?? true,
                order: module.configuration?.order ?? 1,
                approvalPercentage: module.configuration?.approvalPercentage ?? 80,
                metadata: module.configuration?.metadata || {},
                items: module.items || []
            });
        }
    }, [module]);

    // Si hay datos de acción con errores, actualizar con esos campos
    useEffect(() => {
        if (actionData?.fields) {
            setFormData({
                title: actionData.fields.title || '',
                description: actionData.fields.description || '',
                thumbnailImagePath: actionData.fields.thumbnailImagePath || '',
                isActive: actionData.fields.isActive ?? true,
                order: actionData.fields.order ?? 1,
                approvalPercentage: actionData.fields.approvalPercentage ?? 80,
                metadata: actionData.fields.metadata || {},
                items: actionData.fields.items || []
            });
        }
    }, [actionData]);

    const isSubmitting = navigation.state === 'submitting';
    const errors = actionData?.errors || {};

    // Manejar cambios en el formulario
    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    // Manejar cancelación
    const handleCancel = () => {
        if (hasChanges) {
            if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
                navigate(`/modules/course/${course?.id}`);
            }
        } else {
            navigate(`/modules/course/${course?.id}`);
        }
    };

    // Determinar si el formulario es válido
    const isValid = formData.title.trim().length > 0 &&
        formData.order >= 0 &&
        formData.approvalPercentage >= 0 &&
        formData.approvalPercentage <= 100;

    // Obtener nivel de dificultad en español
    const getDifficultyLabel = () => {
        const difficulty = formData.metadata.difficulty;
        const labels: Record<string, string> = {
            'beginner': 'Principiante',
            'intermediate': 'Intermedio',
            'advanced': 'Avanzado',
            'expert': 'Experto'
        };
        return labels[difficulty] || 'No especificado';
    };

    if (!module || !course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-800">Error al cargar el módulo</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="container mx-auto px-4">
                
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(`/modules/course/${course.id}`)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                                <Layers className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Editar Módulo</h1>
                                <p className="text-gray-600">Curso: {course?.title || 'Cargando...'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Error general */}
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-800">{errors.general}</p>
                        </div>
                    </div>
                )}

                {/* Mensaje de éxito si viene de crear */}
                {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('created') && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-green-400 mr-2" />
                            <p className="text-green-800">Módulo creado exitosamente</p>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <Form id="module-form" method="post" encType="multipart/form-data" className="space-y-6">
                    <input type="hidden" name="courseId" value={course.id} />
                    
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        
                        {/* Columna izquierda - Información principal */}
                        <div className="xl:col-span-2 space-y-6">
                            
                            {/* Información Básica */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                                <BasicModuleInformation
                                    formData={formData}
                                    onFormChange={handleFormChange}
                                    onThumbnailFileChange={setSelectedThumbnailFile}
                                    selectedThumbnailFile={selectedThumbnailFile}
                                    errors={errors}
                                />
                            </div>

                            {/* Configuración del Módulo */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                                <ModuleConfiguration
                                    formData={formData}
                                    onFormChange={handleFormChange}
                                    errors={errors}
                                />
                            </div>
                        </div>

                        {/* Columna derecha - Panel lateral */}
                        <div className="space-y-6">
                            
                            {/* Resumen */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-6">
                                <div className="flex items-center space-x-2 mb-6">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Título:</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formData.title || <span className="text-gray-400 italic">Sin especificar</span>}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Estado:</span>
                                        <p className="text-sm mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                formData.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {formData.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Orden:</span>
                                        <p className="text-sm text-gray-900 mt-1">#{formData.order}</p>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Aprobación:</span>
                                        <p className="text-sm text-gray-900 mt-1">{formData.approvalPercentage}%</p>
                                    </div>

                                    {formData.metadata.difficulty && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Dificultad:</span>
                                            <p className="text-sm text-gray-900 mt-1">{getDifficultyLabel()}</p>
                                        </div>
                                    )}

                                    {formData.metadata.estimatedDuration && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Duración estimada:</span>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {formData.metadata.estimatedDuration} minutos
                                            </p>
                                        </div>
                                    )}

                                    {formData.thumbnailImagePath && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 block mb-2">Vista previa:</span>
                                            <img 
                                                src={formData.thumbnailImagePath} 
                                                alt="Vista previa" 
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>

                                {hasChanges && (
                                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                                            <p className="text-xs text-blue-800">
                                                Tienes cambios sin guardar
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Información del módulo */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="space-y-2 text-xs text-gray-500">
                                        <div className="flex justify-between">
                                            <span>Creado:</span>
                                            <span>{new Date(module.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Actualizado:</span>
                                            <span>{new Date(module.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="mt-6 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isValid}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        <Save className="h-5 w-5" />
                                        <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        <X className="h-5 w-5" />
                                        <span>Cancelar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

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
            </div>
        </div>
    );
}