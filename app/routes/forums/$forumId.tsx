// app/routes/forums/edit.$forumId.tsx

import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ForumsAPI } from "~/api/endpoints/forums";
import { ForumBasic } from "~/api/types/forums.type";

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
  forum: ForumBasic;
  courseId: string | null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    console.log(params);
    const { forumId } = params;
    
    if (!forumId) {
      throw new Response("Forum ID no proporcionado", { 
        status: 400,
        statusText: "Bad Request"
      });
    }

    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const courseId = urlParams.get('course');

    const authenticatedApiClient = createApiClientFromRequest(request);
    const forumResponse = await ForumsAPI.getById(forumId, authenticatedApiClient);

    const forum = forumResponse.data;

    if (!forumResponse) {
      throw new Response("Foro no encontrado", { 
        status: 404,
        statusText: "Not Found"
      });
    }

    return json<LoaderData>({ forum, courseId: courseId || null });
    
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    console.error("Error cargando foro:", error);
    throw new Response("Error interno del servidor", { 
      status: 500,
      statusText: "Internal Server Error"
    });
  }
}

// Action para procesar el formulario
export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const { forumId } = params;
  
  if (!forumId) {
    return json({ 
      errors: { general: 'Forum ID no proporcionado' }
    }, { status: 400 });
  }
  
  try {
    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const courseId = urlParams.get('course');

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
    };

    // Simular delay de actualización
    await new Promise(resolve => setTimeout(resolve, 1000));

    const authenticatedApiClient = createApiClientFromRequest(request);
    const response = await ForumsAPI.update(forumId, forumData, authenticatedApiClient);

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
    console.error('Error al actualizar foro:', error);
    return json({ 
      errors: { general: error.message || 'Error al actualizar el foro' },
      fields: Object.fromEntries(formData)
    }, { status: 500 });
  }
};

// Componente principal
export default function EditForum() {
  const { forum, courseId } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ 
    errors?: FormErrors; 
    fields?: any;
  }>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Formatear fecha para input datetime-local
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<ForumFormData>({
    title: actionData?.fields?.title || forum.title,
    description: actionData?.fields?.description || forum.description || '',
    category: actionData?.fields?.category || forum.category || '',
    thumbnailUrl: actionData?.fields?.thumbnailUrl || forum.thumbnail || '',
    isActive: actionData?.fields?.isActive ?? forum.isActive,
    isPinned: actionData?.fields?.isPinned ?? forum.isPinned,
    expirationDate: actionData?.fields?.expirationDate || formatDateForInput(forum.expirationDate),
    tags: actionData?.fields?.tags || forum.tags || []
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
  const isValid = (formData.title?.trim().length ?? 0) > 0;

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
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/forums");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Foro</h1>
            <p className="text-gray-600 mt-1">
              Actualiza la información del foro
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={!isValid}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
            transition-all duration-200
            ${isValid
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Vista Previa</span>
        </button>
      </div>

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
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-medium
              transition-all duration-200 transform hover:scale-105
              ${isValid && !isSubmitting
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Actualizar Foro</span>
              </>
            )}
          </button>
        </div>

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
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('updated') === 'true' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-green-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">¡Foro actualizado exitosamente!</span>
          </div>
        </div>
      )}
    </div>
  );
}