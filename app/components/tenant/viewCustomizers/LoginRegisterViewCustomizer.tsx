// components/tenant/viewCustomizers/LoginRegisterCustomizer.tsx
import React, { useState, useEffect } from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

// Interfaz específica para configuraciones del Login/Register
export interface LoginRegisterAdditionalSettings {
    // Títulos personalizados multiidioma
    customTitles?: {
        en?: string;
        es?: string;
    };

    // Configuración de login social
    showSocialLoginButtons?: boolean;
    socialLoginProviders?: {
        google?: boolean;
        facebook?: boolean;
    };

    // Logos y fondos específicos de login
    loginLogoPath?: string;
    loginBackgroundPath?: string;
}

// Extender las props para incluir configuraciones específicas del login/register
interface LoginRegisterCustomizerProps extends SpecificViewCustomizerProps {
    loginRegisterSettings?: {
        customBackground?: boolean;
        backgroundType?: 'imagen' | 'color';
        backgroundImage?: string;
        backgroundColor?: string;
        additionalSettings?: LoginRegisterAdditionalSettings;
    };
}

export const LoginRegisterCustomizer: React.FC<LoginRegisterCustomizerProps> = ({
    onChange,
    isSubmitting = false,
    errors = {},
    settings,
    loginRegisterSettings,
    ...props
}) => {
    // Estados locales para configuraciones específicas del Login/Register
    const [loginConfig, setLoginConfig] = useState<LoginRegisterAdditionalSettings>({
        customTitles: {
            en: 'Login and Registration',
            es: 'Login y Registro'
        },
        showSocialLoginButtons: true,
        socialLoginProviders: {
            google: false,
            facebook: false
        },
        loginLogoPath: '',
        loginBackgroundPath: '',
        ...loginRegisterSettings?.additionalSettings
    });

    // Sincronizar con cambios del padre
    useEffect(() => {
        if (loginRegisterSettings?.additionalSettings) {
            setLoginConfig(prev => ({
                ...prev,
                ...loginRegisterSettings.additionalSettings
            }));
        }
    }, [loginRegisterSettings?.additionalSettings]);

    // Manejador para cambios en configuraciones específicas del Login/Register
    const handleLoginConfigChange = (field: keyof LoginRegisterAdditionalSettings, value: any) => {
        const newConfig = { ...loginConfig, [field]: value };
        setLoginConfig(newConfig);

        // Enviar al componente padre
        onChange('additionalSettings', newConfig);
    };

    // Manejador para títulos multiidioma
    const handleTitleChange = (language: 'en' | 'es', title: string) => {
        const newTitles = {
            ...loginConfig.customTitles,
            [language]: title
        };
        handleLoginConfigChange('customTitles', newTitles);
    };

    // Manejador para proveedores de login social
    const handleSocialProviderToggle = (provider: 'google' | 'facebook', checked: boolean) => {
        const newProviders = {
            ...loginConfig.socialLoginProviders,
            [provider]: checked
        };
        handleLoginConfigChange('socialLoginProviders', newProviders);
    };

    // Manejador para archivo de imagen
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'loginLogoPath' | 'loginBackgroundPath') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                handleLoginConfigChange(field, result);
                // También podrías enviar el archivo al padre para procesamiento
                onChange(`${field}File`, file);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Configuración básica de fondo */}
            <ViewCustomizer
                title="Configuración de Vista Login/Registro"
                description="Personaliza la apariencia de la página de inicio de sesión y registro"
                onChange={onChange}
                isSubmitting={isSubmitting}
                errors={errors}
                settings={settings}
                {...props}
            />

            {/* Configuraciones específicas del Login/Register */}
            <div className="px-6 py-6 space-y-8 border-t border-gray-200">
                <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Configuraciones Específicas de Login/Registro
                    </h4>

                    {/* Títulos personalizados */}
                    {/* <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Títulos Personalizados</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título en Español
                                </label>
                                <input
                                    type="text"
                                    value={loginConfig.customTitles?.es || ''}
                                    onChange={(e) => handleTitleChange('es', e.target.value)}
                                    placeholder="Login y Registro"
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
                                    value={loginConfig.customTitles?.en || ''}
                                    onChange={(e) => handleTitleChange('en', e.target.value)}
                                    placeholder="Login and Registration"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div> */}

                    {/* Logo de Login */}
                    <div className="mb-8 p-4 bg-green-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Logo para Pantalla de Login</h5>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL o subir imagen
                            </label>
                            <input
                                type="text"
                                value={loginConfig.loginLogoPath || ''}
                                onChange={(e) => handleLoginConfigChange('loginLogoPath', e.target.value)}
                                placeholder="https://ejemplo.com/login-logo.png"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                disabled={isSubmitting}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(e, 'loginLogoPath')}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={isSubmitting}
                            />
                            {loginConfig.loginLogoPath && (
                                <div className="mt-2">
                                    <img
                                        src={loginConfig.loginLogoPath}
                                        alt="Login logo preview"
                                        className="h-20 w-32 object-contain rounded border"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fondo de Login */}
                    <div className="mb-8 p-4 bg-purple-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Fondo de Pantalla de Login</h5>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL o subir imagen
                            </label>
                            <input
                                type="text"
                                value={loginConfig.loginBackgroundPath || ''}
                                onChange={(e) => handleLoginConfigChange('loginBackgroundPath', e.target.value)}
                                placeholder="https://ejemplo.com/background.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                disabled={isSubmitting}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(e, 'loginBackgroundPath')}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={isSubmitting}
                            />
                            {loginConfig.loginBackgroundPath && (
                                <div className="mt-2">
                                    <img
                                        src={loginConfig.loginBackgroundPath}
                                        alt="Login background preview"
                                        className="h-20 w-32 object-cover rounded border"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Configuración de Login Social */}
                    {/* <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center mb-4">
                            <input
                                id="showSocialLoginButtons"
                                type="checkbox"
                                checked={loginConfig.showSocialLoginButtons || false}
                                onChange={(e) => handleLoginConfigChange('showSocialLoginButtons', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="showSocialLoginButtons" className="ml-2 text-sm font-medium text-gray-800">
                                Mostrar Botones de Login Social
                            </label>
                        </div>

                        {loginConfig.showSocialLoginButtons && (
                            <div className="ml-6 space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proveedores Habilitados:
                                </label>
                                <div className="flex items-center mb-2">
                                    <input
                                        id="googleProvider"
                                        type="checkbox"
                                        checked={loginConfig.socialLoginProviders?.google || false}
                                        onChange={(e) => handleSocialProviderToggle('google', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="googleProvider" className="ml-2 text-sm text-gray-700">
                                        Google
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="facebookProvider"
                                        type="checkbox"
                                        checked={loginConfig.socialLoginProviders?.facebook || false}
                                        onChange={(e) => handleSocialProviderToggle('facebook', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="facebookProvider" className="ml-2 text-sm text-gray-700">
                                        Facebook
                                    </label>
                                </div>
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </div>
    );
};