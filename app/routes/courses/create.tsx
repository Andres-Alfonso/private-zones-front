// app/routes/courses/create.tsx

import { json, redirect, ActionFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  BookOpen, DollarSign, Calendar, Image, AlertCircle, Settings, 
  Globe, Users, Tag, Clock, Palette, Eye, Link2, Upload
} from 'lucide-react';
import { CourseLevel, CreateCourseRequest, CourseFormData, CourseVisibility, CourseStatus, CourseIntensity } from '~/api/types/course.types';
import { RoleGuard } from '~/components/AuthGuard';

// Componentes del formulario
import { CourseFormHeader } from '~/components/courses/CourseFormHeader';
import { CourseFormSection } from '~/components/courses/CourseFormSection';
import { CourseBasicFields } from '~/components/courses/CourseBasicFields';
import { CourseAcademicFields } from '~/components/courses/CourseAcademicFields';
import { CoursePricingFields } from '~/components/courses/CoursePricingFields';
import { CourseDateFields } from '~/components/courses/CourseDateFields';
import { CourseImageFields } from '~/components/courses/CourseImageFields';
import { CourseVisibilityFields } from '~/components/courses/CourseVisibilityFields';
import { CourseTranslationFields } from '~/components/courses/CourseTranslationFields';
import { CourseViewConfigFields } from '~/components/courses/CourseViewConfigFields';
import { CourseFormActions } from '~/components/courses/CourseFormActions';
import { generateAcronym } from '~/utils/acronymGenerator';
import { CoursesAPI } from '~/api/endpoints/courses';
import { useTenant } from '~/context/TenantContext';

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
  courseId?: string;
}

