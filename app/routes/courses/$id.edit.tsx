// app/routes/courses/$id.edit.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { Course, CourseLevel, UpdateCourseRequest, CourseFormData } from '~/api/types/course.types';
// import { CoursesAPI } from '~/api/endpoints/courses';
import Input from '~/components/ui/Input';
import { RoleGuard } from '~/components/AuthGuard';

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

Aprenderás los conceptos fundamentales de React, incluyendo componentes, estado, props, hooks, y el ecosistema de React. Al final del curso, serás capaz de construir aplicaciones web modernas utilizando React.`,
      instructor: 'Juan Pérez',
      duration: 40,
      level: CourseLevel.BEGINNER,
      category: 'Frontend',
      price: 99.99,
      thumbnail: 'https://via.placeholder.com/800x400',
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
    <RoleGuard requiredRoles={['admin', 'instructor']} requireAll={false}>
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
        endDate: formatDate(course.endDate)
      });
    }
  }, [course]);

  // Redirigir si se actualizó exitosamente
  useEffect(() => {
    if (actionData?.success) {
      navigate(`/courses/${course?.id}`);
    }
  }, [actionData, navigate, course?.id]);

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600 mb-6">{error || 'Curso no encontrado'}</p>
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  // Obtener error por campo
  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Categorías predefinidas
  const categories = [
    'Frontend', 'Backend', 'Full Stack', 'Diseño', 'DevOps', 
    'Data Science', 'Machine Learning', 'Mobile', 'Testing'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Curso</h1>
            <p className="text-gray-600 mt-1">
              Modifica la información del curso "{course.title}"
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/courses/${course.id}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de cambios sin guardar */}
      {hasChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Tienes cambios sin guardar. Asegúrate de guardar antes de salir.
        </div>
      )}

      {/* Mensajes de estado */}
      {actionData?.generalError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.generalError}
        </div>
      )}

      {/* Formulario */}
      <Form method="post" className="space-y-6" noValidate>
        {/* Estado del curso */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Estado del Curso</h2>
          </div>
          
          <div className="px-6 py-6">
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                defaultChecked={course.isActive}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Curso activo y visible para estudiantes
              </label>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Información Básica</h2>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            {/* Título */}
            <Input
              type="text"
              id="title"
              name="title"
              label="Título del Curso"
              required
              error={getErrorByField('title')}
              disabled={isSubmitting}
              placeholder="Ej: Introducción a React"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                disabled={isSubmitting}
                placeholder="Describe el contenido y objetivos del curso..."
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  getErrorByField('description') 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {getErrorByField('description') && (
                <p className="mt-1 text-sm text-red-600">{getErrorByField('description')}</p>
              )}
            </div>

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instructor */}
              <Input
                type="text"
                id="instructor"
                name="instructor"
                label="Instructor"
                required
                error={getErrorByField('instructor')}
                disabled={isSubmitting}
                placeholder="Nombre del instructor"
                value={formData.instructor || ''}
                onChange={(e) => handleChange('instructor', e.target.value)}
              />

              {/* Categoría */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  disabled={isSubmitting}
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    getErrorByField('category') 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {getErrorByField('category') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorByField('category')}</p>
                )}
              </div>

              {/* Nivel */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel *
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  disabled={isSubmitting}
                  value={formData.level || ''}
                  onChange={(e) => handleChange('level', e.target.value as CourseLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={CourseLevel.BEGINNER}>Principiante</option>
                  <option value={CourseLevel.INTERMEDIATE}>Intermedio</option>
                  <option value={CourseLevel.ADVANCED}>Avanzado</option>
                </select>
              </div>

              {/* Duración */}
              <Input
                type="number"
                id="duration"
                name="duration"
                label="Duración (horas)"
                required
                min="1"
                error={getErrorByField('duration')}
                disabled={isSubmitting}
                value={formData.duration || ''}
                onChange={(e) => handleChange('duration', e.target.value)}
              />

              {/* Precio */}
              <Input
                type="number"
                id="price"
                name="price"
                label="Precio (USD)"
                required
                min="0"
                step="0.01"
                error={getErrorByField('price')}
                disabled={isSubmitting}
                value={formData.price || ''}
                onChange={(e) => handleChange('price', e.target.value)}
              />

              {/* Máximo estudiantes */}
              <Input
                type="number"
                id="maxStudents"
                name="maxStudents"
                label="Máximo de Estudiantes"
                required
                min="1"
                error={getErrorByField('maxStudents')}
                disabled={isSubmitting}
                value={formData.maxStudents || ''}
                onChange={(e) => handleChange('maxStudents', e.target.value)}
                helperText={`Actualmente hay ${course.currentStudents} estudiantes inscritos`}
              />
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Fechas del Curso</h2>
          </div>
          
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha de inicio */}
              <Input
                type="date"
                id="startDate"
                name="startDate"
                label="Fecha de Inicio"
                required
                error={getErrorByField('startDate')}
                disabled={isSubmitting}
                value={formData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />

              {/* Fecha de fin */}
              <Input
                type="date"
                id="endDate"
                name="endDate"
                label="Fecha de Fin"
                required
                error={getErrorByField('endDate')}
                disabled={isSubmitting}
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Imagen del curso */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Imagen del Curso</h2>
          </div>
          
          <div className="px-6 py-6">
            <Input
              type="url"
              id="thumbnail"
              name="thumbnail"
              label="URL de la Imagen"
              disabled={isSubmitting}
              placeholder="https://ejemplo.com/imagen.jpg"
              defaultValue={course.thumbnail || ''}
              helperText="URL de la imagen que representará el curso"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/courses/${course.id}`)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}