// components/tenant/viewCustomizers/HomeViewCustomizer.tsx
import React, { useState, useEffect } from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

// Interfaz específica para configuraciones del Home
export interface HomeAdditionalSettings {
    // Configuración de cursos
    allowCoursesHome?: boolean;
    showPrivateCourses?: boolean; // Solo si allowCoursesHome está habilitado

    // Configuración de secciones
    allowSectionsHome?: boolean;
    selectedSections?: string[]; // IDs de secciones seleccionadas

    textColor?: string;

    // Configuración de banner
    enableBanner?: boolean;
    bannerType?: 'image' | 'video';
    bannerImageUrl?: string;
    bannerVideoUrl?: string;
    bannerPosition?: 'top' | 'center' | 'bottom';

    // Títulos personalizados multiidioma
    customTitles?: {
        en?: string;
        es?: string;
    };

    // Configuraciones adicionales del home
    showWelcomeMessage?: boolean;
    showQuickActions?: boolean;
    showRecentActivity?: boolean;
}

// Extender las props para incluir configuraciones específicas del home
interface HomeViewCustomizerProps extends SpecificViewCustomizerProps {
    // Props adicionales específicas del Home
    availableSections?: Array<{ id: string; name: string; }>;
    homeSettings?: {
        customBackground?: boolean;
        backgroundType?: 'imagen' | 'color';
        backgroundImage?: string;
        backgroundColor?: string;
        additionalSettings?: HomeAdditionalSettings;
    };
}

