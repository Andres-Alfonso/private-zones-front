// app/components/courses/CourseHero.tsx
import { Sparkles, TrendingUp, Users } from "lucide-react";

interface CourseHeroProps {
  totalCourses: number;
  totalStudents: number;
  onExploreClick?: () => void;
}

export function CourseHero({ totalCourses, totalStudents, onExploreClick }: CourseHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <span className="text-yellow-200 font-semibold">Destacado</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Descubre Nuevas
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Habilidades
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Aprende de expertos de la industria con cursos diseñados para impulsar tu carrera profesional
          </p>
          
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <TrendingUp className="h-5 w-5 text-green-300" />
              <span className="text-white font-medium">{totalCourses}+ Cursos</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="h-5 w-5 text-blue-300" />
              <span className="text-white font-medium">{totalStudents}+ Estudiantes</span>
            </div>
          </div>
          
          <button
            onClick={onExploreClick}
            className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Explorar Cursos
          </button>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/30 to-pink-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/30 to-purple-400/30 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}