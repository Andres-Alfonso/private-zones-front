// app/routes/sections/create.tsx

import { json, redirect, ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useNavigate, useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  Save, X, AlertCircle, Layers3, Settings, 
  Image, Upload, BookOpen
} from 'lucide-react';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateSectionForm, getErrorByField } from '~/utils/sectionValidation';
import { SectionApi } from '~/api/endpoints/sections';
import { SectionErrorResponse } from '~/api/types/section.types';
import { useTenant } from '~/context/TenantContext';
import { CoursesAPI } from '~/api/endpoints/courses';
import { createApiClientFromRequest } from '~/api/client';
import { CourseBasic, CourseFromAPI } from '~/api/types/course.types';

interface LoaderData {
  availableCourses: CourseBasic[];
}

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
  sectionId?: string;
}

interface SectionFormData {
  name: string;
  slug: string;
  description: string;
  thumbnailImagePath: string;
  order: number;
  allowBanner: boolean;
  bannerPath: string;
  tenantId: string;
  courseIds: string[];
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

function getSpecificErrorMessage(error: SectionErrorResponse): string {
  switch (error.error) {
    case 'SLUG_ALREADY_EXISTS':
      return `El identificador "${error.value}" ya está en uso. Elige otro identificador.`;
    case 'DOMAIN_ALREADY_EXISTS':
      return `El dominio "${error.value}" ya está en uso. Elige otro dominio.`;
    case 'RESERVED_SLUG':
      return `El identificador "${error.value}" contiene palabras reservadas. Elige otro identificador.`;
    case 'INVALID_DOMAIN':
      return `El dominio "${error.value}" no es válido para el entorno actual.`;
    case 'DATABASE_ERROR':
      return 'Error al guardar en la base de datos. Intenta nuevamente.';
    default:
      return error.message || 'Error al crear el tenant';
  }
}

function getFieldErrors(error: SectionErrorResponse): Array<{ field: string; message: string }> {
  const message = getSpecificErrorMessage(error);
  if (!error.field) {
    return [{ field: 'general', message }];
  }
  return [{ field: error.field, message }];
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);
    const preferredLanguage = urlParams.get('lang') || 'es';

    const requestApiClient = createApiClientFromRequest(request);
    const coursesResult = await CoursesAPI.getByTenant(requestApiClient);
    
    if ('error' in coursesResult) {
      console.error('Courses API Error:', coursesResult.error);
      return json<LoaderData>({
        availableCourses: [],
      }, { status: 500 });
    }

    const processedCourses = processCourseTranslations(
      coursesResult as CourseFromAPI[], 
      preferredLanguage
    );
    
