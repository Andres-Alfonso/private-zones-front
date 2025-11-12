// app/components/profile/PasswordChangeModal.tsx
import { useState } from 'react';
import apiClient from '~/api/client';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PasswordChangeModal({ isOpen, onClose, onSuccess }: PasswordChangeModalProps) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    if (!isOpen) return null;

    const validateForm = () => {
        const errors = {
            newPassword: '',
            confirmPassword: ''
        };

        if (formData.newPassword.length < 8) {
            errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setValidationErrors(errors);
        return !errors.newPassword && !errors.confirmPassword;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // TODO: Reemplazar con tu endpoint de API
            await apiClient.put('/v1/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            // Resetear formulario
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error changing password:', err);
            setError(
                err.response?.data?.message || 
                'Error al cambiar la contraseña. Verifica tu contraseña actual.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setError(null);
        setValidationErrors({
            newPassword: '',
            confirmPassword: ''
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Cambiar Contraseña</h3>
                        <button
                            onClick={handleClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Contraseña Actual */}
                    <div className="mb-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña Actual
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Nueva Contraseña */}
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={(e) => {
                                setFormData({ ...formData, newPassword: e.target.value });
                                setValidationErrors({ ...validationErrors, newPassword: '' });
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        {validationErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirmar Nueva Contraseña */}
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => {
                                setFormData({ ...formData, confirmPassword: e.target.value });
                                setValidationErrors({ ...validationErrors, confirmPassword: '' });
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Cambiando...
                                </>
                            ) : (
                                'Cambiar Contraseña'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}