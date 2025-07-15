// app/routes/courses/_index.tsx

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Course, CourseLevel, CourseFilters } from "~/api/types/course.types";
import { useCurrentUser } from "~/context/AuthContext";

// Componentes
import { CourseHero } from "~/components/courses/CourseHero";
import { CourseFilters as CourseFiltersComponent } from "~/components/courses/CourseFilters";
import { CourseGrid } from "~/components/courses/CourseGrid";
import { Pagination } from "~/components/courses/Pagination";

// Loader para cargar datos del servidor
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const filters: CourseFilters = {
      search: url.searchParams.get('search') || undefined,
      category: url.searchParams.get('category') || undefined,
      level: url.searchParams.get('level') as CourseLevel || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '12'),
    };

    // En producción, aquí harías la llamada al API desde el servidor
    // const response = await CoursesAPI.getAll(filters);
    
    // Datos simulados para desarrollo
    const mockData = {
      data: [
        {
          id: '1',
          title: 'Introducción a React',
          description: 'Aprende los fundamentos de React desde cero con ejercicios prácticos y proyectos reales',
          instructor: 'Juan Pérez',
          duration: 40,
          level: CourseLevel.BEGINNER,
          category: 'Frontend',
          price: 99.99,
          thumbnail: 'https://via.placeholder.com/400x250/4F46E5/ffffff?text=React+Course',
          isActive: true,
          maxStudents: 50,
          currentStudents: 35,
          startDate: '2024-02-01T00:00:00Z',
          endDate: '2024-04-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Node.js Avanzado',
          description: 'Domina Node.js y construye APIs robustas y escalables con las mejores prácticas',
          instructor: 'María García',
          duration: 60,
          level: CourseLevel.ADVANCED,
          category: 'Backend',
          price: 149.99,
          thumbnail: 'https://via.placeholder.com/400x250/059669/ffffff?text=Node.js+Advanced',
          isActive: true,
          maxStudents: 30,
          currentStudents: 22,
          startDate: '2024-02-15T00:00:00Z',
          endDate: '2024-05-15T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          title: 'Diseño UX/UI Moderno',
          description: 'Principios avanzados de diseño de experiencia de usuario y interfaces modernas',
          instructor: 'Ana Rodríguez',
          duration: 35,
          level: CourseLevel.INTERMEDIATE,
          category: 'Diseño',
          price: 129.99,
          thumbnail: 'https://via.placeholder.com/400x250/DC2626/ffffff?text=UX%2FUI+Design',
          isActive: true,
          maxStudents: 40,
          currentStudents: 38,
          startDate: '2024-03-01T00:00:00Z',
          endDate: '2024-04-15T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          title: 'DevOps con Docker',
          description: 'Aprende containerización y despliegue con Docker y Kubernetes',
          instructor: 'Carlos López',
          duration: 45,
          level: CourseLevel.INTERMEDIATE,
          category: 'DevOps',
          price: 179.99,
          thumbnail: 'https://via.placeholder.com/400x250/7C3AED/ffffff?text=DevOps+Docker',
          isActive: true,
          maxStudents: 25,
          currentStudents: 15,
          startDate: '2024-03-15T00:00:00Z',
          endDate: '2024-05-30T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '5',
          title: 'Machine Learning con Python',
          description: 'Introducción práctica al aprendizaje automático usando Python y sus librerías',
          instructor: 'Dr. Elena Martínez',
          duration: 55,
          level: CourseLevel.INTERMEDIATE,
          category: 'Data Science',
          price: 199.99,
          thumbnail: 'https://via.placeholder.com/400x250/0891B2/ffffff?text=ML+Python',
          isActive: true,
          maxStudents: 35,
          currentStudents: 28,
          startDate: '2024-04-01T00:00:00Z',
          endDate: '2024-06-30T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '6',
          title: 'Flutter Mobile Development',
          description: 'Crea aplicaciones móviles nativas para iOS y Android con Flutter',
          instructor: 'Miguel Santos',
          duration: 50,
          level: CourseLevel.BEGINNER,
          category: 'Mobile',
          price: 159.99,
          thumbnail: 'https://via.placeholder.com/400x250/06B6D4/ffffff?text=Flutter+Mobile',
          isActive: true,
          maxStudents: 45,
          currentStudents: 12,
          startDate: '2024-04-15T00:00:00Z',
          endDate: '2024-07-15T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ],
      total: 6,
      page: 1,
      limit: 12
    };

    return json({ 
      courses: mockData,
      categories: ['Frontend', 'Backend', 'Diseño', 'DevOps', 'Data Science', 'Mobile'],
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading courses:', error);
    return json({ 
      courses: { data: [], total: 0, page: 1, limit: 12 }, 
      categories: [],
      error: error.message || 'Error al cargar los cursos' 
    });
  }
};

export default function CoursesIndex() {
  const { courses, categories, error } = useLoaderData<{
    courses: { data: Course[], total: number, page: number, limit: number },
    categories: string[],
    error: string | null
  }>();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const { hasRole } = useCurrentUser();

  // Estados para filtros
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localSearch) {
      newParams.set('search', localSearch);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Manejar filtros
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchParams({});
    setLocalSearch('');
  };

  // Paginación
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  // Calcular estadísticas para el hero
  const totalStudents = courses.data.reduce((sum, course) => sum + course.currentStudents, 0);

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-gray-200/50 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <CourseHero 
        totalCourses={courses.total}
        totalStudents={totalStudents}
        onExploreClick={() => {
          const coursesSection = document.getElementById('courses-grid');
          coursesSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Filtros y búsqueda */}
      <CourseFiltersComponent
        searchTerm={localSearch}
        onSearchChange={setLocalSearch}
        onSearchSubmit={handleSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filterCategory={searchParams.get('category') || ''}
        onCategoryChange={(value) => handleFilterChange('category', value)}
        filterLevel={searchParams.get('level') || ''}
        onLevelChange={(value) => handleFilterChange('level', value)}
        categories={categories}
        totalResults={courses.total}
        onClearFilters={handleClearFilters}
      />

      {/* Grid de cursos */}
      <div id="courses-grid">
        <CourseGrid 
          courses={courses.data} 
          hasAdminRole={hasRole('admin') || hasRole('instructor')}
        />
      </div>

      {/* Paginación */}
      {courses.total > courses.limit && (
        <Pagination
          currentPage={courses.page}
          totalPages={Math.ceil(courses.total / courses.limit)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}