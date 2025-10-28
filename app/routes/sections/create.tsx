// app/routes/sections/create.tsx

import { json, redirect, ActionFunction, LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useNavigate, useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  Save, X, AlertCircle, Layers3, Hash, FileText, 
  Image, Palette, Settings, Eye, Upload, Globe, 
  BookOpen
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


// Función para procesar las traducciones
function processCourseTranslations(
  courses: CourseFromAPI[], 
  preferredLanguage: string = 'es'
): CourseBasic[] {
  return courses.map(course => {
    // Buscar traducción en el idioma preferido
    let selectedTranslation = course.translations.find(
      t => t.languageCode === preferredLanguage
    );
    
    // Si no existe en el idioma preferido, usar la primera disponible
    if (!selectedTranslation && course.translations.length > 0) {
      selectedTranslation = course.translations[0];
    }
    
    // Si no hay traducciones, crear valores por defecto
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

// Función helper para obtener mensajes específicos
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

// Función helper para convertir errores a errores de campo
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

    const cookieHeader = request.headers.get("cookie");
    // const { state: tenantState } = useTenant();
    // const { tenant } = tenantState;

    // if (!tenant || !tenant.id) {
    //   return json<LoaderData>({
    //     availableCourses: [],
    //   }, { status: 400 });
    // }

    // const coursesResult = await CoursesAPI.getByTenant();

    const requestApiClient = createApiClientFromRequest(request);
    const coursesResult = await CoursesAPI.getByTenant(requestApiClient);
    
    // CAMBIO: verificar si es un error o es el array directamente
    if ('error' in coursesResult) {
      console.error('Courses API Error:', coursesResult.error);
      return json<LoaderData>({
        availableCourses: [],
      }, { status: 500 });
    }

    // Procesar las traducciones
    const processedCourses = processCourseTranslations(
      coursesResult as CourseFromAPI[], 
      preferredLanguage
    );
    
    // coursesResult ES el array directamente
    // console.log('Available courses:', coursesResult);
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

  // Validar formulario
  const validation = validateSectionForm(formData);
  
  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  try {
    // Obtener datos del formulario
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

    // Aquí se llamaría al API para crear la sección
    console.log('Crear sección:', sectionData);
    
    // Simulación de respuesta exitosa
    const mockSectionId = 'section-' + Date.now();
    
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

  console.log('Tenant en CreateSection:', tenant);

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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  const checkSlugExists = async (slug: string): Promise<boolean> => {
    try {
      // Llamada al API para verificar si el slug existe
      const response = await SectionApi.checkSlugExists(slug);
      return response.exists;
    } catch (error) {
      console.error('Error checking slug existence:', error);
      return false; // En caso de error, asumimos que no existe para no bloquear
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
    
    // Verificar si el slug base ya existe
    while (await checkSlugExists(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  };

  // Generar slug automáticamente desde el nombre
  useEffect(() => {
    if (formData.name && !slugManuallyEdited) {
      // Usar un debounce para evitar múltiples llamadas
      const timeoutId = setTimeout(async () => {
        try {
          const uniqueSlug = await generateUniqueSlug(formData.name);
          setFormData(prev => ({ ...prev, slug: uniqueSlug }));
        } catch (error) {
          console.error('Error generating unique slug:', error);
          // Fallback al slug básico sin verificación
          const fallbackSlug = generateBaseSlug(formData.name);
          setFormData(prev => ({ ...prev, slug: fallbackSlug }));
        }
      }, 500); // Debounce de 500ms

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

  const steps = [
    { id: 1, name: 'Información Básica', icon: Layers3 },
    { id: 2, name: 'Configuración', icon: Settings },
    { id: 3, name: 'Cursos', icon: BookOpen },
    { id: 4, name: 'Imágenes', icon: Image },
    { id: 5, name: 'Revisión', icon: Eye }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
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
              </div>
              <div>
                <Input
                  id="slug"
                  name="slug"
                  label="Slug (URL amigable) *"
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => {
                    updateField('slug', e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  error={getErrorByField(errors, 'slug')}
                  placeholder="colaboradores, medicina-general"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Se generará automáticamente basado en el nombre
                </p>
              </div>
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
              {getErrorByField(errors, 'description') && (
                <p className="mt-1 text-sm text-red-600">{getErrorByField(errors, 'description')}</p>
              )}
            </div>

            <div>
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
              <p className="text-sm text-gray-500 mt-1">
                Determina el orden en que se mostrará la sección (menor número = primera posición)
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Banner</h3>
              
              <div className="space-y-4">
                <Checkbox
                  id="allowBanner"
                  name="allowBanner"
                  label="Permitir banner en esta sección"
                  checked={formData.allowBanner}
                  onChange={(checked) => updateField('allowBanner', checked)}
                />
                
                <p className="text-sm text-gray-600">
                  Los banners se muestran en la parte superior de la sección para destacar contenido importante
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vista previa de configuración</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nombre:</span>
                  <span className="text-sm text-gray-900">{formData.name || 'Sin nombre'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Slug:</span>
                  <span className="text-sm text-gray-900">/{formData.slug || 'sin-slug'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Orden:</span>
                  <span className="text-sm text-gray-900">#{formData.order}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Banner:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    formData.allowBanner ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {formData.allowBanner ? 'Permitido' : 'No permitido'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Cursos de la Sección</span>
                </div>
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los cursos que pertenecerán a esta sección. Los usuarios podrán ver estos cursos al navegar por la sección.
              </p>

              {availableCourses && availableCourses.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableCourses.map((course) => (
                    <label
                      key={course.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.courseIds.includes(course.id)
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!course.isActive ? 'opacity-60' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.courseIds.includes(course.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const updatedCourseIds = isChecked
                            ? [...formData.courseIds, course.id]
                            : formData.courseIds.filter(id => id !== course.id);
                          updateField('courseIds', updatedCourseIds);
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{course.title}</span>
                          {!course.isActive && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">/{course.slug}</p>
                      </div>
                    </label>
                  ))}
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

              {formData.courseIds.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">{formData.courseIds.length}</span> curso(s) seleccionado(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Imagen thumbnail */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen de la Sección</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="thumbnailUpload" 
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clic para subir</span> o arrastra y suelta
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
                
                <Input
                  id="thumbnailImagePath"
                  name="thumbnailImagePath"
                  label="URL de la imagen (opcional)"
                  type="url"
                  value={formData.thumbnailImagePath}
                  onChange={(e) => updateField('thumbnailImagePath', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            {/* Banner image */}
            {formData.allowBanner && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen del Banner</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label 
                      htmlFor="bannerUpload" 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {previewBanner ? (
                        <img 
                          src={previewBanner} 
                          alt="Vista previa del banner" 
                          className="w-full h-full object-cover rounded-lg"
                        />
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
                  
                  <Input
                    id="bannerPath"
                    name="bannerPath"
                    label="URL del banner (opcional)"
                    type="url"
                    value={formData.bannerPath}
                    onChange={(e) => updateField('bannerPath', e.target.value)}
                    placeholder="https://ejemplo.com/banner.jpg"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revisión Final</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <p className="mt-1 text-sm text-gray-900">/{formData.slug}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.description || <span className="text-gray-400 italic">Sin descripción</span>}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Orden</label>
                    <p className="mt-1 text-sm text-gray-900">#{formData.order}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formData.allowBanner ? 'Permitido' : 'No permitido'}
                    </p>
                  </div>
                </div>
                
                {(formData.thumbnailImagePath || previewImage) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Imagen de la sección</label>
                    <img 
                      src={previewImage || formData.thumbnailImagePath} 
                      alt="Vista previa" 
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {formData.allowBanner && (formData.bannerPath || previewBanner) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner</label>
                    <img 
                      src={previewBanner || formData.bannerPath} 
                      alt="Vista previa del banner" 
                      className="mt-2 w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-800">
                  Revisa cuidadosamente la información antes de crear la sección. 
                  Podrás editarla después si es necesario.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Layers3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Sección</h1>
                <p className="text-gray-600">Organiza tu contenido en secciones temáticas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Paso {currentStep} de {steps.length}</span>
            </div>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                        : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden md:block font-medium">{step.name}</span>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario */}
        <Form method="post" className="space-y-6">
          {/* Campos ocultos para persistir datos */}
          <input type="hidden" name="name" value={formData.name} />
          <input type="hidden" name="slug" value={formData.slug} />
          <input type="hidden" name="description" value={formData.description} />
          <input type="hidden" name="thumbnailImagePath" value={formData.thumbnailImagePath} />
          <input type="hidden" name="order" value={formData.order} />
          <input type="hidden" name="allowBanner" value={formData.allowBanner ? 'on' : ''} />
          <input type="hidden" name="bannerPath" value={formData.bannerPath} />
          <input type="hidden" name="tenantId" value={formData.tenantId} />
          {formData.courseIds.map((courseId) => (
            <input key={courseId} type="hidden" name="courseIds" value={courseId} />
          ))}

          {/* Contenido del paso actual */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            {renderStepContent()}
          </div>

          {/* Error general */}
          {actionData?.generalError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{actionData.generalError}</p>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Cancelar</span>
              </button>
              
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 text-purple-600 border border-purple-300 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  Anterior
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Save className="h-5 w-5" />
                  <span>{isSubmitting ? 'Creando...' : 'Crear Sección'}</span>
                </button>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}