// app/routes/sections/$id.edit.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  Save, X, AlertCircle, Layers3, Hash, FileText, 
  Image, Palette, Settings, Eye, Upload, Globe,
  Trash2, Archive
} from 'lucide-react';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateSectionForm, getErrorByField } from '~/utils/sectionValidation';

interface Section {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  description: string | null;
  thumbnailImagePath: string | null;
  order: number | null;
  allowBanner: boolean;
  bannerPath: string | null;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface LoaderData {
  section: Section | null;
  error: string | null;
}

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
}

interface SectionFormData {
  name: string;
  slug: string;
  description: string;
  thumbnailImagePath: string;
  order: number;
  allowBanner: boolean;
  bannerPath: string;
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const sectionId = params.id as string;
    
    if (!sectionId) {
      throw new Error('ID de sección no proporcionado');
    }
    
    // Datos mock - en una aplicación real, estos vendrían de la base de datos
    const mockSection: Section = {
      id: sectionId,
      tenantId: 'tenant-1',
      slug: 'colaboradores',
      name: 'Colaboradores',
      description: 'Sección dedicada a contenido para colaboradores internos de la empresa',
      thumbnailImagePath: '/images/sections/colaboradores.jpg',
      order: 1,
      allowBanner: true,
      bannerPath: '/images/banners/colaboradores-banner.jpg',
      courseCount: 12,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    };

    return json<LoaderData>({ 
      section: mockSection, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading section for edit:', error);
    return json<LoaderData>({ 
      section: null, 
      error: error.message || 'Error al cargar la sección'
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const sectionId = params.id as string;
  const intent = formData.get('intent') as string;

  try {
    switch (intent) {
      case 'update':
        // Validar formulario
        const validation = validateSectionForm(formData);
        
        if (!validation.isValid) {
          return json<ActionData>({ 
            errors: validation.errors 
          }, { status: 400 });
        }

        const updateData = {
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          description: formData.get('description') as string,
          thumbnailImagePath: formData.get('thumbnailImagePath') as string,
          order: parseInt(formData.get('order') as string) || null,
          allowBanner: formData.get('allowBanner') === 'on',
          bannerPath: formData.get('bannerPath') as string,
        };

        // Aquí se llamaría al API para actualizar la sección
        console.log('Actualizar sección:', sectionId, updateData);
        
        return json<ActionData>({ success: true });

      case 'delete':
        // Aquí se llamaría al API para eliminar la sección
        console.log('Eliminar sección:', sectionId);
        
        return redirect('/sections?deleted=true');

      default:
        return json<ActionData>({ 
          generalError: 'Acción no válida' 
        }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Error in action:', error);
    
    return json<ActionData>({ 
      generalError: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
};

export default function EditSection() {
  const { section, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    slug: '',
    description: '',
    thumbnailImagePath: '',
    order: 1,
    allowBanner: false,
    bannerPath: '',
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  // Inicializar datos del formulario
  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        slug: section.slug,
        description: section.description || '',
        thumbnailImagePath: section.thumbnailImagePath || '',
        order: section.order || 1,
        allowBanner: section.allowBanner,
        bannerPath: section.bannerPath || '',
      });
      setPreviewImage(section.thumbnailImagePath);
      setPreviewBanner(section.bannerPath);
    }
  }, [section]);

  // Mostrar mensaje de éxito
  useEffect(() => {
    if (actionData?.success) {
      const timer = setTimeout(() => {
        // El mensaje se ocultará automáticamente
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData?.success]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la sección</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/sections')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Volver a Secciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4">Cargando sección...</p>
        </div>
      </div>
    );
  }

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
    { id: 3, name: 'Imágenes', icon: Image },
    { id: 4, name: 'Revisión', icon: Eye }
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
                  onChange={(e) => updateField('slug', e.target.value)}
                  error={getErrorByField(errors, 'slug')}
                  placeholder="colaboradores, medicina-general"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL actual: /{formData.slug}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la sección</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">ID:</span>
                  <span className="text-sm text-gray-900 font-mono">{section.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Creada:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(section.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Última actualización:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(section.updatedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cursos asociados:</span>
                  <span className="text-sm text-gray-900">{section.courseCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
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
                  onChange={(e) => {
                    updateField('thumbnailImagePath', e.target.value);
                    setPreviewImage(e.target.value);
                  }}
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
                  
                  <Input
                    id="bannerPath"
                    name="bannerPath"
                    label="URL del banner (opcional)"
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
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revisión de Cambios</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                    {formData.name !== section.name && (
                      <p className="text-xs text-amber-600">Cambiado de: {section.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <p className="mt-1 text-sm text-gray-900">/{formData.slug}</p>
                    {formData.slug !== section.slug && (
                      <p className="text-xs text-amber-600">Cambiado de: /{section.slug}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.description || <span className="text-gray-400 italic">Sin descripción</span>}
                  </p>
                  {formData.description !== (section.description || '') && (
                    <p className="text-xs text-amber-600">
                      Cambiado de: {section.description || 'Sin descripción'}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Orden</label>
                    <p className="mt-1 text-sm text-gray-900">#{formData.order}</p>
                    {formData.order !== (section.order || 1) && (
                      <p className="text-xs text-amber-600">Cambiado de: #{section.order}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formData.allowBanner ? 'Permitido' : 'No permitido'}
                    </p>
                    {formData.allowBanner !== section.allowBanner && (
                      <p className="text-xs text-amber-600">
                        Cambiado de: {section.allowBanner ? 'Permitido' : 'No permitido'}
                      </p>
                    )}
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

            {hasChanges ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
                  <p className="text-sm text-amber-800">
                    Se han detectado cambios. Revisa cuidadosamente antes de guardar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-800">
                    No se han realizado cambios en esta sección.
                  </p>
                </div>
              </div>
            )}
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
                <h1 className="text-2xl font-bold text-gray-900">Editar Sección</h1>
                <p className="text-gray-600">{section.name} • /{section.slug}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Paso {currentStep} de {steps.length}
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar sección"
              >
                <Trash2 className="h-5 w-5" />
              </button>
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
          <input type="hidden" name="intent" value="update" />
          
          {/* Campos ocultos para persistir datos */}
          <input type="hidden" name="name" value={formData.name} />
          <input type="hidden" name="slug" value={formData.slug} />
          <input type="hidden" name="description" value={formData.description} />
          <input type="hidden" name="thumbnailImagePath" value={formData.thumbnailImagePath} />
          <input type="hidden" name="order" value={formData.order} />
          <input type="hidden" name="allowBanner" value={formData.allowBanner ? 'on' : ''} />
          <input type="hidden" name="bannerPath" value={formData.bannerPath} />

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
                  disabled={isSubmitting || !hasChanges}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Save className="h-5 w-5" />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              )}
            </div>
          </div>
        </Form>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¿Eliminar sección?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Esta acción no se puede deshacer. La sección "{section.name}" y todos sus datos asociados serán eliminados permanentemente.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <Form method="post" className="flex-1">
                    <input type="hidden" name="intent" value="delete" />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de éxito */}
        {actionData?.success && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
            Sección actualizada con éxito
          </div>
        )}
      </div>
    </div>
  );
}