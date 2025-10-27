// components/tenant/viewCustomizers/GroupsViewCustomizer.tsx
import React, { useState, useEffect } from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

// Interfaz específica para configuraciones de Groups
export interface GroupsAdditionalSettings {
    // Títulos personalizados multiidioma
    customTitles?: {
        en?: string;
        es?: string;
    };
}

// Extender las props para incluir configuraciones específicas de Groups
interface GroupsViewCustomizerProps extends SpecificViewCustomizerProps {
    groupsSettings?: {
        customBackground?: boolean;
        backgroundType?: 'imagen' | 'color';
        backgroundImage?: string;
        backgroundColor?: string;
        additionalSettings?: GroupsAdditionalSettings;
    };
}

export const GroupsViewCustomizer: React.FC<GroupsViewCustomizerProps> = ({
    onChange,
    isSubmitting = false,
    errors = {},
    settings,
    groupsSettings,
    ...props
}) => {
    // Estados locales para configuraciones específicas de Groups
    const [groupsConfig, setGroupsConfig] = useState<GroupsAdditionalSettings>({
        customTitles: {
            en: '',
            es: ''
        },
        ...groupsSettings?.additionalSettings
    });

    // Sincronizar con cambios del padre
    useEffect(() => {
        if (groupsSettings?.additionalSettings) {
            setGroupsConfig(prev => ({
                ...prev,
                ...groupsSettings.additionalSettings
            }));
        }
    }, [groupsSettings?.additionalSettings]);

    // Manejador para cambios en configuraciones específicas de Groups
    const handleGroupsConfigChange = (field: keyof GroupsAdditionalSettings, value: any) => {
        const newConfig = { ...groupsConfig, [field]: value };
        setGroupsConfig(newConfig);

        // Enviar al componente padre
        onChange('additionalSettings', newConfig);
    };

    // Manejador para títulos multiidioma
    const handleTitleChange = (language: 'en' | 'es', title: string) => {
        const newTitles = {
            ...groupsConfig.customTitles,
            [language]: title
        };
        handleGroupsConfigChange('customTitles', newTitles);
    };

    return (
        <div className="space-y-6">
            {/* Configuración básica de fondo */}
            <ViewCustomizer
                title="Configuración de Grupos"
                description="Personaliza la apariencia de la vista de grupos"
                onChange={onChange}
                isSubmitting={isSubmitting}
                errors={errors}
                settings={settings}
                {...props}
            />

            {/* Configuraciones específicas de Groups */}
            <div className="px-6 py-6 space-y-8 border-t border-gray-200">
                <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Configuraciones Específicas de Grupos
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
                                    value={groupsConfig.customTitles?.es || ''}
                                    onChange={(e) => handleTitleChange('es', e.target.value)}
                                    placeholder="Grupos"
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
                                    value={groupsConfig.customTitles?.en || ''}
                                    onChange={(e) => handleTitleChange('en', e.target.value)}
                                    placeholder="Groups"
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