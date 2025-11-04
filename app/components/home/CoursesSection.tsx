// app/components/home/CoursesSection.tsx

import { Link } from "@remix-run/react";
import { GraduationCap, Clock, Play } from "lucide-react";

interface CoursesSectionProps {
    textColor?: string;
}

export default function CoursesSection({ textColor }: CoursesSectionProps) {
    // Usar color personalizado si existe y no está vacío, sino usar colores por defecto
    const shouldUseCustomColor = textColor && textColor.trim() !== '';
    
    // Datos mock - aquí conectarías con tu API de cursos
    const mockCourses = [
        {
            id: "1",
            title: "Introducción a la Seguridad",
            description: "Fundamentos básicos de seguridad en el trabajo",
            progress: 75,
            duration: "2h 30m",
            status: "En progreso",
            thumbnail: "https://formacionvirtual.clinicaupb.org.co/storage/Médicos_y_otros_asistenciales_qTAEduLWU9/clubs/c8d714db1f75ada9e513d8520ce652bb67e09fb301616.jpg"
        },
        {
            id: "2", 
            title: "Prevención de Riesgos",
            description: "Identificación y prevención de riesgos laborales",
            progress: 100,
            duration: "1h 45m",
            status: "Completado",
            thumbnail: "https://formacionvirtual.clinicaupb.org.co/storage/Prueba_grupo_31j41OPKtj/clubs/2a04e9db076e1652e9cca0b521d3a5fc6435c6f505c6e.jpg"
        },
        {
            id: "3",
            title: "Primeros Auxilios",
            description: "Técnicas básicas de primeros auxilios",
            progress: 25,
            duration: "3h 15m",
            status: "En progreso",
            thumbnail: "https://formacionvirtual.clinicaupb.org.co/storage/Curso_|_Reactivovigilancia_(Programas_Especiales_d/clubs/94a7a7b5423145b226edfac26800867567b65b7c6de34.jpg"
        },
        {
            id: "4",
            title: "Manejo de Equipos",
            description: "Uso correcto de equipos de protección personal",
            progress: 50,
            duration: "1h 20m",
            status: "En progreso",
            thumbnail: null
        }
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 
                    className={`text-2xl font-bold flex items-center gap-3 ${!shouldUseCustomColor ? 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent' : ''}`}
                    style={shouldUseCustomColor ? { color: textColor } : {}}
                >
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    Mis Cursos
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockCourses.map((course) => (
                    <Link 
                        key={course.id} 
                        to={`/courses/${course.id}`}
                        className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-200"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                            {course.thumbnail ? (
                                <img 
                                    src={course.thumbnail} 
                                    alt={course.title}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img 
                                        src="/assets/default-course.svg" 
                                        alt="Curso por defecto"
                                        className="w-16 h-16 opacity-60 group-hover:opacity-80 transition-opacity"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = `
                                                <div class="w-full h-full flex items-center justify-center">
                                                    <svg class="w-16 h-16 text-blue-400 opacity-60 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                                    </svg>
                                                </div>
                                            `;
                                        }}
                                    />
                                </div>
                            )}
                            
                            {/* Overlay con status y progreso */}
                            <div className="absolute top-3 left-3">
                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border ${
                                    course.status === 'Completado' 
                                        ? 'bg-green-100/90 text-green-800 border-green-200/50' 
                                        : 'bg-white/90 text-blue-800 border-blue-200/50'
                                }`}>
                                    {course.status}
                                </span>
                            </div>
                            
                            {/* Barra de progreso en overlay */}
                            {course.progress < 100 && (
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full h-1.5">
                                        <div 
                                            className="bg-white h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Contenido */}
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">
                                {course.title}
                            </h3>
                            
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {course.description}
                            </p>
                            
                            {/* Footer con duración y botón de acción */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {course.duration}
                                    </span>
                                    <span className="text-blue-600 font-medium">
                                        {course.progress}%
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-blue-600 text-xs font-medium group-hover:text-blue-700 transition-colors">
                                    <Play className="h-3 w-3" />
                                    {course.status === 'Completado' ? 'Revisar' : 'Continuar'}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}