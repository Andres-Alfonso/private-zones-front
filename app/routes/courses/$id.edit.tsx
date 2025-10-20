// app/routes/courses/$id.edit.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { BookOpen, DollarSign, Calendar, Image, AlertCircle, Settings } from 'lucide-react';
import { Course, CourseLevel, UpdateCourseRequest, CourseFormData } from '~/api/types/course.types';
// import { CoursesAPI } from '~/api/endpoints/courses';
import { RoleGuard } from '~/components/AuthGuard';

// Componentes del formulario
import { CourseFormHeader } from '~/components/courses/CourseFormHeader';
import { CourseFormSection } from '~/components/courses/CourseFormSection';
import { CourseBasicFields } from '~/components/courses/CourseBasicFields';
import { CoursePricingFields } from '~/components/courses/CoursePricingFields';
import { CourseDateFields } from '~/components/courses/CourseDateFields';
import { CourseImageField } from '~/components/courses/CourseImageField';
import { CourseFormActions } from '~/components/courses/CourseFormActions';

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

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const courseId = params.id as string;
    
    if (!courseId) {
      throw new Error('ID de curso no proporcionado');
    }

    // En producción: const course = await CoursesAPI.getById(courseId);
    
    // Datos simulados para edición
    const mockCourse: Course = {
      id: courseId,
      title: 'Introducción a React',
      description: `Este curso está diseñado para desarrolladores que quieren aprender React desde cero. 

Aprenderás los conceptos fundamentales de React, incluyendo componentes, estado, props, hooks, y el ecosistema de React. Al final del curso, serás capaz de construir aplicaciones web modernas utilizando React.

El curso incluye:
- Fundamentos de React y su ecosistema
- Componentes funcionales y de clase  
- Hooks (useState, useEffect, useContext)
- Manejo de formularios
- React Router
- Estado global con Context API
- Mejores prácticas
- Proyecto final`,
      instructor: 'Juan Pérez',
      duration: 40,
      level: CourseLevel.BEGINNER,
      category: 'Frontend',
      price: 99.99,
      thumbnail: 'https://via.placeholder.com/800x400/4F46E5/ffffff?text=React+Course',
      isActive: true,
      maxStudents: 50,
      currentStudents: 23,
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-04-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    return json<LoaderData>({ 
      course: mockCourse, 
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

    // En producción: const course = await CoursesAPI.update(courseId, updateData);
    
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

  // Cargar datos del curso en el formulario
  useEffect(() => {
    if (course) {
      const formatDate = (dateString: string) => {
        return new Date(dateString).toISOString().split('T')[0];
      };

      setFormData({
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        duration: course.duration.toString(),
        level: course.level,
        category: course.category,
        price: course.price.toString(),
        maxStudents: course.maxStudents.toString(),
        startDate: formatDate(course.startDate),
        endDate: formatDate(course.endDate),
        thumbnail: course.thumbnail || ''
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

  // Manejar cancelación
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
        navigate(`/courses/${course?.id}`);
      }
    } else {
      navigate(`/courses/${course?.id}`);
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
        cancelLink={`/courses/${course.id}`}
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

        {/* Pricing y capacidad */}
        <CourseFormSection
          title="Precio y Capacidad"
          description="Modifica el precio y número máximo de estudiantes"
          icon={<DollarSign className="h-6 w-6" />}
        >
          <CoursePricingFields
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            currentStudents={course.currentStudents}
          />
        </CourseFormSection>

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

        {/* Imagen del curso */}
        <CourseFormSection
          title="Imagen del Curso"
          description="Cambia la imagen que representa tu curso"
          icon={<Image className="h-6 w-6" />}
        >
          <CourseImageField
            formData={formData}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />
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