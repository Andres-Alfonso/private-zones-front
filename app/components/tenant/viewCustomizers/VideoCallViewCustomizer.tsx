// components/tenant/viewCustomizers/VideoCallViewCustomizer.tsx
import React, { useState, useEffect } from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

// Interfaz específica para configuraciones de VideoCall
export interface VideoCallAdditionalSettings {
    // Títulos personalizados multiidioma
    customTitles?: {
        en?: string;
        es?: string;
    };

    // Configuración de enlaces de invitación
    enableInvitationLinks?: boolean; // por defecto true
    invitationLinkExpiration?: number; // en minutos, por defecto 60
    allowGuestAccess?: boolean; // permitir acceso sin registrarse

    // Configuración de reservaciones
    enableAllUsersReservations?: boolean; // todos los usuarios pueden crear reservaciones
    requireApprovalForReservations?: boolean; // requiere aprobación para reservaciones
    maxReservationDuration?: number; // duración máxima en minutos
    advanceBookingLimit?: number; // límite de reserva anticipada en días

    // Usuarios administradores de video llamadas
    videoCallAdministrators?: string[]; // IDs de usuarios que pueden administrar
    enableAdminNotifications?: boolean; // notificar a admins de nuevas reservaciones

    // Configuraciones adicionales de video llamadas
    enableRecording?: boolean;
    enableScreenShare?: boolean;
    enableChat?: boolean;
    maxParticipants?: number;
    autoJoinAudio?: boolean;
    autoJoinVideo?: boolean;

    // Configuración de horarios
    allowedTimeSlots?: {
        enabled: boolean;
        slots: Array<{
            day: string; // 'monday', 'tuesday', etc.
            startTime: string; // '09:00'
            endTime: string; // '17:00'
        }>;
    };
}

// Extender las props para incluir configuraciones específicas de VideoCall
interface VideoCallViewCustomizerProps extends SpecificViewCustomizerProps {
    // Props adicionales específicas de VideoCall
    availableUsers?: Array<{ id: string; name: string; email: string; }>;
    videoCallSettings?: {
        customBackground?: boolean;
        backgroundType?: 'image' | 'color';
        backgroundImage?: string;
        backgroundColor?: string;
        additionalSettings?: VideoCallAdditionalSettings;
    };
}

