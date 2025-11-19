// app/routes/courses/$id.edit.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { BookOpen, DollarSign, Calendar, Image, AlertCircle, Settings, Users, Palette, Tag } from 'lucide-react';
import { Course, CourseLevel, UpdateCourseRequest, CourseFormData } from '~/api/types/course.types';
import { CoursesAPI } from '~/api/endpoints/courses';
import { RoleGuard } from '~/components/AuthGuard';
import { createApiClientFromRequest } from '~/api/client';

// Componentes del formulario
import { CourseFormHeader } from '~/components/courses/CourseFormHeader';
import { CourseFormSection } from '~/components/courses/CourseFormSection';
import { CourseBasicFields } from '~/components/courses/CourseBasicFields';
import { CoursePricingFields } from '~/components/courses/CoursePricingFields';
import { CourseDateFields } from '~/components/courses/CourseDateFields';
import { CourseImageField } from '~/components/courses/CourseImageField';
import { CourseFormActions } from '~/components/courses/CourseFormActions';
import { CourseVisibilityFields } from '~/components/courses/CourseVisibilityFields';
import { CourseImageFields } from '~/components/courses/CourseImageFields';
import { CourseAcademicFields } from '~/components/courses/CourseAcademicFields';

interface LoaderData {
  course: Course | null;
  error: string | null;
}

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
}

