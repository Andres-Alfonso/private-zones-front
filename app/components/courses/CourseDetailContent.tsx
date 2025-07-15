// app/components/courses/CourseDetailContent.tsx
import { CheckCircle, BookOpen, Users, Award, Star } from "lucide-react";
import { Course } from "~/api/types/course.types";

interface CourseDetailContentProps {
  course: Course;
}

export function CourseDetailContent({ course }: CourseDetailContentProps) {
  return (
    <div className="space-y-8">
      {/* Descripción */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Descripción del Curso</h2>
        </div>
        <div className="prose prose-lg text-gray-700 max-w-none whitespace-pre-line leading-relaxed">
          {course.description}
        </div>
      </div>

      {/* Qué aprenderás */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Qué aprenderás</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Fundamentos de React y su ecosistema",
            "Componentes funcionales y hooks avanzados",
            "Manejo eficiente de estado y props",
            "React Router para navegación",
            "Integración con APIs REST",
            "Testing con Jest y React Testing Library",
            "Optimización de rendimiento",
            "Mejores prácticas y patrones de diseño"
          ].map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-800 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructor */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tu Instructor</h2>
        </div>
        
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">
              {course.instructor.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{course.instructor}</h3>
            <p className="text-lg text-blue-600 font-semibold mb-4">Desarrollador Senior & Instructor</p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Experto en desarrollo frontend con más de 8 años de experiencia en la industria. 
              Ha trabajado en empresas como Google y Meta, liderando equipos de desarrollo y 
              creando aplicaciones web escalables que sirven a millones de usuarios.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-yellow-800">4.9 (2,847 reseñas)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Award className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-800">23 cursos</span>
              </div>
              <div className="flex items-center space-x-2 text-sm bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-800">45,230 estudiantes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
