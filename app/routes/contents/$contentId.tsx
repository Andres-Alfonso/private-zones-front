// app/routes/contents/edit.$contentId.tsx

import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ContentAPI } from "~/api/endpoints/contents";
import { CoursesAPI } from "~/api/endpoints/courses";
import { CourseBasic } from "~/api/types/course.types";

// Importar componentes
import { CreateContentHeader } from "~/components/contents/CreateContentHeader";
import { ContentTypeSelector } from "~/components/contents/ContentTypeSelector";
import { BasicInformation } from "~/components/contents/BasicInformation";
import { ContentUploader } from "~/components/contents/ContentUploader";
import { MetadataEditor } from "~/components/contents/MetadataEditor";
import { ContentPreview } from "~/components/contents/ContentPreview";
import { ContentSummaryPanel } from "~/components/contents/ContentSummaryPanel";

// Tipos para el formulario
interface ContentFormData {
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  courseId: string;
  metadata: Record<string, any>;
}

interface FormErrors {
  title?: string;
  description?: string;
  contentType?: string;
  contentUrl?: string;
  courseId?: string;
  file?: string;
  general?: string;
}

interface ContentData {
  id: string;
  title: string;
  description: string | null;
  type: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string | null;
  courseId: string;
  metadata: Record<string, any>;
}

type LoaderData = {
  content: ContentData;
  coursesResult: CourseBasic[] | { error: string };
  courseId: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { contentId } = params;

    if (!contentId) {
      throw new Response("ID del contenido no proporcionado", { 
        status: 400,
        statusText: "Bad Request"
      });
    }

    const authenticatedApiClient = createApiClientFromRequest(request);
    
    // Cargar el contenido
    const contentResponse = await ContentAPI.getById(contentId, authenticatedApiClient);

    if (!contentResponse.success || !contentResponse.data) {
      throw new Response("Contenido no encontrado", { 
        status: 404,
        statusText: "Not Found"
      });
    }

    // Cargar los cursos disponibles
    const coursesResult = await CoursesAPI.getByTenant(authenticatedApiClient);

    if (!coursesResult) {
      throw new Response("Error al cargar cursos", { 
        status: 500,
        statusText: "Internal Server Error"
      });
    }

    return json<LoaderData>({ 
      content: contentResponse.data,
      coursesResult,
      courseId: contentResponse.data.courseId
    });
    
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    console.error("Error cargando contenido:", error);
    throw new Response("Error interno del servidor", { 
      status: 500,
      statusText: "Internal Server Error"
    });
  }
}

// Action para procesar el formulario de edición
export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const { contentId } = params;
  
  try {
    if (!contentId) {
      throw new Error("ID del contenido no proporcionado");
    }

    // Obtener datos del formulario
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const contentType = formData.get('contentType') as string;
    const contentUrl = formData.get('contentUrl') as string;
    const courseId = formData.get('courseId') as string;
    const metadata = JSON.parse((formData.get('metadata') as string) || '{}');
    const file = formData.get('file') as File | null;

    // Validaciones básicas
    const errors: FormErrors = {};

    if (!title?.trim()) {
      errors.title = 'El título es obligatorio';
    }

    if (!contentType) {
      errors.contentType = 'Selecciona un tipo de contenido';
    }

    if (!courseId) {
      errors.courseId = 'Selecciona un curso';
    }

    // Validar que tenga URL o archivo
    if (!contentUrl?.trim() && !file) {
      if (contentType === 'scorm') {
        errors.file = 'Debes seleccionar un archivo ZIP para SCORM';
      } else {
        errors.contentUrl = 'Debes proporcionar una URL o subir un archivo';
      }
    }

    // Si hay errores, devolver errores
    if (Object.keys(errors).length > 0) {
      return json({ 
        errors,
        fields: { 
          title, 
          description, 
          contentType, 
          contentUrl, 
          courseId, 
          metadata 
        }
      }, { status: 400 });
    }

    // Procesar archivo si existe
    let finalContentUrl = contentUrl;
    if (file && file.size > 0) {
      console.log(`Procesando archivo: ${file.name} (${file.size} bytes)`);
      // Aquí se subiría el archivo al servidor/storage
      finalContentUrl = `uploaded-files/${file.name}`;
    }

    // Preparar datos para el API
    const contentData = {
      title,
      description: description || undefined,
      type: contentType,
      contentUrl: finalContentUrl || undefined,
      courseId,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    // Simular delay de actualización
    await new Promise(resolve => setTimeout(resolve, 1000));

    const authenticatedApiClient = createApiClientFromRequest(request);
    const response = await ContentAPI.update(contentId, contentData, authenticatedApiClient);

    if (response.success) {
      // Redireccionar a la lista de contenidos del curso
      return redirect(`/contents/course/${courseId}?updated=true`);
    } else {
      throw new Error(response.message || 'Error desconocido');
    }

  } catch (error: any) {
    console.error('Error al actualizar contenido:', error);
    return json({ 
      errors: { general: error.message || 'Error al actualizar el contenido' },
      fields: Object.fromEntries(formData)
    }, { status: 500 });
  }
};