// Validación del formulario (misma que en create)
function validateCourseForm(formData: FormData) {
  const errors: Array<{ field: string; message: string }> = [];

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const instructor = formData.get('instructor') as string;
  const duration = formData.get('duration') as string;
  const category = formData.get('category') as string;
  const price = formData.get('price') as string;
  const maxStudents = formData.get('maxStudents') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  if (!title || title.trim().length < 5) {
    errors.push({ field: 'title', message: 'El título debe tener al menos 5 caracteres' });
  }

  if (!description || description.trim().length < 20) {
    errors.push({ field: 'description', message: 'La descripción debe tener al menos 20 caracteres' });
  }

  if (!instructor || instructor.trim().length < 2) {
    errors.push({ field: 'instructor', message: 'El instructor es obligatorio' });
  }

  if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
    errors.push({ field: 'duration', message: 'La duración debe ser un número mayor a 0' });
  }

  if (!category || category.trim().length < 2) {
    errors.push({ field: 'category', message: 'La categoría es obligatoria' });
  }

  if (!price || isNaN(Number(price)) || Number(price) < 0) {
    errors.push({ field: 'price', message: 'El precio debe ser un número válido' });
  }

  if (!maxStudents || isNaN(Number(maxStudents)) || Number(maxStudents) <= 0) {
    errors.push({ field: 'maxStudents', message: 'El número máximo de estudiantes debe ser mayor a 0' });
  }

  if (!startDate) {
    errors.push({ field: 'startDate', message: 'La fecha de inicio es obligatoria' });
  }

  if (!endDate) {
    errors.push({ field: 'endDate', message: 'La fecha de fin es obligatoria' });
  }

  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    errors.push({ field: 'endDate', message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const loader: LoaderFunction = async ({ params, request }) => {
  try {
    const courseId = params.id as string;
    
    if (!courseId) {
      throw new Error('ID de curso no proporcionado');
    }

    const requestApiClient = createApiClientFromRequest(request);
    const course = await CoursesAPI.getById(courseId, requestApiClient);

    return json<LoaderData>({ 
      course: course as any, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading course for edit:', error);
    return json<LoaderData>({ 
      course: null, 
      error: error.message || 'Error al cargar el curso'
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const courseId = params.id as string;

  // Validar formulario
  const validation = validateCourseForm(formData);
  
  if (!validation.isValid) {
    return json<ActionData>({ 
      errors: validation.errors 
    }, { status: 400 });
  }

  try {
    const updateData: UpdateCourseRequest = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      instructor: formData.get('instructor') as string,
      duration: Number(formData.get('duration')),
      level: formData.get('level') as CourseLevel,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      maxStudents: Number(formData.get('maxStudents')),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      thumbnail: formData.get('thumbnail') as string || undefined,
      isActive: formData.get('isActive') === 'true',
    };

    const requestApiClient = createApiClientFromRequest(request);
    const course = await CoursesAPI.update(courseId, updateData, requestApiClient);
    
    return json<ActionData>({ 
      success: true
    });
    
  } catch (error: any) {
    console.error('Error updating course:', error);
    
    return json<ActionData>({ 
      generalError: error.message || 'Error al actualizar el curso'
    }, { status: 500 });
  }
};

export default function EditCourse() {
  return (
    <RoleGuard requiredRoles={['superadmin', 'admin', 'instructor']} requireAll={false}>
      <EditCourseContent />
    </RoleGuard>
  );
}

function EditCourseContent() {
  const { course, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<CourseFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  const [imageFiles, setImageFiles] = useState<{
    coverImage?: File;
    menuImage?: File;
    thumbnailImage?: File;
  }>({});

  // Cargar datos del curso en el formulario
  useEffect(() => {
    if (course) {
      const translation = course.translations.find(t => t.languageCode === "es") 
        || course.translations[0];

      const formatDate = (date: Date | string | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
      };

      setFormData({
        title: translation?.title || "",
        description: translation?.description || "",
        instructor: course.metadata?.instructor || "",
        level: course.configuration?.metadata?.level || "",
        category: course.configuration?.category || "",
        maxEnrollments: course.configuration?.maxEnrollments || 1500,
        startDate: formatDate(course.configuration?.startDate),
        endDate: formatDate(course.configuration?.endDate),
        thumbnailImage: course.configuration?.thumbnailImage || "",
        coverImage: course.configuration?.coverImage || "",
        menuImage: course.configuration?.menuImage || "",
        allowSelfEnrollment: course.configuration?.allowSelfEnrollment ? true : false,
        requiresApproval: course.configuration?.requiresApproval ? true : false,
        enrollmentStartDate: formatDate(course.configuration?.enrollmentStartDate),
        enrollmentEndDate: formatDate(course.configuration?.enrollmentEndDate),
        invitationLink: course.configuration?.invitationLink || "",
        acronym: course.configuration?.acronym || "",
        colorTitle: course.configuration?.colorTitle || "#1e40af",
        order: course.configuration?.order || 0,
        isActive: course.isActive ?? true,
        estimatedHours: course.configuration?.estimatedHours || 0,
        status: course.configuration?.status || 'draft',
        visibility: course.configuration?.visibility || 'private',
        code: course.configuration?.code || '',
      });
    }
  }, [course]);


  // Redirigir si se actualizó exitosamente
  useEffect(() => {
    if (actionData?.success) {
      navigate(`/courses/${course?.id}`);
    }
  }, [actionData, navigate, course?.id]);

  // Manejar cambios en el formulario
  const handleChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Manejar carga de archivos de imagen
  // const handleImageUpload = (field: string, file: File | null) => {
  //   if (file) {
  //     setImageFiles(prev => ({ ...prev, [field]: file }));
  //     // Crear URL temporal para preview
  //     const imageUrl = URL.createObjectURL(file);
  //     handleChange(`${field}Url`, imageUrl);
  //   } else {
  //     setImageFiles(prev => ({ ...prev, [field]: undefined }));
  //     handleChange(`${field}Url`, '');
  //   }
  //   setHasChanges(true);
  // };

  // Manejar cancelación
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
        // navigate(`/courses/${course?.id}`);
        navigate(`/courses/manage`);
      }
    } else {
      // navigate(`/courses/${course?.id}`);
      navigate(`/courses/manage`);
    }
  };

  // Categorías predefinidas
  const categories = [
    'Frontend', 'Backend', 'Full Stack', 'Diseño', 'DevOps', 
    'Data Science', 'Machine Learning', 'Mobile', 'Testing'
  ];

  if (error || !course) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-gray-200/50 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'Curso no encontrado'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <CourseFormHeader
        title="Editar Curso"
        subtitle={`Modifica la información del curso "${course.title}"`}
        isEditing={true}
        hasChanges={hasChanges}
        isSubmitting={isSubmitting}
        cancelLink={`/courses/manage`}
      />

      {/* Mensajes de estado */}
      {actionData?.generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center shadow-lg">
          <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <div className="font-bold">Error al actualizar el curso</div>
            <div className="text-sm">{actionData.generalError}</div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <Form method="post" className="space-y-8" noValidate>
        {/* Estado del curso */}
        <CourseFormSection
          title="Estado del Curso"
          description="Controla la visibilidad del curso"
          icon={<Settings className="h-6 w-6" />}
        >
          <div className="flex items-center space-x-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={course.isActive}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="isActive" className="text-lg font-bold text-blue-900 cursor-pointer">
                Curso activo y visible para estudiantes
              </label>
              <p className="text-sm text-blue-700 mt-1">
                Cuando está activo, los estudiantes pueden ver e inscribirse al curso
              </p>
            </div>
          </div>
        </CourseFormSection>

        {/* Información básica */}
        <CourseFormSection
          title="Información Básica"
          description="Actualiza los aspectos fundamentales de tu curso"
          icon={<BookOpen className="h-6 w-6" />}
        >
          <CourseBasicFields
            formData={formData}
            errors={errors}
            categories={categories}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />
        </CourseFormSection>

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

        {/* Pricing y capacidad */}
        {/* <CourseFormSection
          title="Capacidad"
          description="Número máximo de estudiantes"
          icon={<DollarSign className="h-6 w-6" />}
        >
          <CoursePricingFields
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            currentStudents={course.currentStudents}
          />
        </CourseFormSection> */}

        {/* Fechas del curso */}
        <CourseFormSection
          title="Fechas del Curso"
          description="Actualiza el cronograma de tu curso"
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

        {/* Imagen del curso */}
        {/* <CourseFormSection
          title="Imagen del Curso"
          description="Cambia la imagen que representa tu curso"
          icon={<Image className="h-6 w-6" />}
        >
          <CourseImageField
            formData={formData}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />
        </CourseFormSection> */}

        <CourseFormSection
          title="Imágenes del Curso"
          description="Sube imágenes atractivas que representen tu curso"
          icon={<Image className="h-6 w-6" />}
        >
          <CourseImageFields
            formData={formData}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            // onImageUpload={handleImageUpload}
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

        {/* Botones de acción */}
        <CourseFormActions
          isSubmitting={isSubmitting}
          hasChanges={hasChanges}
          onCancel={handleCancel}
          submitText="Guardar Cambios"
          cancelText="Cancelar"
        />
      </Form>
    </div>
  );
}