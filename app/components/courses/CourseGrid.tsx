// app/components/courses/CourseGrid.tsx
import { BookOpen } from "lucide-react";
import { Link } from "@remix-run/react";
import { Course } from "~/api/types/course.types";
import { CourseCard } from "./CourseCard";

interface CourseGridProps {
  courses: Course[];
  hasAdminRole?: boolean;
}

export function CourseGrid({ courses, hasAdminRole }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-gray-200/50 max-w-md mx-auto">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No se encontraron cursos</h3>
          <p className="text-gray-600 mb-8">
            Intenta ajustar tus filtros de búsqueda o explora otras categorías
          </p>
          {hasAdminRole && (
            <Link
              to="/courses/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Crear primer curso
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}