export const HomeViewCustomizer: React.FC<HomeViewCustomizerProps> = ({
    onChange,
    isSubmitting = false,
    errors = {},
    settings,
    availableSections = [],
    homeSettings,
    ...props
}) => {
    // Estados locales para configuraciones específicas del Home
    const [homeConfig, setHomeConfig] = useState<HomeAdditionalSettings>({
        allowCoursesHome: false,
        showPrivateCourses: false,
        allowSectionsHome: false,
        selectedSections: [],
        textColor: '#000000',
        enableBanner: false,
        bannerType: 'image',
        bannerImageUrl: '',
        bannerVideoUrl: '',
        bannerPosition: 'top',
        customTitles: {
            en: '',
            es: ''
        },
        showWelcomeMessage: true,
        showQuickActions: true,
        showRecentActivity: true,
        ...homeSettings?.additionalSettings
    });

    // Sincronizar con cambios del padre
    useEffect(() => {
        if (homeSettings?.additionalSettings) {
            setHomeConfig(prev => ({
                ...prev,
                ...homeSettings.additionalSettings
            }));
        }
    }, [homeSettings?.additionalSettings]);

    // Manejador para cambios en configuraciones específicas del Home
    const handleHomeConfigChange = (field: keyof HomeAdditionalSettings, value: any) => {
        const newConfig = { ...homeConfig, [field]: value };
        setHomeConfig(newConfig);

        // Enviar al componente padre
        onChange('additionalSettings', newConfig);
    };

    // Manejador para títulos multiidioma
    const handleTitleChange = (language: 'en' | 'es', title: string) => {
        const newTitles = {
            ...homeConfig.customTitles,
            [language]: title
        };
        handleHomeConfigChange('customTitles', newTitles);
    };

    // Manejador para selección de secciones
    const handleSectionToggle = (sectionId: string, checked: boolean) => {
        const currentSections = homeConfig.selectedSections || [];
        let newSections: string[];

        if (checked) {
            newSections = [...currentSections, sectionId];
        } else {
            newSections = currentSections.filter(id => id !== sectionId);
        }

        handleHomeConfigChange('selectedSections', newSections);
    };

    // Manejador para archivo de banner
    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            if (type === 'image') {
                handleHomeConfigChange('bannerImageUrl', fileUrl);
                // También podrías enviar el archivo al padre para procesamiento
                onChange('bannerImageFile', file);
            } else {
                handleHomeConfigChange('bannerVideoUrl', fileUrl);
                onChange('bannerVideoFile', file);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Configuración básica de fondo */}
            <ViewCustomizer
                title="Configuración de Vista Home"
                description="Personaliza la apariencia de la página principal de tu tenant"
                onChange={onChange}
                isSubmitting={isSubmitting}
                errors={errors}
                settings={settings}
                {...props}
            />

            {/* Configuraciones específicas del Home */}
            <div className="px-6 py-6 space-y-8 border-t border-gray-200">
                <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Configuraciones Específicas del Home
                    </h4>

                    {/* Títulos personalizados */}
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Títulos Personalizados</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título en Español
                                </label>
                                <input
                                    type="text"
                                    value={homeConfig.customTitles?.es || ''}
                                    onChange={(e) => handleTitleChange('es', e.target.value)}
                                    placeholder="Bienvenido a tu plataforma"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título en Inglés
                                </label>
                                <input
                                    type="text"
                                    value={homeConfig.customTitles?.en || ''}
                                    onChange={(e) => handleTitleChange('en', e.target.value)}
                                    placeholder="Welcome to your platform"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 pt-6 border-t border-gray-200 ">
                        <h4 className="text-sm text-gray-600 mb-4">Color de texto del Home</h4>
                        <input
                            type="color"
                            id="textColor"
                            name="textColor"
                            disabled={isSubmitting}
                            value={homeSettings?.additionalSettings?.textColor || '#000000'}
                            onChange={(e) => onChange('textColor', e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    {/* Configuración de Banner */}
                    <div className="mb-8 p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center mb-4">
                            <input
                                id="enableBanner"
                                type="checkbox"
                                checked={homeConfig.enableBanner || false}
                                onChange={(e) => handleHomeConfigChange('enableBanner', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="enableBanner" className="ml-2 text-sm font-medium text-gray-800">
                                Habilitar Banner en Home
                            </label>
                        </div>

                        {homeConfig.enableBanner && (
                            <div className="ml-6 space-y-4">
                                {/* Tipo de banner */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Banner
                                    </label>
                                    <select
                                        value={homeConfig.bannerType || 'image'}
                                        onChange={(e) => handleHomeConfigChange('bannerType', e.target.value as 'image' | 'video')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSubmitting}
                                    >
                                        <option value="image">Imagen</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>


                                {/* Upload de archivo según tipo */}
                                {homeConfig.bannerType === 'image' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Imagen del Banner
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleBannerFileChange(e, 'image')}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            disabled={isSubmitting}
                                        />
                                        {homeConfig.bannerImageUrl && (
                                            <div className="mt-2">
                                                <img
                                                    src={homeConfig.bannerImageUrl}
                                                    alt="Banner preview"
                                                    className="h-20 w-32 object-cover rounded border"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Video del Banner
                                        </label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleBannerFileChange(e, 'video')}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            disabled={isSubmitting}
                                        />
                                        {homeConfig.bannerVideoUrl && (
                                            <div className="mt-2">
                                                <video
                                                    src={homeConfig.bannerVideoUrl}
                                                    className="h-20 w-32 object-cover rounded border"
                                                    controls
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Configuración de Cursos */}
                    <div className="mb-8 p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center mb-4">
                            <input
                                id="allowCoursesHome"
                                type="checkbox"
                                checked={homeConfig.allowCoursesHome || false}
                                onChange={(e) => handleHomeConfigChange('allowCoursesHome', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="allowCoursesHome" className="ml-2 text-sm font-medium text-gray-800">
                                Mostrar Cursos en Home
                            </label>
                        </div>

                        {homeConfig.allowCoursesHome && (
                            <div className="ml-6">
                                <div className="flex items-center">
                                    <input
                                        id="showPrivateCourses"
                                        type="checkbox"
                                        checked={homeConfig.showPrivateCourses || false}
                                        onChange={(e) => handleHomeConfigChange('showPrivateCourses', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="showPrivateCourses" className="ml-2 text-sm text-gray-700">
                                        Incluir cursos privados
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Configuración de Secciones */}
                    <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center mb-4">
                            <input
                                id="allowSectionsHome"
                                type="checkbox"
                                checked={homeConfig.allowSectionsHome || false}
                                onChange={(e) => handleHomeConfigChange('allowSectionsHome', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="allowSectionsHome" className="ml-2 text-sm font-medium text-gray-800">
                                Mostrar Secciones en Home
                            </label>
                        </div>

                        {homeConfig.allowSectionsHome && availableSections.length > 0 && (
                            <div className="ml-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccionar Secciones a Mostrar:
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {availableSections.map((section) => (
                                        <div key={section.id} className="flex items-center">
                                            <input
                                                id={`section-${section.id}`}
                                                type="checkbox"
                                                checked={(homeConfig.selectedSections || []).includes(section.id)}
                                                onChange={(e) => handleSectionToggle(section.id, e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                disabled={isSubmitting}
                                            />
                                            <label htmlFor={`section-${section.id}`} className="ml-2 text-sm text-gray-700">
                                                {section.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
};