// Validación del formulario expandida
function validateCourseForm(formData: FormData) {
  const errors: Array<{ field: string; message: string }> = [];

  // console.log('Validating course form data:', Object.fromEntries(formData.entries()));

  // Validaciones básicas
  const title = formData.get('title') as string;
  // console.log('Validating title:', title);
  const description = formData.get('description') as string;
  // const instructor = formData.get('instructor') as string;
  // const category = formData.get('category') as string;
  const acronym = formData.get('acronym') as string;
  const estimatedHours = formData.get('estimatedHours') as string;

  if (!title || title.trim().length < 5) {
    errors.push({ field: 'title', message: 'El título debe tener al menos 5 caracteres' });
  }

  if (!description || description.trim().length < 20) {
    errors.push({ field: 'description', message: 'La descripción debe tener al menos 20 caracteres' });
  }

  // if (!instructor || instructor.trim().length < 2) {
  //   errors.push({ field: 'instructor', message: 'El instructor es obligatorio' });
  // }

  // if (!category || category.trim().length < 2) {
  //   errors.push({ field: 'category', message: 'La categoría es obligatoria' });
  // }

  if (acronym && acronym.length > 10) {
    errors.push({ field: 'acronym', message: 'Las siglas no pueden exceder 10 caracteres' });
  }

  if (estimatedHours && (isNaN(Number(estimatedHours)) || Number(estimatedHours) <= 0)) {
    errors.push({ field: 'estimatedHours', message: 'Las horas estimadas deben ser un número mayor a 0' });
  }

  // Validaciones de fechas
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const enrollmentStartDate = formData.get('enrollmentStartDate') as string;
  const enrollmentEndDate = formData.get('enrollmentEndDate') as string;

  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    errors.push({ field: 'endDate', message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
  }

  if (enrollmentStartDate && enrollmentEndDate && new Date(enrollmentStartDate) >= new Date(enrollmentEndDate)) {
    errors.push({ field: 'enrollmentEndDate', message: 'La fecha de fin de inscripciones debe ser posterior al inicio' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // Validar formulario
  const validation = validateCourseForm(formData);
  
  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  try {
    // Procesar archivos de imagen si existen
    const coverImageFile = formData.get('coverImageFile') as File;
    const menuImageFile = formData.get('menuImageFile') as File;
    const thumbnailImageFile = formData.get('thumbnailImageFile') as File;

    // En producción, aquí subirías las imágenes a tu servicio de almacenamiento
    // const coverImageUrl = coverImageFile ? await uploadImage(coverImageFile) : null;
    // const menuImageUrl = menuImageFile ? await uploadImage(menuImageFile) : null;
    // const thumbnailImageUrl = thumbnailImageFile ? await uploadImage(thumbnailImageFile) : null;

    const courseData: CreateCourseRequest = {
      // Información básica
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      tenantId: formData.get('tenantId') as string,
      description: formData.get('description') as string,
      // instructor: formData.get('instructor') as string,
      // category: formData.get('category') as string,
      subcategory: formData.get('subcategory') as string,

      // Información académica
      acronym: formData.get('acronym') as string,
      code: formData.get('code') as string,
      // level: formData.get('level') as CourseLevel,
      intensity: Number(formData.get('intensity')) || 0,
      estimatedHours: Number(formData.get('estimatedHours')) || 0,

      // Configuración
      visibility: formData.get('visibility') as CourseVisibility,
      status: formData.get('status') as CourseStatus,
      colorTitle: formData.get('colorTitle') as string,
      order: Number(formData.get('order')) || 0,

      // Fechas
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      enrollmentStartDate: formData.get('enrollmentStartDate') as string,
      enrollmentEndDate: formData.get('enrollmentEndDate') as string,

      // Inscripciones
      maxEnrollments: Number(formData.get('maxEnrollments')) || null,
      requiresApproval: formData.get('requiresApproval') === 'true',
      allowSelfEnrollment: formData.get('allowSelfEnrollment') === 'true',
      invitationLink: formData.get('invitationLink') as string,

      // Imágenes (URLs o archivos procesados)
      coverImage: formData.get('coverImageUrl') as string, // || coverImageUrl
      menuImage: formData.get('menuImageUrl') as string, // || menuImageUrl
      thumbnailImage: formData.get('thumbnailImageUrl') as string, // || thumbnailImageUrl

      // Traducciones
      translations: {
        es: {
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          metadata: {
            tags: (formData.get('tagsEs') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
            keywords: (formData.get('keywordsEs') as string)?.split(',').map(k => k.trim()).filter(Boolean) || []
          }
        },
        en: {
          title: formData.get('titleEn') as string,
          description: formData.get('descriptionEn') as string,
          metadata: {
            tags: (formData.get('tagsEn') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
            keywords: (formData.get('keywordsEn') as string)?.split(',').map(k => k.trim()).filter(Boolean) || []
          }
        }
      },

      // Configuración de vistas
      // viewsConfig: {
      //   contents: {
      //     isActive: formData.get('contentsViewActive') === 'true',
      //     backgroundType: formData.get('contentsBackgroundType') as string,
      //     backgroundColor: formData.get('contentsBackgroundColor') as string,
      //     customTitle: formData.get('contentsCustomTitle') as string
      //   },
      //   forums: {
      //     isActive: formData.get('forumsViewActive') === 'true',
      //     backgroundType: formData.get('forumsBackgroundType') as string,
      //     backgroundColor: formData.get('forumsBackgroundColor') as string,
      //     customTitle: formData.get('forumsCustomTitle') as string
      //   }
      //   // Agregar más vistas según sea necesario
      // }
    };

    // En producción, aquí llamarías al API
    const course = await CoursesAPI.create(courseData);
    
    // Simulamos una respuesta exitosa
    const mockCourse = { id: 'new-course-id', ...courseData };
    
    return json<ActionData>({ 
      success: true,
      courseId: course.id
    });
    
  } catch (error: any) {
    console.error('Error creating course:', error);
    
    return json<ActionData>({ 
      generalError: error.message || 'Error al crear el curso'
    }, { status: 500 });
  }
};

export default function CreateCourse() {
  return (
    <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
      <CreateCourseContent />
    </RoleGuard>
  );
}

function CreateCourseContent() {
  const actionData = useActionData<ActionData>();
  const [localErrors, setLocalErrors] = useState<Array<{ field: string; message: string }>>([]);
  const navigation = useNavigation();
  const navigate = useNavigate();

  const { state: tenantState } = useTenant();
  const { tenant } = tenantState;

  const [formData, setFormData] = useState<Partial<any>>({
    // Básicos
    title: '',
    description: '',
    slug: '',
    tenantId: tenant?.id || '',
    // instructor: '',
    // category: '',
    subcategory: '',
    // level: CourseLevel.BEGINNER,

    // Académicos
    acronym: '',
    code: '',
    intensity: 0,
    estimatedHours: '',

    // Configuración
    visibility: CourseVisibility.PRIVATE,
    status: CourseStatus.DRAFT,
    colorTitle: '#1e40af',
    order: 0,

    // Fechas
    startDate: '',
    endDate: '',
    enrollmentStartDate: '',
    enrollmentEndDate: '',

    // Inscripciones
    maxEnrollments: '',
    requiresApproval: false,
    allowSelfEnrollment: true,
    invitationLink: '',

    // Imágenes
    coverImageUrl: '',
    menuImageUrl: '',
    thumbnailImageUrl: '',

    // Traducciones EN
    titleEn: '',
    descriptionEn: '',
    tagsEs: '',
    tagsEn: '',
    keywordsEs: '',
    keywordsEn: '',

    // Vistas
    contentsViewActive: true,
    forumsViewActive: true,
    contentsBackgroundType: 'color',
    contentsBackgroundColor: '#ffffff',
    forumsBackgroundType: 'color',
    forumsBackgroundColor: '#ffffff'
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFiles, setImageFiles] = useState<{
    coverImage?: File;
    menuImage?: File;
    thumbnailImage?: File;
  }>({});

  const [isAcronymManuallyEdited, setIsAcronymManuallyEdited] = useState(false);

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  // Redirigir si se creó exitosamente
  useEffect(() => {
    if (actionData?.success && actionData?.courseId) {
      navigate(`/courses/${actionData.courseId}`);
    }
  }, [actionData, navigate]);

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si se está cambiando el título y el acrónimo no ha sido editado manualmente
      if (field === 'title' && !isAcronymManuallyEdited) {
        const newAcronym = generateAcronym(value as string);
        newData.acronym = newAcronym;
      }
      
      // Si se está editando el acrónimo manualmente, marcar como editado
      if (field === 'acronym') {
        setIsAcronymManuallyEdited(true);
      }
      
      return newData;
    });
    setHasChanges(true);
  };

  // Función para resetear la edición manual del acrónimo
  const resetAcronymToAuto = () => {
    const newAcronym = generateAcronym(formData.title as string);
    setFormData(prev => ({ ...prev, acronym: newAcronym }));
    setIsAcronymManuallyEdited(false);
    setHasChanges(true);
  };

  // función para limpiar errores
  const clearFieldError = (field: string) => {
    setLocalErrors(prev => prev.filter(error => error.field !== field));
  };

  const allErrors = [...(actionData?.errors || []), ...localErrors];

  // Manejar carga de archivos de imagen
  const handleImageUpload = (field: string, file: File | null) => {
    if (file) {
      setImageFiles(prev => ({ ...prev, [field]: file }));
      // Crear URL temporal para preview
      const imageUrl = URL.createObjectURL(file);
      handleChange(`${field}Url`, imageUrl);
    } else {
      setImageFiles(prev => ({ ...prev, [field]: undefined }));
      handleChange(`${field}Url`, '');
    }
    setHasChanges(true);
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
        navigate('/courses');
      }
    } else {
      navigate('/courses');
    }
  };

  // Categorías predefinidas
  const categories = [
    'Frontend', 'Backend', 'Full Stack', 'Diseño', 'DevOps', 
    'Data Science', 'Machine Learning', 'Mobile', 'Testing',
    'Medicina', 'Enfermería', 'Cardiología', 'Pediatría'
  ];

  const steps = [
    { id: 1, name: 'Información Básica', icon: BookOpen },
    { id: 2, name: 'Configuración Académica', icon: Tag },
    { id: 3, name: 'Fechas y Inscripciones', icon: Calendar },
    { id: 4, name: 'Imágenes y Diseño', icon: Image },
    // { id: 5, name: 'Traducciones', icon: Globe },
    { id: 5, name: 'Configuración de Vistas', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header mejorado */}
        <CourseFormHeader
          title="Crear Nuevo Curso"
          subtitle="Crea un curso increíble que inspire a tus estudiantes con nuestro asistente paso a paso"
          hasChanges={hasChanges}
          isSubmitting={isSubmitting}
          cancelLink="/courses"
        />

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
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
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
                      currentStep > step.id ? 'bg-green-400' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mensajes de estado */}
        {actionData?.generalError && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center shadow-lg">
            <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
              <div className="font-bold">Error al crear el curso</div>
              <div className="text-sm">{actionData.generalError}</div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <Form method="post" className="space-y-8" noValidate encType="multipart/form-data">
          {/* Campos ocultos para archivos */}
          {Object.entries(imageFiles).map(([key, file]) => (
            file && (
              <input 
                key={key}
                type="file" 
                name={`${key}File`} 
                style={{ display: 'none' }}
                ref={(input) => {
                  if (input && file) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                  }
                }}
              />
            )
          ))}

          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <CourseFormSection
              title="Información Básica"
              description="Define los aspectos fundamentales de tu curso"
              icon={<BookOpen className="h-6 w-6" />}
            >
              <CourseBasicFields
                formData={formData}
                errors={allErrors}
                categories={categories}
                isSubmitting={isSubmitting}
                onChange={handleChange}
                onClearError={clearFieldError}
              />
            </CourseFormSection>
          )}

          {/* Paso 2: Configuración Académica */}
          {currentStep === 2 && (
            <CourseFormSection
              title="Configuración Académica"
              description="Configura los aspectos académicos y organizacionales"
              icon={<Tag className="h-6 w-6" />}
            >
              <CourseAcademicFields
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onChange={handleChange}
              />
            </CourseFormSection>
          )}

          {/* Paso 3: Fechas y Inscripciones */}
          {currentStep === 3 && (
            <>
              <CourseFormSection
                title="Fechas del Curso"
                description="Establece el cronograma de tu curso"
                icon={<Calendar className="h-6 w-6" />}
              >
                <CourseDateFields
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onChange={handleChange}
                />
              </CourseFormSection>

              <CourseFormSection
                title="Configuración de Inscripciones"
                description="Define cómo los estudiantes pueden inscribirse"
                icon={<Users className="h-6 w-6" />}
              >
                <CourseVisibilityFields
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onChange={handleChange}
                />
              </CourseFormSection>
            </>
          )}

          {/* Paso 4: Imágenes y Diseño */}
          {currentStep === 4 && (
            <>
              <CourseFormSection
                title="Imágenes del Curso"
                description="Sube imágenes atractivas que representen tu curso"
                icon={<Image className="h-6 w-6" />}
              >
                <CourseImageFields
                  formData={formData}
                  isSubmitting={isSubmitting}
                  onChange={handleChange}
                  onImageUpload={handleImageUpload}
                />
              </CourseFormSection>

              <CourseFormSection
                title="Personalización de Diseño"
                description="Personaliza los colores y apariencia del curso"
                icon={<Palette className="h-6 w-6" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Color del Título
                    </label>
                    <input
                      type="color"
                      name="colorTitle"
                      value={formData.colorTitle || '#1e40af'}
                      onChange={(e) => handleChange('colorTitle', e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Orden de Listado
                    </label>
                    <input
                      type="number"
                      name="order"
                      min="0"
                      value={formData.order || 0}
                      onChange={(e) => handleChange('order', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CourseFormSection>
            </>
          )}

          {/* Paso 5: Traducciones */}
          {/* {currentStep === 5 && (
            <CourseFormSection
              title="Traducciones"
              description="Proporciona traducciones para hacer tu curso accesible globalmente"
              icon={<Globe className="h-6 w-6" />}
            >
              <CourseTranslationFields
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onChange={handleChange}
              />
            </CourseFormSection>
          )} */}

          {/* Paso 6: Configuración de Vistas */}
          {currentStep === 5 && (
            <CourseFormSection
              title="Configuración de Vistas"
              description="Personaliza cómo se verán las diferentes secciones del curso"
              icon={<Eye className="h-6 w-6" />}
            >
              <CourseViewConfigFields
                formData={formData}
                isSubmitting={isSubmitting}
                onChange={handleChange}
              />
            </CourseFormSection>
          )}

          {/* Navegación de pasos */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <span className="text-sm text-gray-600 font-medium">
                Paso {currentStep} de {steps.length}
              </span>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  Siguiente →
                </button>
              ) : (
                <CourseFormActions
                  isSubmitting={isSubmitting}
                  hasChanges={hasChanges}
                  onCancel={handleCancel}
                  submitText="Crear Curso"
                  cancelText="Cancelar"
                />
              )}
            </div>
          </div>

          <input type="hidden" name="title" value={formData.title || ''} />
          <input type="hidden" name="slug" value={formData.slug || ''} />
          <input type="hidden" name="description" value={formData.description || ''} />
          <input type="hidden" name="subcategory" value={formData.subcategory || ''} />
          <input type="hidden" name="acronym" value={formData.acronym || ''} />
          <input type="hidden" name="code" value={formData.code || ''} />
          <input type="hidden" name="intensity" value={formData.intensity || 0} />
          <input type="hidden" name="estimatedHours" value={formData.estimatedHours || ''} />
          <input type="hidden" name="visibility" value={formData.visibility || ''} />
          <input type="hidden" name="status" value={formData.status || ''} />
          <input type="hidden" name="colorTitle" value={formData.colorTitle || ''} />
          <input type="hidden" name="order" value={formData.order || 0} />
          <input type="hidden" name="startDate" value={formData.startDate || ''} />
          <input type="hidden" name="endDate" value={formData.endDate || ''} />
          <input type="hidden" name="enrollmentStartDate" value={formData.enrollmentStartDate || ''} />
          <input type="hidden" name="enrollmentEndDate" value={formData.enrollmentEndDate || ''} />
          <input type="hidden" name="maxEnrollments" value={formData.maxEnrollments || ''} />
          <input type="hidden" name="requiresApproval" value={formData.requiresApproval ? 'true' : 'false'} />
          <input type="hidden" name="allowSelfEnrollment" value={formData.allowSelfEnrollment ? 'true' : 'false'} />
          <input type="hidden" name="invitationLink" value={formData.invitationLink || ''} />
          <input type="hidden" name="coverImageUrl" value={formData.coverImageUrl || ''} />
          <input type="hidden" name="menuImageUrl" value={formData.menuImageUrl || ''} />
          <input type="hidden" name="thumbnailImageUrl" value={formData.thumbnailImageUrl || ''} />
          <input type="hidden" name="titleEn" value={formData.titleEn || ''} />
          <input type="hidden" name="descriptionEn" value={formData.descriptionEn || ''} />
          <input type="hidden" name="tagsEs" value={formData.tagsEs || ''} />
          <input type="hidden" name="tagsEn" value={formData.tagsEn || ''} />
          <input type="hidden" name="keywordsEs" value={formData.keywordsEs || ''} />
          <input type="hidden" name="keywordsEn" value={formData.keywordsEn || ''} />
          <input type="hidden" name="contentsViewActive" value={formData.contentsViewActive ? 'true' : 'false'} />
          <input type="hidden" name="forumsViewActive" value={formData.forumsViewActive ? 'true' : 'false'} />
          <input type="hidden" name="contentsBackgroundType" value={formData.contentsBackgroundType || ''} />
          <input type="hidden" name="contentsBackgroundColor" value={formData.contentsBackgroundColor || ''} />
          <input type="hidden" name="contentsCustomTitle" value={formData.contentsCustomTitle || ''} />
          <input type="hidden" name="forumsBackgroundType" value={formData.forumsBackgroundType || ''} />
          <input type="hidden" name="forumsBackgroundColor" value={formData.forumsBackgroundColor || ''} />
          <input type="hidden" name="forumsCustomTitle" value={formData.forumsCustomTitle || ''} />
          <input type="hidden" name="tenantId" value={formData.tenantId || ''} />

          {/* Campos ocultos para archivos */}
          {Object.entries(imageFiles).map(([key, file]) => (
            file && (
              <input 
                key={key}
                type="file" 
                name={`${key}File`} 
                style={{ display: 'none' }}
                ref={(input) => {
                  if (input && file) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                  }
                }}
              />
            )
          ))}
        </Form>
      </div>
    </div>
  );
}