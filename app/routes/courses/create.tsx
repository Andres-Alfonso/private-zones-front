// app/routes/courses/create.tsx

import { json, redirect, ActionFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Save, X, Upload, AlertCircle } from 'lucide-react';
import { CourseLevel, CreateCourseRequest, CourseFormData } from '~/api/types/course.types';
// import { CoursesAPI } from '~/api/endpoints/courses';
import Input from '~/components/ui/Input';
import { RoleGuard } from '~/components/AuthGuard';

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
  courseId?: string;
}

// Validación del formulario
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

  // Validaciones
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
    const courseData: CreateCourseRequest = {
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
    };

    // En producción, aquí llamarías al API
    // const course = await CoursesAPI.create(courseData);
    
    // Simulamos una respuesta exitosa
    const mockCourse = { id: 'new-course-id', ...courseData };
    
    return json<ActionData>({ 
      success: true,
      courseId: mockCourse.id
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
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<CourseFormData>>({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: CourseLevel.BEGINNER,
    category: '',
    price: '',
    maxStudents: '',
    startDate: '',
    endDate: ''
  });

  const isSubmitting = navigation.state === 'submitting';
  const errors = actionData?.errors || [];

  // Redirigir si se creó exitosamente
  useEffect(() => {
    if (actionData?.success && actionData?.courseId) {
      // Redirigir al curso creado o a la lista
      navigate(`/courses/${actionData.courseId}`);
    }
  }, [actionData, navigate]);

  // Obtener error por campo
  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Categorías predefinidas (en producción podrías cargarlas del API)
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
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Curso</h1>
            <p className="text-gray-600 mt-1">
              Complete la información para crear un nuevo curso en la plataforma
            </p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
            <span>Cancelar</span>
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {actionData?.generalError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {actionData.generalError}
        </div>
      )}

      {/* Formulario */}
      <Form method="post" className="space-y-6" noValidate>
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
              value={formData.title}
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
                value={formData.description}
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
                value={formData.instructor}
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
                  value={formData.category}
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
                  value={formData.level}
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
                placeholder="40"
                value={formData.duration}
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
                placeholder="99.99"
                value={formData.price}
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
                placeholder="50"
                value={formData.maxStudents}
                onChange={(e) => handleChange('maxStudents', e.target.value)}
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
                value={formData.startDate}
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
                value={formData.endDate}
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
              helperText="URL de la imagen que representará el curso"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Crear Curso</span>
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}