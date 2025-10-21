// ViewCustomizer.tsx
import React, { useState, useEffect } from 'react';

export interface ViewCustomizerProps {
    title: string;
    description?: string;
    onChange: (field: string, value: string | boolean) => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    initialCustomBackground?: boolean;
    initialBackgroundType?: 'imagen' | 'color';
    initialBackgroundImage?: string;
    initialBackgroundColor?: string;
    // Configuraciones actuales desde el estado padre
    settings?: {
        allowBackground?: boolean;
        backgroundType?: 'imagen' | 'color';
        backgroundImage?: string;
        backgroundColor?: string;
        allowCoursesHome?: boolean; // Solo para Home
    };
}

const ViewCustomizer: React.FC<ViewCustomizerProps> = ({
    title,
    description,
    onChange,
    isSubmitting = false,
    errors = {},
    initialCustomBackground = false,
    initialBackgroundType = 'color',
    initialBackgroundImage = '',
    initialBackgroundColor = '#ffffff',
    settings = {}
}) => {
    // Estados locales inicializados con valores del padre o defaults
    const [customBackground, setCustomBackground] = useState(
        settings.allowBackground ?? initialCustomBackground
    );
    const [backgroundType, setBackgroundType] = useState<'imagen' | 'color'>(
        settings.backgroundType ?? initialBackgroundType
    );
    const [backgroundImage, setBackgroundImage] = useState(
        settings.backgroundImage ?? initialBackgroundImage
    );
    const [backgroundColor, setBackgroundColor] = useState(
        settings.backgroundColor ?? initialBackgroundColor
    );

    // Sincronizar con cambios externos del estado padre
    useEffect(() => {
        if (settings.allowBackground !== undefined) {
            setCustomBackground(settings.allowBackground);
        }
        if (settings.backgroundType !== undefined) {
            setBackgroundType(settings.backgroundType);
        }
        if (settings.backgroundImage !== undefined) {
            setBackgroundImage(settings.backgroundImage);
        }
        if (settings.backgroundColor !== undefined) {
            setBackgroundColor(settings.backgroundColor);
        }
    }, [settings]);

    // Manejador para activar/desactivar fondo personalizado
    const handleCustomBackgroundChange = (checked: boolean) => {
        setCustomBackground(checked);
        onChange('customBackground', checked);
        
        // Si se desactiva, limpiar los valores
        if (!checked) {
            setBackgroundImage('');
            setBackgroundColor('#ffffff');
            onChange('backgroundImage', '');
            onChange('backgroundColor', '#ffffff');
            onChange('backgroundType', 'color');
        }
    };

    // Manejador para cambio de tipo de fondo
    const handleBackgroundTypeChange = (type: 'imagen' | 'color') => {
        setBackgroundType(type);
        onChange('backgroundType', type);
        
        // Limpiar el valor contrario
        if (type === 'imagen') {
            setBackgroundColor('#ffffff');
            onChange('backgroundColor', '#ffffff');
        } else {
            setBackgroundImage('');
            onChange('backgroundImage', '');
        }
    };

    // Manejador para cambio de imagen de fondo
    const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // En un caso real, aquí subirías el archivo al servidor
            // Por ahora, creamos una URL temporal para preview
            const imageUrl = URL.createObjectURL(file);
            setBackgroundImage(imageUrl);
            onChange('backgroundImage', imageUrl);
            // También podrías guardar el archivo para procesarlo después
            onChange('backgroundImageFile', file);
        }
    };

    // Manejador para cambio de color de fondo
    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setBackgroundColor(color);
        onChange('backgroundColor', color);
    };

    const uniqueId = (title || 'sin-titulo').replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="space-y-6">
            <div className='px-6 py-6 space-y-6'>
                <div className='py-2'>
                    {/* Título y descripción */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                        {description && (
                            <p className="text-sm text-gray-600">{description}</p>
                        )}
                    </div>
                    
                    <div className='space-y-4'>
                        {/* Checkbox para activar fondo personalizado */}
                        <div className="flex items-center">
                            <input
                                id={`customBackground-${uniqueId}`}
                                name={`customBackground-${uniqueId}`}
                                type="checkbox"
                                checked={customBackground}
                                onChange={(e) => handleCustomBackgroundChange(e.target.checked)}
                                className="h-4 w-4 bg-gray-50 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label 
                                htmlFor={`customBackground-${uniqueId}`} 
                                className="ml-2 block text-sm text-gray-700 font-medium"
                            >
                                Activar fondo personalizado
                            </label>
                        </div>
                        
                        {/* Mensaje de error para customBackground */}
                        {errors.customBackground && (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {errors.customBackground}
                            </p>
                        )}

                        {/* Opciones de tipo de fondo - Solo se muestra si está activado */}
                        {customBackground && (
                            <div className="ml-6 space-y-6 border-l-4 border-blue-200 pl-6 bg-gray-50 p-4 rounded-r-lg">
                                {/* Selector de tipo de fondo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de fondo
                                    </label>
                                    <select
                                        value={backgroundType}
                                        onChange={(e) => handleBackgroundTypeChange(e.target.value as 'imagen' | 'color')}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        disabled={isSubmitting}
                                    >
                                        <option value="color">Color sólido</option>
                                        <option value="imagen">Imagen de fondo</option>
                                    </select>
                                </div>

                                {/* Sección para imagen de fondo */}
                                {backgroundType === 'imagen' && (
                                    <div className="space-y-3">
                                        <label 
                                            htmlFor={`backgroundImage-${uniqueId}`}
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Seleccionar imagen
                                        </label>
                                        <input
                                            id={`backgroundImage-${uniqueId}`}
                                            name={`backgroundImage-${uniqueId}`}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBackgroundImageChange}
                                            className="block w-full text-sm text-gray-500 
                                                     file:mr-4 file:py-2 file:px-4 
                                                     file:rounded-full file:border-0 
                                                     file:text-sm file:font-semibold 
                                                     file:bg-blue-50 file:text-blue-700 
                                                     hover:file:bg-blue-100 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={isSubmitting}
                                        />
                                        
                                        {/* Preview de la imagen */}
                                        {backgroundImage && (
                                            <div className="mt-3">
                                                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                                                <div className="inline-block p-2 bg-white rounded-lg shadow-sm border">
                                                    <img 
                                                        src={backgroundImage} 
                                                        alt="Vista previa del fondo" 
                                                        className="h-24 w-32 object-cover rounded border"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Error para imagen */}
                                        {errors.backgroundImage && (
                                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                {errors.backgroundImage}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Sección para color de fondo */}
                                {backgroundType === 'color' && (
                                    <div className="space-y-3">
                                        <label 
                                            htmlFor={`backgroundColor-${uniqueId}`}
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Seleccionar color
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                id={`backgroundColor-${uniqueId}`}
                                                name={`backgroundColor-${uniqueId}`}
                                                type="color"
                                                value={backgroundColor}
                                                onChange={handleBackgroundColorChange}
                                                className="h-12 w-16 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            />
                                            <input
                                                type="text"
                                                value={backgroundColor}
                                                onChange={(e) => handleBackgroundColorChange(e)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="#0052cc"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        
                                        {/* Vista previa del color */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Vista previa:</span>
                                            <div 
                                                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                                                style={{ backgroundColor: backgroundColor }}
                                            ></div>
                                        </div>
                                        
                                        {/* Error para color */}
                                        {errors.backgroundColor && (
                                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                {errors.backgroundColor}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCustomizer;