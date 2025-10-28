// app/components/courses/CourseCard.tsx
import { Clock, Users, Star, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "@remix-run/react";
import { Course, CourseLevel } from "~/api/types/course.types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case CourseLevel.INTERMEDIATE:
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case CourseLevel.ADVANCED:
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getLevelText = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return 'Principiante';
      case CourseLevel.INTERMEDIATE:
        return 'Intermedio';
      case CourseLevel.ADVANCED:
        return 'Avanzado';
      default:
        return level;
    }
  };

  const isPopular = course.currentStudents > 20;
  const progressPercentage = (course.currentStudents / course.maxStudents) * 100;

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
      {/* Imagen con overlay */}
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        {course.thumbnail && (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        
        {/* Badges superpuestos */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${getLevelColor(course.level)}`}>
            {getLevelText(course.level)}
          </span>
          {isPopular && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Popular</span>
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg">
            {course.category}
          </span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="p-6">
        {/* Título y descripción */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link 
            to={`/courses/${course.id}`} 
            className="hover:text-blue-600 transition-colors"
          >
            {course.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {course.instructor.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{course.instructor}</p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{course.duration}h</span>
          </div>
          <div className="flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded-lg">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{course.currentStudents}/{course.maxStudents}</span>
          </div>
          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">4.5</span>
          </div>
        </div>

        {/* Barra de progreso de inscripciones */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Inscripciones</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Footer con precio y botón */}
        <div className="flex items-center justify-between">
          <div>
            {/* <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${course.price}
            </div> */}
            <div className="text-xs text-gray-500">USD</div>
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Ver Curso
          </Link>
        </div>
      </div>
    </div>
  );
}