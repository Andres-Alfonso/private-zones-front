// app/components/contents/MetadataEditor.tsx

import { Info } from "lucide-react";

interface MetadataEditorProps {
    contentType: string;
    metadata: Record<string, any>;
    onMetadataChange: (metadata: Record<string, any>) => void;
}

export const MetadataEditor = ({
    contentType,
    metadata,
    onMetadataChange
}: MetadataEditorProps) => {
    const updateMetadata = (key: string, value: any) => {
        onMetadataChange({ ...metadata, [key]: value });
    };

    const renderMetadataFields = () => {
        switch (contentType) {
            case 'video':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duración (minutos)
                            </label>
                            <input
                                type="number"
                                value={metadata.duration || ''}
                                onChange={(e) => updateMetadata('duration', parseInt(e.target.value) || 0)}
                                placeholder="25"
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Calidad
                            </label>
                            <select
                                value={metadata.quality || ''}
                                onChange={(e) => updateMetadata('quality', e.target.value)}
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccionar calidad</option>
                                <option value="720p">720p HD</option>
                                <option value="1080p">1080p Full HD</option>
                                <option value="4k">4K Ultra HD</option>
                            </select>
                        </div> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Idioma
                            </label>
                            <select
                                value={metadata.language || ''}
                                onChange={(e) => updateMetadata('language', e.target.value)}
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccionar idioma</option>
                                <option value="es">Español</option>
                                <option value="en">Inglés</option>
                            </select>
                        </div>
                        {/* <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={metadata.hasSubtitles || false}
                                    onChange={(e) => updateMetadata('hasSubtitles', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Tiene subtítulos</span>
                            </label>
                        </div> */}
                    </div>
                );

            case 'document':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de páginas
                            </label>
                            <input
                                type="number"
                                value={metadata.pages || ''}
                                onChange={(e) => updateMetadata('pages', parseInt(e.target.value) || 0)}
                                placeholder="15"
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Formato
                            </label>
                            <select
                                value={metadata.format || ''}
                                onChange={(e) => updateMetadata('format', e.target.value)}
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccionar formato</option>
                                <option value="pdf">PDF</option>
                                <option value="doc">DOC</option>
                                <option value="ppt">PPT</option>
                                <option value="xls">XLS</option>
                            </select>
                        </div>
                        {/* <div className="md:col-span-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={metadata.downloadable || false}
                                    onChange={(e) => updateMetadata('downloadable', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Permitir descarga</span>
                            </label>
                        </div> */}
                    </div>
                );

            case 'image':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resolución
                            </label>
                            <input
                                type="text"
                                value={metadata.resolution || ''}
                                onChange={(e) => updateMetadata('resolution', e.target.value)}
                                placeholder="1920x1080"
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Formato
                            </label>
                            <select
                                value={metadata.format || ''}
                                onChange={(e) => updateMetadata('format', e.target.value)}
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccionar formato</option>
                                <option value="jpg">JPG</option>
                                <option value="png">PNG</option>
                                <option value="gif">GIF</option>
                                <option value="svg">SVG</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Texto alternativo (Alt)
                            </label>
                            <input
                                type="text"
                                value={metadata.altText || ''}
                                onChange={(e) => updateMetadata('altText', e.target.value)}
                                placeholder="Descripción de la imagen para accesibilidad"
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                );

            case 'embed':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Plataforma
                            </label>
                            <select
                                value={metadata.platform || ''}
                                onChange={(e) => updateMetadata('platform', e.target.value)}
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccionar plataforma</option>
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                                <option value="codepen">CodePen</option>
                                <option value="jsfiddle">JSFiddle</option>
                                <option value="other">Otra</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={metadata.interactive || false}
                                    onChange={(e) => updateMetadata('interactive', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Contenido interactivo</span>
                            </label>
                        </div>
                    </div>
                );

            case 'scorm':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Versión SCORM
                            </label>
                            <select
                                value={metadata.version || ''}
                                onChange={(e) => updateMetadata('version', e.target.value)}
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">Seleccionar versión</option>
                                <option value="1.2">SCORM 1.2</option>
                                <option value="2004">SCORM 2004</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiempo estimado (minutos)
                            </label>
                            <input
                                type="number"
                                value={metadata.estimatedTime || ''}
                                onChange={(e) => updateMetadata('estimatedTime', parseInt(e.target.value) || 0)}
                                placeholder="60"
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de actividades
                            </label>
                            <input
                                type="number"
                                value={metadata.activities || ''}
                                onChange={(e) => updateMetadata('activities', parseInt(e.target.value) || 0)}
                                placeholder="5"
                                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={metadata.hasEvaluation || false}
                                    onChange={(e) => updateMetadata('hasEvaluation', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Incluye evaluación</span>
                            </label>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        <Info className="mx-auto h-8 w-8 mb-2" />
                        <p>Selecciona un tipo de contenido para configurar sus metadatos</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Metadatos del Contenido</h3>
                <p className="text-gray-600 text-sm">Configura información adicional específica para este tipo de contenido</p>
            </div>

            {renderMetadataFields()}

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas (separadas por comas)
                </label>
                <input
                    type="text"
                    value={metadata.tags?.join(', ') || ''}
                    onChange={(e) => updateMetadata('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    placeholder="react, javascript, frontend, componentes"
                    className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>

            {/* Dificultad */}
            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de dificultad
                </label>
                <select
                    value={metadata.difficulty || ''}
                    onChange={(e) => updateMetadata('difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="">Seleccionar dificultad</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                </select>
            </div> */}
        </div>
    );
};