export const VideoCallViewCustomizer: React.FC<VideoCallViewCustomizerProps> = ({
    onChange,
    isSubmitting = false,
    errors = {},
    settings,
    availableUsers = [],
    videoCallSettings,
    ...props
}) => {
    // Estados locales para configuraciones específicas de VideoCall
    const [videoCallConfig, setVideoCallConfig] = useState<VideoCallAdditionalSettings>({
        customTitles: {
            en: '',
            es: ''
        },
        enableInvitationLinks: true,
        invitationLinkExpiration: 60,
        allowGuestAccess: false,
        enableAllUsersReservations: false,
        requireApprovalForReservations: false,
        maxReservationDuration: 120,
        advanceBookingLimit: 30,
        videoCallAdministrators: [],
        enableAdminNotifications: true,
        enableRecording: false,
        enableScreenShare: true,
        enableChat: true,
        maxParticipants: 10,
        autoJoinAudio: false,
        autoJoinVideo: false,
        allowedTimeSlots: {
            enabled: false,
            slots: []
        },
        ...videoCallSettings?.additionalSettings
    });

    // Sincronizar con cambios del padre
    useEffect(() => {
        if (videoCallSettings?.additionalSettings) {
            setVideoCallConfig(prev => ({
                ...prev,
                ...videoCallSettings.additionalSettings
            }));
        }
    }, [videoCallSettings?.additionalSettings]);

    // Manejador para cambios en configuraciones específicas de VideoCall
    const handleVideoCallConfigChange = (field: keyof VideoCallAdditionalSettings, value: any) => {
        const newConfig = { ...videoCallConfig, [field]: value };
        setVideoCallConfig(newConfig);

        // Enviar al componente padre
        onChange('additionalSettings', newConfig);
    };

    // Manejador para títulos multiidioma
    const handleTitleChange = (language: 'en' | 'es', title: string) => {
        const newTitles = {
            ...videoCallConfig.customTitles,
            [language]: title
        };
        handleVideoCallConfigChange('customTitles', newTitles);
    };

    // Manejador para administradores de video llamadas
    const handleAdministratorToggle = (userId: string, checked: boolean) => {
        const currentAdmins = videoCallConfig.videoCallAdministrators || [];
        let newAdmins: string[];

        if (checked) {
            newAdmins = [...currentAdmins, userId];
        } else {
            newAdmins = currentAdmins.filter(id => id !== userId);
        }

        handleVideoCallConfigChange('videoCallAdministrators', newAdmins);
    };

    // Días de la semana para configuración de horarios
    const weekDays = [
        { key: 'monday', label: 'Lunes' },
        { key: 'tuesday', label: 'Martes' },
        { key: 'wednesday', label: 'Miércoles' },
        { key: 'thursday', label: 'Jueves' },
        { key: 'friday', label: 'Viernes' },
        { key: 'saturday', label: 'Sábado' },
        { key: 'sunday', label: 'Domingo' }
    ];

    return (
        <div className="space-y-6">
            {/* Configuración básica de fondo */}
            <ViewCustomizer
                title="Configuración de Vista Video Llamadas"
                description="Personaliza la apariencia y funcionalidad de las video llamadas"
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
                        Configuraciones Específicas de Video Llamadas
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
                                    value={videoCallConfig.customTitles?.es || ''}
                                    onChange={(e) => handleTitleChange('es', e.target.value)}
                                    placeholder="Video Llamadas"
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
                                    value={videoCallConfig.customTitles?.en || ''}
                                    onChange={(e) => handleTitleChange('en', e.target.value)}
                                    placeholder="Video Calls"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuración de Enlaces de Invitación */}
                    <div className="mb-8 p-4 bg-green-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Enlaces de Invitación</h5>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="enableInvitationLinks"
                                    type="checkbox"
                                    checked={videoCallConfig.enableInvitationLinks || false}
                                    onChange={(e) => handleVideoCallConfigChange('enableInvitationLinks', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="enableInvitationLinks" className="ml-2 text-sm font-medium text-gray-800">
                                    Habilitar enlaces de invitación
                                </label>
                            </div>

                            {/* {videoCallConfig.enableInvitationLinks && (
                                <div className="ml-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiración del enlace (minutos)
                                            </label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="1440"
                                                value={videoCallConfig.invitationLinkExpiration || 60}
                                                onChange={(e) => handleVideoCallConfigChange('invitationLinkExpiration', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="allowGuestAccess"
                                            type="checkbox"
                                            checked={videoCallConfig.allowGuestAccess || false}
                                            onChange={(e) => handleVideoCallConfigChange('allowGuestAccess', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={isSubmitting}
                                        />
                                        <label htmlFor="allowGuestAccess" className="ml-2 text-sm text-gray-700">
                                            Permitir acceso de invitados (sin registro)
                                        </label>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </div>

                    {/* Configuración de Reservaciones */}
                    <div className="mb-8 p-4 bg-purple-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Reservaciones</h5>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="enableAllUsersReservations"
                                    type="checkbox"
                                    checked={videoCallConfig.enableAllUsersReservations || false}
                                    onChange={(e) => handleVideoCallConfigChange('enableAllUsersReservations', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="enableAllUsersReservations" className="ml-2 text-sm font-medium text-gray-800">
                                    Habilitar todos los usuarios para crear reservaciones
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="requireApprovalForReservations"
                                    type="checkbox"
                                    checked={videoCallConfig.requireApprovalForReservations || false}
                                    onChange={(e) => handleVideoCallConfigChange('requireApprovalForReservations', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="requireApprovalForReservations" className="ml-2 text-sm text-gray-700">
                                    Requiere aprobación para reservaciones
                                </label>
                            </div>

                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duración máxima (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        min="15"
                                        max="480"
                                        value={videoCallConfig.maxReservationDuration || 120}
                                        onChange={(e) => handleVideoCallConfigChange('maxReservationDuration', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Límite de reserva anticipada (días)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={videoCallConfig.advanceBookingLimit || 30}
                                        onChange={(e) => handleVideoCallConfigChange('advanceBookingLimit', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Administradores de Video Llamadas */}
                    {/* <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Administradores de Video Llamadas</h5>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="enableAdminNotifications"
                                    type="checkbox"
                                    checked={videoCallConfig.enableAdminNotifications || false}
                                    onChange={(e) => handleVideoCallConfigChange('enableAdminNotifications', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="enableAdminNotifications" className="ml-2 text-sm text-gray-700">
                                    Notificar a administradores sobre nuevas reservaciones
                                </label>
                            </div>

                            {availableUsers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seleccionar Administradores:
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
                                        {availableUsers.map((user) => (
                                            <div key={user.id} className="flex items-center">
                                                <input
                                                    id={`admin-${user.id}`}
                                                    type="checkbox"
                                                    checked={(videoCallConfig.videoCallAdministrators || []).includes(user.id)}
                                                    onChange={(e) => handleAdministratorToggle(user.id, e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    disabled={isSubmitting}
                                                />
                                                <label htmlFor={`admin-${user.id}`} className="ml-2 text-sm text-gray-700">
                                                    <span className="font-medium">{user.name}</span> - {user.email}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {availableUsers.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">No hay usuarios disponibles</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div> */}

                    {/* Configuraciones Adicionales de Video Llamadas */}
                    {/* <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Características de Video Llamadas</h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        id="enableRecording"
                                        type="checkbox"
                                        checked={videoCallConfig.enableRecording || false}
                                        onChange={(e) => handleVideoCallConfigChange('enableRecording', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="enableRecording" className="ml-2 text-sm text-gray-700">
                                        Habilitar grabación
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="enableScreenShare"
                                        type="checkbox"
                                        checked={videoCallConfig.enableScreenShare || false}
                                        onChange={(e) => handleVideoCallConfigChange('enableScreenShare', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="enableScreenShare" className="ml-2 text-sm text-gray-700">
                                        Habilitar compartir pantalla
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="enableChat"
                                        type="checkbox"
                                        checked={videoCallConfig.enableChat || false}
                                        onChange={(e) => handleVideoCallConfigChange('enableChat', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="enableChat" className="ml-2 text-sm text-gray-700">
                                        Habilitar chat
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        id="autoJoinAudio"
                                        type="checkbox"
                                        checked={videoCallConfig.autoJoinAudio || false}
                                        onChange={(e) => handleVideoCallConfigChange('autoJoinAudio', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="autoJoinAudio" className="ml-2 text-sm text-gray-700">
                                        Auto-unirse con audio
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="autoJoinVideo"
                                        type="checkbox"
                                        checked={videoCallConfig.autoJoinVideo || false}
                                        onChange={(e) => handleVideoCallConfigChange('autoJoinVideo', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="autoJoinVideo" className="ml-2 text-sm text-gray-700">
                                        Auto-unirse con video
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Máximo de participantes
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="100"
                                        value={videoCallConfig.maxParticipants || 10}
                                        onChange={(e) => handleVideoCallConfigChange('maxParticipants', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};