// app/components/home/SectionsSection.tsx

import { Link } from "@remix-run/react";
import { Building2, Users, Calendar, ArrowRight, Folder } from "lucide-react";

interface SectionsSectionProps {
    sections: {
        data: any[];
        total: number;
    };
    textColor?: string;
}

export default function SectionsSection({ sections, textColor }: SectionsSectionProps) {
    // Usar color personalizado si existe y no está vacío, sino usar colores por defecto
    const shouldUseCustomColor = textColor && textColor.trim() !== '';
    
    if (!sections.data || sections.data.length === 0) {
        return (
            <div>
                <div className="mb-6">
                    <h2 
                        className={`text-2xl font-bold flex items-center gap-3 ${!shouldUseCustomColor ? 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent' : ''}`}
                        style={shouldUseCustomColor ? { color: textColor } : {}}
                    >
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        Secciones
                    </h2>
                </div>
                
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                        <Folder className="w-12 h-12 mx-auto" />
                    </div>
                    <p 
                        className={!shouldUseCustomColor ? 'text-gray-600' : ''}
                        style={shouldUseCustomColor ? { color: textColor } : {}}
                    >
                        No hay secciones disponibles
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 
                    className={`text-2xl font-bold flex items-center gap-3 ${!shouldUseCustomColor ? 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent' : ''}`}
                    style={shouldUseCustomColor ? { color: textColor } : {}}
                >
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    Secciones
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sections.data.slice(0, 8).map((section: any) => (
                    <Link 
                        key={section.id} 
                        to={`/home/sections/${section.id}`}
                        className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-200"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                            {section.thumbnailImagePath ? (
                                <img 
                                    src={section.thumbnailImagePath} 
                                    alt={section.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img 
                                        src="/assets/default-section.svg" 
                                        alt="Sección por defecto"
                                        className="w-16 h-16 opacity-60 group-hover:opacity-80 transition-opacity"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = `
                                                <div class="w-full h-full flex items-center justify-center">
                                                    <svg class="w-16 h-16 text-blue-400 opacity-60 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                    </svg>
                                                </div>
                                            `;
                                        }}
                                    />
                                </div>
                            )}
                            
                            {/* Overlay con status */}
                            <div className="absolute top-3 left-3">
                                <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-white/90 backdrop-blur-sm text-blue-800 border border-blue-200/50">
                                    {section.status || 'Activa'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Contenido */}
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">
                                {section.name}
                            </h3>
                            
                            {section.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {section.description}
                                </p>
                            )}
                            
                            {/* Metadatos */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-3">
                                    {section.userCount && (
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {section.userCount}
                                        </span>
                                    )}
                                    {section.createdAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(section.createdAt).toLocaleDateString('es-ES', { 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    )}
                                </div>
                                <ArrowRight className="h-3 w-3 text-blue-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}