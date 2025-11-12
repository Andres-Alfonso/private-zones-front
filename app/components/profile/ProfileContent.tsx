// app/components/profile/ProfileContent.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import apiClient from '~/api/client';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import ProfileEditForm from './ProfileEditForm';
import PasswordChangeModal from './PasswordChangeModal';
import { ProfileData } from '../../api/types/user.types';

export default function ProfileContent() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Cargar datos del perfil
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await apiClient.get('/v1/auth/profile');
                setProfileData(response.data);
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.response?.data?.message || 'Error al cargar el perfil');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/home')}
                        className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                    </div>
                </div>
            )}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <ProfileHeader onBack={() => navigate('/home')} />

                    {/* Card principal */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
                        {/* Header con información del usuario */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <div className="text-white text-2xl font-bold">
                                            {profileData.name.charAt(0)}{profileData.lastName.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="text-white">
                                        <h2 className="text-2xl font-bold">
                                            {profileData.name} {profileData.lastName}
                                        </h2>
                                        <p className="text-blue-100">{profileData.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            {profileData.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Botón para cambiar contraseña */}
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium flex items-center gap-2 border border-white/30"
                                >
                                    <svg 
                                        className="w-4 h-4" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                                        />
                                    </svg>
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Información del Perfil</h3>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    {isEditing ? 'Cancelar' : 'Editar Perfil'}
                                </button>
                            </div>

                            {!isEditing ? (
                                <ProfileInfo profileData={profileData} />
                            ) : (
                                <ProfileEditForm
                                    profileData={profileData}
                                    onCancel={() => setIsEditing(false)}
                                    onSuccess={(updatedData) => {
                                        setProfileData(updatedData);
                                        setIsEditing(false);
                                        setSuccessMessage('Perfil actualizado exitosamente');
                                        // Limpiar mensaje después de 3 segundos
                                        setTimeout(() => setSuccessMessage(null), 3000);
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Biografía */}
                    {profileData.profileConfig?.bio && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Biografía</h3>
                            <p className="text-gray-700">{profileData.profileConfig.bio}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de cambio de contraseña */}
            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSuccess={() => {
                    setSuccessMessage('Contraseña cambiada exitosamente');
                    setTimeout(() => setSuccessMessage(null), 3000);
                }}
            />
        </div>
    );
}