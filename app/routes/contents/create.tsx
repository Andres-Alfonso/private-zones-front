// app/routes/contents/create.tsx

import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useCurrentUser } from "~/context/AuthContext";

// Importar componentes
import { CreateContentHeader } from "~/components/contents/CreateContentHeader";
import { ContentTypeSelector } from "~/components/contents/ContentTypeSelector";
import { BasicInformation } from "~/components/contents/BasicInformation";
import { ContentUploader } from "~/components/contents/ContentUploader";
import { MetadataEditor } from "~/components/contents/MetadataEditor";
import { ContentPreview } from "~/components/contents/ContentPreview";
import { FormActions } from "~/components/contents/FormActions";
import { request } from "node_modules/axios/index.cjs";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { CourseBasic } from "~/api/types/course.types";
import { ContentAPI } from "~/api/endpoints/contents";

// Tipos para el formulario
interface ContentFormData {
  title: string;
  description: string;
  contentType: 'video' | 'image' | 'document' | 'embed' | 'scorm';
  contentUrl: string;
  courseId: string;
  metadata: Record<string, any>;
}

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
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

// Loader para cargar datos iniciales
// export const loader: LoaderFunction = async ({ request }) => {
//   // Mock data para cursos
//   const mockCourses: Course[] = [
//     {
//       id: 'course-1',
//       title: 'Introducción a React',
//       category: 'Frontend',
//       instructor: 'Juan Pérez'
//     },
//     {
//       id: 'course-2',
//       title: 'Node.js Avanzado',
//       category: 'Backend',
//       instructor: 'María García'
//     },
//     {
//       id: 'course-3',
//       title: 'Diseño UX/UI Moderno',
//       category: 'Diseño',
//       instructor: 'Ana Rodríguez'
//     },
//     {
//       id: 'course-4',
//       title: 'DevOps con Docker',
//       category: 'DevOps',
//       instructor: 'Carlos López'
//     },
//     {
//       id: 'course-5',
//       title: 'Machine Learning con Python',
//       category: 'Data Science',
//       instructor: 'Dr. Elena Martínez'
//     },
//     {
//       id: 'course-6',
//       title: 'Flutter Mobile Development',
//       category: 'Mobile',
//       instructor: 'Miguel Santos'
//     }
//   ];

//   return json({ courses: mockCourses });
// };

type LoaderData = {
  coursesResult: CourseBasic[];
  course: string | null;
}


export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const preferredLanguage = urlParams.get('lang') || 'es';
    const courseId = urlParams.get('course');

    const requestApiClient = createApiClientFromRequest(request);
    const coursesResult = await CoursesAPI.getByTenant(requestApiClient);

    if (!coursesResult) {
      throw new Response("Cursos no encontrado", { 
        status: 500,
        statusText: "Upps! Algo salió mal"
      });
    }

    return json<LoaderData>({ coursesResult, course: courseId || null });
    
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

// Action para procesar el formulario
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  try {

    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const course = urlParams.get('course');

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
        fields: { title, description, contentType, contentUrl, courseId, metadata }
      }, { status: 400 });
    }

    // Simular procesamiento de archivo si existe
    if (file && file.size > 0) {
      console.log(`Procesando archivo: ${file.name} (${file.size} bytes)`);
      // Aquí se subiría el archivo al servidor/storage
      // const uploadedUrl = await uploadFile(file);
    }

    // Simular creación del contenido
    console.log('Creando contenido:', {
      title,
      description,
      contentType,
      contentUrl: file ? `uploaded-files/${file.name}` : contentUrl,
      courseId,
      metadata
    });

    // Simular delay de creación
    await new Promise(resolve => setTimeout(resolve, 1000));

    const contentData = {
      title: title,
      description,
      type: contentType,
      contentUrl: file ? `uploaded-files/${file.name}` : contentUrl,
      // courseId,
      metadata
    };

    const authenticatedApiClient = createApiClientFromRequest(request);
    const response = await ContentAPI.create(contentData, authenticatedApiClient);

    if (response.success) {
      // Opción 1: Redireccionar a la lista de contenidos
      // return redirect(`/courses/${courseId}/contents?created=${response.data.id}`);
      
      // Opción 2: Redireccionar al contenido creado
      return redirect(`/contents/course/${course}`);
      
      // Opción 3: Mostrar mensaje de éxito en la misma página
      // return json({ 
      //   success: true, 
      //   message: response.message,
      //   content: response.data
      // });
    } else {
      throw new Error(response.message || 'Error desconocido');
    }

  } catch (error: any) {
    console.error('Error al crear contenido:', error);
    return json({ 
      errors: { general: error.message || 'Error al crear el contenido' },
      fields: Object.fromEntries(formData)
    }, { status: 500 });
  }
};

// Componente principal
export default function CreateContent() {
  // const { courses } = useLoaderData<{ courses: Course[] }>();
  const { coursesResult, course } = useLoaderData<LoaderData>();
  
  const actionData = useActionData<{ 
    errors?: FormErrors; 
    fields?: any;
  }>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ContentFormData>({
    title: actionData?.fields?.title || '',
    description: actionData?.fields?.description || '',
    contentType: actionData?.fields?.contentType || ('' as any),
    contentUrl: actionData?.fields?.contentUrl || '',
    courseId: actionData?.fields?.courseId || '',
    metadata: actionData?.fields?.metadata || {}
  });

  const totalSteps = 4;
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
                 formData.courseId && 
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
    if (course) {
      navigate(`/contents/course/${course}`);
    } else {
      navigate("/contents");
    }
  };

  // Encontrar curso seleccionado
  const selectedCourse = coursesResult.find(course => course.id === formData.courseId);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <CreateContentHeader
        onBack={handleBack}
        onPreview={() => setShowPreview(true)}
        isValid={!!isValid}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      <Form id="content-form" method="post" encType="multipart/form-data" className="space-y-8">
        {/* Información Básica */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <BasicInformation
            formData={formData}
            onFormChange={handleFormChange}
            courses={coursesResult}
            errors={errors}
          />
        </div>

        {/* Selector de Tipo de Contenido */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
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

        {/* Subidor de Contenido */}
        {formData.contentType && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
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
        )}

        {/* Editor de Metadatos */}
        {formData.contentType && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            <MetadataEditor
              contentType={formData.contentType}
              metadata={formData.metadata}
              onMetadataChange={(metadata) => handleFormChange('metadata', metadata)}
            />
          </div>
        )}

        {/* Acciones del Formulario */}
        <FormActions
          onSave={handleSubmit}
          onSaveAndAdd={() => {
            if (validateForm()) {
              // Lógica para guardar y crear otro
              handleSubmit();
              // Después del submit exitoso, resetear formulario
            }
          }}
          isSubmitting={isSubmitting}
          isValid={!!isValid}
        />

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
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('created') === 'true' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-green-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">¡Contenido creado exitosamente!</span>
          </div>
        </div>
      )}
    </div>
  );
}