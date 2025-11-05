import React, { useEffect, useState } from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SectionsAdditionalSettings, SpecificViewCustomizerProps } from './types';



// Extender las props para incluir configuraciones específicas de VideoCall
interface SectionsViewCustomizerProps extends SpecificViewCustomizerProps {
  // Props adicionales específicas de VideoCall
  sectionsSettings?: {
    customBackground?: boolean;
    backgroundType?: 'image' | 'color';
    backgroundImage?: string;
    backgroundColor?: string;
    additionalSettings?: SectionsAdditionalSettings;
  };
}

export const SectionsViewCustomizer: React.FC<SectionsViewCustomizerProps> = ({

    onChange,
    isSubmitting = false,
    errors = {},
    settings,
    sectionsSettings,
    ...props
}) => {
    // Estados locales para configuraciones específicas del Sections
    const [sectionsConfig, setSectionsConfig] = useState<SectionsAdditionalSettings>({
        customTitles: {
            en: '',
            es: ''
        },
        ...sectionsSettings?.additionalSettings
    });

    // Sincronizar con cambios del padre
    useEffect(() => {
        if (sectionsSettings?.additionalSettings) {
            setSectionsConfig(prev => ({
            ...prev,
            ...sectionsSettings.additionalSettings
            }));
        }
    }, [sectionsSettings?.additionalSettings]);

    // Manejador para cambios en configuraciones específicas de VideoCall
    const handleSectionsConfigChange = (field: keyof SectionsAdditionalSettings, value: any) => {
        const newConfig = { ...sectionsConfig, [field]: value };
        setSectionsConfig(newConfig);
        
        // Enviar al componente padre
        onChange('additionalSettings', newConfig);
    };

    // Manejador para títulos multiidioma
    const handleTitleChange = (language: 'en' | 'es', title: string) => {
        const newTitles = {
        ...sectionsConfig.customTitles,
        [language]: title
        };
        handleSectionsConfigChange('customTitles', newTitles);
    };

    return (
        <div>
            <ViewCustomizer
                title="Configuración de Secciones"
                description="Personaliza la apariencia de la vista de secciones"
                onChange={onChange}
                isSubmitting={isSubmitting}
                errors={errors}
                settings={settings}
                {...props}
            />

            {/* Configuraciones específicas de VideoCall */}
            <div className="px-6 py-6 space-y-8 border-t border-gray-200">
                <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Configuraciones Específicas de Secciones
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
                                    value={sectionsConfig.customTitles?.es || ''}
                                    onChange={(e) => handleTitleChange('es', e.target.value)}
                                    placeholder="Secciones"
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
                                    value={sectionsConfig.customTitles?.en || ''}
                                    onChange={(e) => handleTitleChange('en', e.target.value)}
                                    placeholder="Sections"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};