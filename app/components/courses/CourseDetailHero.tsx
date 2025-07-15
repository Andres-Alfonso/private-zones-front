// app/components/courses/CourseDetailHero.tsx
import { Clock, Users, Star, Calendar, Award, TrendingUp, Sparkles } from "lucide-react";
import { Course, CourseLevel } from "~/api/types/course.types";

interface CourseDetailHeroProps {
  course: Course;
  isEnrolled?: boolean;
}

export function CourseDetailHero({ course, isEnrolled }: CourseDetailHeroProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPopular = course.currentStudents > 20;

  return (
    <div className="relative overflow-hidden">
      {/* Imagen del curso */}
      {course.thumbnail && (
        <div className="aspect-video lg:aspect-[21/9] overflow-hidden rounded-3xl shadow-2xl relative">
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getLevelColor(course.level)}`}>
                  {getLevelText(course.level)}
                </span>
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-bold rounded-full shadow-lg">
                  {course.category}
                </span>
                {isPopular && (
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Popular</span>
                  </span>
                )}
                {!course.isActive && (
                  <span className="px-4 py-2 bg-gray-500/90 backdrop-blur-sm text-white text-sm font-bold rounded-full shadow-lg">
                    Inactivo
                  </span>
                )}
                {isEnrolled && (
                  <span className="px-4 py-2 bg-green-500/90 backdrop-blur-sm text-white text-sm font-bold rounded-full shadow-lg flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Inscrito</span>
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Métricas en hero */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">{course.instructor}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">{course.duration} horas</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">{course.currentStudents} estudiantes</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium">4.5 (120 reseñas)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}