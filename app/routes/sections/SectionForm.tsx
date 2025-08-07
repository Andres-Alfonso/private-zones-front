// app/components/sections/SectionForm.tsx

import { useState, useEffect } from 'react';
import { Form } from '@remix-run/react';
import { 
  Save, X, AlertCircle, Layers3, Hash, FileText, 
  Image, Palette, Settings, Eye, Upload, Globe, 
  BookOpen
} from 'lucide-react';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { generateSlugFromName } from '~/utils/sectionValidation';

interface SectionFormData {
  name: string;
  slug: string;
  description: string;
  thumbnailImagePath: string;
  order: number;
  allowBanner: boolean;
  bannerPath: string;
  courseIds: string[];
}

interface SectionFormProps {
  initialData?: Partial<SectionFormData>;
  errors?: Array<{ field: string; message: string }>;
  isSubmitting?: boolean;
  onCancel: () => void;
  submitLabel?: string;
  title?: string;
  subtitle?: string;
  showSteps?: boolean;
  availableCourses?: Array<{ id: string; title: string; slug: string; isActive: boolean }>;
}

interface FormStep {
  id: number;
  name: string;
  icon: any;
  description: string;
}

const getErrorByField = (errors: Array<{ field: string; message: string }> = [], field: string): string | null => {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
};

