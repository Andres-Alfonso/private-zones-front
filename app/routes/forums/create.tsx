// app/routes/forums/create.tsx

import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ForumsAPI } from "~/api/endpoints/forums";

// Importar componentes
import { CreateForumHeader } from "~/components/forums/CreateForumHeader";
import { BasicForumInformation } from "~/components/forums/BasicForumInformation";
import { ForumSettings } from "~/components/forums/ForumSettings";
import { ThumbnailUploader } from "~/components/forums/ThumbnailUploader";
import { TagsEditor } from "~/components/forums/TagsEditor";
import { ForumPreview } from "~/components/forums/ForumPreview";
import { FormActions } from "~/components/forums/FormActions";

// Tipos para el formulario
interface ForumFormData {
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  isActive: boolean;
  isPinned: boolean;
  expirationDate: string;
  tags: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  file?: string;
  general?: string;
}

type LoaderData = {
  courseId: string | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const courseId = urlParams.get('course');

    if(courseId == null){
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

// Action para procesar el formulario
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  try {
    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const courseId = urlParams.get('course') ?? 'not_id';

    // Obtener datos del formulario
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const isActive = formData.get('isActive') === 'true';
    const isPinned = formData.get('isPinned') === 'true';
    const expirationDate = formData.get('expirationDate') as string;
    const tags = JSON.parse((formData.get('tags') as string) || '[]');
    const file = formData.get('file') as File | null;

    // Validaciones básicas
    const errors: FormErrors = {};

    if (!title?.trim()) {
      errors.title = 'El título es obligatorio';
    }

    // Si hay errores, devolver errores
    if (Object.keys(errors).length > 0) {
      return json({ 
        errors,
        fields: { 
          title, 
          description, 
          category, 
          thumbnailUrl, 
          isActive, 
          isPinned, 
          expirationDate,
          tags 
        }
      }, { status: 400 });
    }

    // Procesar archivo si existe
    let finalThumbnailUrl = thumbnailUrl;
    if (file && file.size > 0) {
      console.log(`Procesando archivo: ${file.name} (${file.size} bytes)`);
      // Aquí se subiría el archivo al servidor/storage
      // finalThumbnailUrl = await uploadFile(file);
      finalThumbnailUrl = `uploaded-files/${file.name}`;
    }

    // Preparar datos para el API
    const forumData = {
      title,
      description: description || undefined,
      category: category || undefined,
      thumbnail: finalThumbnailUrl || undefined,
      isActive,
      isPinned,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      courseId: courseId
    };

    // Simular delay de creación
    await new Promise(resolve => setTimeout(resolve, 1000));

    const authenticatedApiClient = createApiClientFromRequest(request);
    const response = await ForumsAPI.create(forumData, authenticatedApiClient);

    if (response.success) {
      // Redireccionar según contexto
      if (courseId) {
        return redirect(`/forums/course/${courseId}`);
      } else {
        return redirect('/forums');
      }
    } else {
      throw new Error(response.message || 'Error desconocido');
    }

  } catch (error: any) {
    console.error('Error al crear foro:', error);
    return json({ 
      errors: { general: error.message || 'Error al crear el foro' },
      fields: Object.fromEntries(formData)
    }, { status: 500 });
  }
};

// Componente principal
export default function CreateForum() {
  const { courseId } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ 
    errors?: FormErrors; 
    fields?: any;
  }>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ForumFormData>({
    title: actionData?.fields?.title || '',
    description: actionData?.fields?.description || '',
    category: actionData?.fields?.category || '',
    thumbnailUrl: actionData?.fields?.thumbnailUrl || '',
    isActive: actionData?.fields?.isActive ?? true,
    isPinned: actionData?.fields?.isPinned ?? false,
    expirationDate: actionData?.fields?.expirationDate || '',
    tags: actionData?.fields?.tags || []
  });

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || {};

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    return Object.keys(newErrors).length === 0;
  };

  // Determinar si el formulario es válido
  const isValid = formData.title.trim().length > 0;

  // Manejar cambios en el formulario
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (validateForm()) {
      const form = document.getElementById('forum-form') as HTMLFormElement;
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
      navigate(`/forums/course/${courseId}`);
    } else {
      navigate("/forums");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <CreateForumHeader
        onBack={handleBack}
        onPreview={() => setShowPreview(true)}
        isValid={isValid}
      />

      <Form id="forum-form" method="post" encType="multipart/form-data" className="space-y-8">
        {/* Información Básica */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <BasicForumInformation
            title={formData.title}
            description={formData.description}
            category={formData.category}
            onTitleChange={(value) => handleFormChange('title', value)}
            onDescriptionChange={(value) => handleFormChange('description', value)}
            onCategoryChange={(value) => handleFormChange('category', value)}
            errors={errors}
          />
        </div>

        {/* Imagen de Portada */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <ThumbnailUploader
            thumbnailUrl={formData.thumbnailUrl}
            selectedFile={selectedFile}
            onUrlChange={(url) => {
              handleFormChange('thumbnailUrl', url);
              if (url && selectedFile) {
                setSelectedFile(null);
              }
            }}
            onFileChange={(file) => {
              setSelectedFile(file);
              if (file && formData.thumbnailUrl) {
                handleFormChange('thumbnailUrl', '');
              }
            }}
            error={errors.thumbnailUrl || errors.file}
          />
        </div>

        {/* Configuración */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <ForumSettings
            isActive={formData.isActive}
            isPinned={formData.isPinned}
            expirationDate={formData.expirationDate}
            onIsActiveChange={(value) => handleFormChange('isActive', value)}
            onIsPinnedChange={(value) => handleFormChange('isPinned', value)}
            onExpirationDateChange={(value) => handleFormChange('expirationDate', value)}
          />
        </div>

        {/* Etiquetas */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <TagsEditor
            tags={formData.tags}
            onTagsChange={(tags) => handleFormChange('tags', tags)}
          />
        </div>

        {/* Acciones del Formulario */}
        <FormActions
          onSave={handleSubmit}
          isSubmitting={isSubmitting}
          isValid={isValid}
        />

        {/* Campos ocultos para el formulario */}
        <input type="hidden" name="title" value={formData.title} />
        <input type="hidden" name="description" value={formData.description} />
        <input type="hidden" name="category" value={formData.category} />
        <input type="hidden" name="thumbnailUrl" value={formData.thumbnailUrl} />
        <input type="hidden" name="isActive" value={String(formData.isActive)} />
        <input type="hidden" name="isPinned" value={String(formData.isPinned)} />
        <input type="hidden" name="expirationDate" value={formData.expirationDate} />
        <input type="hidden" name="tags" value={JSON.stringify(formData.tags)} />
      </Form>

      {/* Modal de Vista Previa */}
      {showPreview && (
        <ForumPreview
          formData={formData}
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

      {/* Mensaje de éxito */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('created') === 'true' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-green-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">¡Foro creado exitosamente!</span>
          </div>
        </div>
      )}
    </div>
  );
}