// Componente principal
export default function EditContent() {
  const { content, coursesResult, courseId } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ 
    errors?: FormErrors; 
    fields?: any;
  }>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ContentFormData>({
    title: actionData?.fields?.title || content.title,
    description: actionData?.fields?.description || content.description || '',
    contentType: actionData?.fields?.contentType || content.type,
    contentUrl: actionData?.fields?.contentUrl || content.contentUrl || '',
    courseId: actionData?.fields?.courseId || content.courseId,
    metadata: actionData?.fields?.metadata || content.metadata || {}
  });

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || {};

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.contentType) {
      newErrors.contentType = 'Selecciona un tipo de contenido';
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Selecciona un curso';
    }

    // Validar URL o archivo
    if (!formData.contentUrl.trim() && !selectedFile) {
      if (formData.contentType === 'scorm') {
        newErrors.file = 'Debes seleccionar un archivo ZIP para SCORM';
      } else {
        newErrors.contentUrl = 'Debes proporcionar una URL o subir un archivo';
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // Determinar si el formulario es válido
  const isValid = formData.title && 
                 formData.contentType && 
                 (formData.contentUrl || selectedFile);

  // Manejar cambios en el formulario
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (validateForm()) {
      const form = document.getElementById('content-form') as HTMLFormElement;
      if (form) {
        // Agregar archivo al FormData si existe
        if (selectedFile) {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.name = 'file';
          fileInput.style.display = 'none';
          form.appendChild(fileInput);
          
          // Crear un nuevo FileList con el archivo seleccionado
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(selectedFile);
          fileInput.files = dataTransfer.files;
        }
        
        form.submit();
      }
    }
  };

  // función onBack
  const handleBack = () => {
    if (courseId) {
      navigate(`/contents/course/${courseId}`);
    } else {
      navigate("/contents");
    }
  };

  // función para cancelar
  const handleCancel = () => {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.')) {
      handleBack();
    }
  };

  // Encontrar curso seleccionado
  let selectedCourse: CourseBasic | undefined = undefined;

  if (Array.isArray(coursesResult)) {
    selectedCourse = coursesResult.find(
      (course: CourseBasic) => course.id === formData.courseId
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <CreateContentHeader
          onBack={handleBack}
          onPreview={() => setShowPreview(true)}
          isValid={!!isValid}
          currentStep={1}
          totalSteps={4}
          isEditing={true}
        />

        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error: {errors.general}</span>
            </div>
          </div>
        )}

        <Form id="content-form" method="post" encType="multipart/form-data">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Columna izquierda - Contenido principal (2/3) */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Información Básica */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <BasicInformation
                  formData={formData}
                  onFormChange={handleFormChange}
                  courses={coursesResult}
                  errors={errors}
                />
              </div>

              {/* Selector de Tipo de Contenido */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <ContentTypeSelector
                  selectedType={formData.contentType}
                  onTypeChange={(type) => {
                    handleFormChange('contentType', type);
                    // Limpiar archivo y URL al cambiar tipo
                    setSelectedFile(null);
                    handleFormChange('contentUrl', '');
                  }}
                  error={errors.contentType}
                />
              </div>

              {/* Subidor de Contenido y Metadatos en dos columnas */}
              {formData.contentType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subidor de Contenido */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <ContentUploader
                      contentType={formData.contentType}
                      contentUrl={formData.contentUrl}
                      selectedFile={selectedFile}
                      onUrlChange={(url) => {
                        handleFormChange('contentUrl', url);
                        // Si se escribe URL, limpiar archivo
                        if (url && selectedFile) {
                          setSelectedFile(null);
                        }
                      }}
                      onFileChange={(file) => {
                        setSelectedFile(file);
                        // Si se selecciona archivo, limpiar URL
                        if (file && formData.contentUrl) {
                          handleFormChange('contentUrl', '');
                        }
                      }}
                      error={errors.contentUrl || errors.file}
                    />
                  </div>

                  {/* Editor de Metadatos */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <MetadataEditor
                      contentType={formData.contentType}
                      metadata={formData.metadata}
                      onMetadataChange={(metadata) => handleFormChange('metadata', metadata)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha - Panel de resumen (1/3) */}
            <div>
              <ContentSummaryPanel
                formData={formData}
                selectedCourse={selectedCourse || null}
                selectedFile={selectedFile}
                hasChanges={true}
                isSubmitting={isSubmitting}
                isValid={!!isValid}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </div>

          {/* Campos ocultos para el formulario */}
          <input type="hidden" name="title" value={formData.title} />
          <input type="hidden" name="description" value={formData.description} />
          <input type="hidden" name="contentType" value={formData.contentType} />
          <input type="hidden" name="contentUrl" value={formData.contentUrl} />
          <input type="hidden" name="courseId" value={formData.courseId} />
          <input type="hidden" name="metadata" value={JSON.stringify(formData.metadata)} />
        </Form>

        {/* Modal de Vista Previa */}
        {showPreview && (
          <ContentPreview
            formData={formData}
            course={selectedCourse || null}
            selectedFile={selectedFile}
            onClose={() => setShowPreview(false)}
          />
        )}

        {/* Mensaje de éxito */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('updated') === 'true' && (
          <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom">
            <div className="flex items-center space-x-2 text-green-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">¡Contenido actualizado exitosamente!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}