export default function SectionForm({
  initialData = {},
  errors = [],
  isSubmitting = false,
  onCancel,
  submitLabel = 'Guardar',
  title = 'Formulario de Sección',
  subtitle = 'Complete la información de la sección',
  showSteps = true
}: SectionFormProps) {
  
  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    slug: '',
    description: '',
    thumbnailImagePath: '',
    order: 1,
    allowBanner: false,
    bannerPath: '',
    courseIds: [],
    ...initialData
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  // Inicializar previsualizaciones
  useEffect(() => {
    if (initialData.thumbnailImagePath) {
      setPreviewImage(initialData.thumbnailImagePath);
    }
    if (initialData.bannerPath) {
      setPreviewBanner(initialData.bannerPath);
    }
    if (initialData.slug) {
      setAutoGenerateSlug(false);
    }
  }, [initialData]);

  // Generar slug automáticamente desde el nombre
  useEffect(() => {
    if (formData.name && autoGenerateSlug) {
      const generatedSlug = generateSlugFromName(formData.name);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, autoGenerateSlug]);

  const updateField = (field: keyof SectionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Si el usuario edita manualmente el slug, desactivar generación automática
    if (field === 'slug') {
      setAutoGenerateSlug(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'banner') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WebP');
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('El archivo es muy grande. El tamaño máximo es 10MB');
        return;
      }

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

  const handleImageUrlChange = (url: string, type: 'thumbnail' | 'banner') => {
    if (type === 'thumbnail') {
      updateField('thumbnailImagePath', url);
      setPreviewImage(url);
    } else {
      updateField('bannerPath', url);
      setPreviewBanner(url);
    }
  };

  const removeImage = (type: 'thumbnail' | 'banner') => {
    if (type === 'thumbnail') {
      setPreviewImage(null);
      updateField('thumbnailImagePath', '');
    } else {
      setPreviewBanner(null);
      updateField('bannerPath', '');
    }
  };

  const steps: FormStep[] = [
    { 
      id: 1, 
      name: 'Información Básica', 
      icon: Layers3,
      description: 'Nombre, slug y descripción de la sección'
    },
    { 
      id: 2, 
      name: 'Configuración', 
      icon: Settings,
      description: 'Orden, banner y configuraciones avanzadas'
    },
    { 
    id: 3, 
      name: 'Cursos', // NUEVO PASO
      icon: BookOpen,
      description: 'Seleccionar cursos para esta sección'
    },
    { 
      id: 4, 
      name: 'Imágenes', 
      icon: Image,
      description: 'Imagen principal y banner de la sección'
    },
    { 
      id: 5, 
      name: 'Revisión', 
      icon: Eye,
      description: 'Revisa todos los datos antes de guardar'
    }
  ];

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.name.trim() && formData.slug.trim());
      case 2:
        return formData.order > 0;
      case 3:
        return true;
      case 4:
        return true; // Las imágenes son opcionales
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canProceedToNextStep = validateCurrentStep();

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
                  onChange={(e) => updateField('slug', e.target.value)}
                  error={getErrorByField(errors, 'slug')}
                  placeholder="colaboradores, medicina-general"
                />
                <div className="mt-1 flex items-center space-x-2">
                  <Checkbox
                    id="autoGenerateSlug"
                    label="Generar automáticamente"
                    checked={autoGenerateSlug}
                    onChange={(event) => setAutoGenerateSlug(event.target.checked)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  URL final: /{formData.slug}
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
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/500 caracteres
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Input
                id="order"
                name="order"
                label="Orden de visualización *"
                type="number"
                required
                value={formData.order}
                onChange={(e) => updateField('order', parseInt(e.target.value) || 1)}
                error={getErrorByField(errors, 'order')}
                placeholder="1"
                min="1"
                max="999"
              />
              <p className="text-sm text-gray-500 mt-1">
                Determina el orden en que se mostrará la sección (menor número = primera posición)
              </p>
            </div>

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

                {formData.allowBanner && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-blue-800 mb-2">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">Banner habilitado</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Podrás subir una imagen de banner en el siguiente paso.
                    </p>
                  </div>
                )}
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
      case 3: // NUEVO PASO - Selección de cursos
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <div className="flex items-center space-x-2">
                  <Image className="h-5 w-5" />
                  <span>Imagen de la Sección</span>
                </div>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="thumbnailUpload" 
                    className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={previewImage} 
                          alt="Vista previa" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeImage('thumbnail');
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
                          <span className="font-semibold">Clic para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP hasta 10MB</p>
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
                
                <div className="relative">
                  <Input
                    id="thumbnailImagePath"
                    name="thumbnailImagePath"
                    label="URL de la imagen (opcional)"
                    type="url"
                    value={formData.thumbnailImagePath}
                    onChange={(e) => handleImageUrlChange(e.target.value, 'thumbnail')}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    error={getErrorByField(errors, 'thumbnailImagePath')}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Puedes subir un archivo o ingresar una URL directa
                  </p>
                </div>
              </div>
            </div>

            {/* Banner image */}
            {formData.allowBanner && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Imagen del Banner</span>
                  </div>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label 
                      htmlFor="bannerUpload" 
                      className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      {previewBanner ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={previewBanner} 
                            alt="Vista previa del banner" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeImage('banner');
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
                          <p className="text-xs text-gray-500">Recomendado: 1200x300px</p>
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
                    onChange={(e) => handleImageUrlChange(e.target.value, 'banner')}
                    placeholder="https://ejemplo.com/banner.jpg"
                    error={getErrorByField(errors, 'bannerPath')}
                  />
                </div>
              </div>
            )}

            {!formData.allowBanner && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-800">
                    El banner está deshabilitado. Actívalo en el paso anterior si deseas agregar una imagen de banner.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Revisión Final</span>
                </div>
              </h3>
              
              <div className="space-y-6">
                {/* Información básica */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Información Básica</h4>
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
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formData.description || <span className="text-gray-400 italic">Sin descripción</span>}
                    </p>
                  </div>
                </div>

                {/* Configuración */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Configuración</h4>
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
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cursos Asociados</h4>
                  {formData.courseIds.length > 0 ? (
                    <div className="space-y-2">
                      {formData.courseIds.map(courseId => {
                        const course = availableCourses?.find(c => c.id === courseId);
                        return course ? (
                          <div key={courseId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-900">{course.title}</span>
                            <span className="text-xs text-gray-500">/{course.slug}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay cursos seleccionados</p>
                  )}
                </div>

                {/* Imágenes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Imágenes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(formData.thumbnailImagePath || previewImage) ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de la sección</label>
                        <img 
                          src={previewImage || formData.thumbnailImagePath} 
                          alt="Vista previa" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de la sección</label>
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Sin imagen</span>
                        </div>
                      </div>
                    )}
                    
                    {formData.allowBanner && (
                      (formData.bannerPath || previewBanner) ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                          <img 
                            src={previewBanner || formData.bannerPath} 
                            alt="Vista previa del banner" 
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Sin banner</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-800">
                  Revisa cuidadosamente la información antes de guardar. 
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Layers3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>
          </div>
          {showSteps && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Paso {currentStep} de {steps.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de pasos */}
      {showSteps && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="text-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 mb-2 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-500 max-w-24">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 mt-6 ${
                      currentStep > step.id ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
        <input type="hidden" name="courseIds" value={JSON.stringify(formData.courseIds)} />

        {/* Contenido del paso actual */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          {renderStepContent()}
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <X className="h-5 w-5" />
              <span>Cancelar</span>
            </button>
            
            {showSteps && currentStep > 1 && (
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
            {showSteps && currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNextStep}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                <span>{isSubmitting ? 'Guardando...' : submitLabel}</span>
              </button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}