    return json<LoaderData>({
      availableCourses: processedCourses || [],
    });
  } catch (error: any) {
    console.error('Unexpected error loading courses:', error);
    return json<LoaderData>({
      availableCourses: [],
    }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const validation = validateSectionForm(formData);
  
  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  try {
    const sectionData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      thumbnailImagePath: formData.get('thumbnailImagePath') as string,
      order: parseInt(formData.get('order') as string) || 1,
      allowBanner: formData.get('allowBanner') === 'on',
      bannerPath: formData.get('bannerPath') as string,
      tenantId: formData.get('tenantId') as string,
      courseIds: formData.getAll('courseIds') as string[]
    };

    const tenantDomain = request.headers.get('host');
    const sectionResult = await SectionApi.create(sectionData, tenantDomain);

    if ('error' in sectionResult) {
      const fieldErrors = getFieldErrors(sectionResult);
      return json<ActionData>({
        success: false,
        errors: fieldErrors,
        generalError: fieldErrors.find(e => e.field === 'general')?.message
      }, { status: 400 });
    }

    return redirect(`/sections/${sectionResult.slug}?created=true`);
    
  } catch (error: any) {
    console.error('Error creating section:', error);
    return json<ActionData>({ 
      generalError: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
};

export default function CreateSection() {
  const { availableCourses } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { state: tenantState } = useTenant();
  const { tenant } = tenantState;
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    slug: '',
    description: '',
    thumbnailImagePath: '',
    order: 1,
    allowBanner: false,
    bannerPath: '',
    tenantId: tenant?.id || '',
    courseIds: [],
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  const checkSlugExists = async (slug: string): Promise<boolean> => {
    try {
      const response = await SectionApi.checkSlugExists(slug);
      return response.exists;
    } catch (error) {
      console.error('Error checking slug existence:', error);
      return false;
    }
  };

  const generateBaseSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const generateUniqueSlug = async (name: string): Promise<string> => {
    const baseSlug = generateBaseSlug(name);
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (await checkSlugExists(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  };

  useEffect(() => {
    if (formData.name && !slugManuallyEdited) {
      const timeoutId = setTimeout(async () => {
        try {
          const uniqueSlug = await generateUniqueSlug(formData.name);
          setFormData(prev => ({ ...prev, slug: uniqueSlug }));
        } catch (error) {
          console.error('Error generating unique slug:', error);
          const fallbackSlug = generateBaseSlug(formData.name);
          setFormData(prev => ({ ...prev, slug: fallbackSlug }));
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, slugManuallyEdited]);

  const updateField = (field: keyof SectionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
        navigate('/sections');
      }
    } else {
      navigate('/sections');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'banner') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'thumbnail') {
          setPreviewImage(result);
          updateField('thumbnailImagePath', result);
        } else {
          setPreviewBanner(result);
          updateField('bannerPath', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Layers3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Sección</h1>
              <p className="text-gray-600">Organiza tu contenido en secciones temáticas</p>
            </div>
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
        <Form method="post" className="space-y-6">
          <input type="hidden" name="tenantId" value={formData.tenantId} />
          {formData.courseIds.map((courseId) => (
            <input key={courseId} type="hidden" name="courseIds" value={courseId} />
          ))}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Columna izquierda - Información principal */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Información Básica */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Layers3 className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="name"
                      name="name"
                      label="Nombre de la Sección *"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      error={getErrorByField(errors, 'name')}
                      placeholder="Ej: Colaboradores, Medicina General"
                    />
                    <Input
                      id="slug"
                      name="slug"
                      label="Slug (URL amigable) *"
                      type="text"
                      required
                      disabled
                      value={formData.slug}
                      onChange={(e) => {
                        updateField('slug', e.target.value);
                        setSlugManuallyEdited(true);
                      }}
                      error={getErrorByField(errors, 'slug')}
                      placeholder="colaboradores, medicina-general"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Describe el contenido y propósito de esta sección..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="order"
                      name="order"
                      label="Orden de visualización"
                      type="number"
                      value={formData.order}
                      onChange={(e) => updateField('order', parseInt(e.target.value) || 1)}
                      error={getErrorByField(errors, 'order')}
                      placeholder="1"
                      min="1"
                    />
                    <div className="flex items-end">
                      <Checkbox
                        id="allowBanner"
                        name="allowBanner"
                        label="Permitir banner en esta sección"
                        checked={formData.allowBanner}
                        onChange={(checked) => updateField('allowBanner', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cursos Asociados */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Cursos Asociados</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                    <p className="text-sm text-blue-800">
                      Selecciona los cursos que aparecerán en esta sección
                    </p>
                  </div>
                </div>

                {availableCourses && availableCourses.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        {formData.courseIds.length} de {availableCourses.length} cursos seleccionados
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              courseIds: availableCourses.map(c => c.id)
                            }));
                            setHasChanges(true);
                          }}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Seleccionar todos
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, courseIds: [] }));
                            setHasChanges(true);
                          }}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Deseleccionar todos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {availableCourses.map((course) => {
                        const isSelected = formData.courseIds.includes(course.id);
                        return (
                          <label
                            key={course.id}
                            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50'
                            } ${!course.isActive ? 'opacity-60' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  courseIds: checked
                                    ? [...prev.courseIds, course.id]
                                    : prev.courseIds.filter(id => id !== course.id)
                                }));
                                setHasChanges(true);
                              }}
                              className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">{course.title}</p>
                              <p className="text-sm text-gray-500">{course.slug}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                                course.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {course.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No hay cursos disponibles</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Crea algunos cursos primero para poder asociarlos a esta sección
                    </p>
                  </div>
                )}
              </div>

              {/* Imágenes */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Image className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Imágenes</h2>
                </div>

                <div className="space-y-6">
                  {/* Imagen principal */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Imagen de la Sección</h3>
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="thumbnailUpload" 
                        className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {previewImage ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={previewImage} 
                              alt="Vista previa" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setPreviewImage(null);
                                updateField('thumbnailImagePath', '');
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Clic para subir</span> o arrastra
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                          </div>
                        )}
                        <input 
                          id="thumbnailUpload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'thumbnail')}
                        />
                      </label>
                    </div>
                    
                    <div className="mt-3">
                      <Input
                        id="thumbnailImagePath"
                        name="thumbnailImagePath"
                        label="O ingresa una URL"
                        type="url"
                        value={formData.thumbnailImagePath}
                        onChange={(e) => {
                          updateField('thumbnailImagePath', e.target.value);
                          setPreviewImage(e.target.value);
                        }}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>

                  {/* Banner */}
                  {formData.allowBanner && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Banner</h3>
                      <div className="flex items-center justify-center w-full">
                        <label 
                          htmlFor="bannerUpload" 
                          className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          {previewBanner ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={previewBanner} 
                                alt="Vista previa del banner" 
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPreviewBanner(null);
                                  updateField('bannerPath', '');
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                <span className="font-semibold">Clic para subir banner</span>
                              </p>
                            </div>
                          )}
                          <input 
                            id="bannerUpload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'banner')}
                          />
                        </label>
                      </div>
                      
                      <div className="mt-3">
                        <Input
                          id="bannerPath"
                          name="bannerPath"
                          label="O ingresa una URL del banner"
                          type="url"
                          value={formData.bannerPath}
                          onChange={(e) => {
                            updateField('bannerPath', e.target.value);
                            setPreviewBanner(e.target.value);
                          }}
                          placeholder="https://ejemplo.com/banner.jpg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha - Panel lateral */}
            <div className="space-y-6">
              
              {/* Resumen */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="h-6 w-6 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nombre:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {formData.name || <span className="text-gray-400 italic">Sin especificar</span>}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Slug:</span>
                    <p className="text-sm text-gray-900 mt-1 font-mono">
                      /{formData.slug || <span className="text-gray-400 not-italic">sin-slug</span>}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Orden:</span>
                    <p className="text-sm text-gray-900 mt-1">#{formData.order}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Banner:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {formData.allowBanner ? 'Permitido' : 'No permitido'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Cursos seleccionados:</span>
                    <p className="text-sm text-gray-900 mt-1">{formData.courseIds.length}</p>
                  </div>
                </div>

                {hasChanges && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                      <p className="text-xs text-blue-800">
                        Completa el formulario para crear la sección
                      </p>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="mt-6 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name || !formData.slug}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isSubmitting ? 'Creando...' : 'Crear Sección'}</span>
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
        </Form>
      </div>
    </div>
  );
}