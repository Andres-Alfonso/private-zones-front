// app/components/profile/PasswordChangeModal.tsx
import { useState } from 'react';
import { UsersAPI, PasswordChangeError } from '~/api/endpoints/users';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PasswordChangeModal({ isOpen, onClose, onSuccess }: PasswordChangeModalProps) {
    const [formData, setFormData] = useState({
        oldPass: '',
        newPass: '',
        confirmPass: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState({
        oldPass: '',
        newPass: '',
        confirmPass: ''
    });

    if (!isOpen) return null;

    const validateForm = (): boolean => {
        const errors = {
            oldPass: '',
            newPass: '',
            confirmPass: ''
        };

        let isValid = true;

        // Validar contraseña actual
        if (!formData.oldPass) {
            errors.oldPass = 'La contraseña actual es requerida';
            isValid = false;
        }

        // Validar nueva contraseña
        if (!formData.newPass) {
            errors.newPass = 'La nueva contraseña es requerida';
            isValid = false;
        } else if (formData.newPass.length < 8) {
            errors.newPass = 'La contraseña debe tener al menos 8 caracteres';
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPass)) {
            errors.newPass = 'Debe contener mayúsculas, minúsculas y números';
            isValid = false;
        }

        // Validar confirmación
        if (!formData.confirmPass) {
            errors.confirmPass = 'Debes confirmar la nueva contraseña';
            isValid = false;
        } else if (formData.newPass !== formData.confirmPass) {
            errors.confirmPass = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        setFieldErrors({ oldPass: '', newPass: '', confirmPass: '' });

        try {
            const response = await UsersAPI.changePasswordProfile(formData);
            
            if (response.success) {
                // Mostrar mensaje de éxito
                setSuccessMessage(response.message || '¡Contraseña actualizada exitosamente!');
                
                // Resetear formulario
                setFormData({
                    oldPass: '',
                    newPass: '',
                    confirmPass: ''
                });

                // Esperar 2 segundos para que el usuario vea el mensaje
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setError(response.message || 'Error al cambiar la contraseña');
            }
        } catch (err: any) {
            console.error('Error completo:', err);
            
            // Manejar error estructurado de la API
            const apiError = err as PasswordChangeError;
            
            console.log('Error procesado:', {
                message: apiError.message,
                field: apiError.field,
                code: apiError.code,
                statusCode: apiError.statusCode
            });
            
            // Mostrar error en el campo específico si está definido
            if (apiError.field && apiError.field in fieldErrors) {
                setFieldErrors(prev => ({
                    ...prev,
                    [apiError.field!]: apiError.message
                }));
                setError(null); // Limpiar error general
            } else {
                // Mostrar error general
                setError(apiError.message || 'Error al cambiar la contraseña');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return; // No cerrar si está cargando
        
        setFormData({
            oldPass: '',
            newPass: '',
            confirmPass: ''
        });
        setError(null);
        setSuccessMessage(null);
        setFieldErrors({
            oldPass: '',
            newPass: '',
            confirmPass: ''
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
                            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
                            type="button"
                            disabled={isLoading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Mensaje de Éxito */}
                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error General */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Contraseña Actual */}
                    <div className="mb-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña Actual *
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={formData.oldPass}
                            onChange={(e) => {
                                setFormData({ ...formData, oldPass: e.target.value });
                                setFieldErrors({ ...fieldErrors, oldPass: '' });
                                setError(null);
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                fieldErrors.oldPass ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            disabled={isLoading || !!successMessage}
                            placeholder="Ingresa tu contraseña actual"
                        />
                        {fieldErrors.oldPass && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {fieldErrors.oldPass}
                            </p>
                        )}
                    </div>

                    {/* Nueva Contraseña */}
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña *
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={formData.newPass}
                            onChange={(e) => {
                                setFormData({ ...formData, newPass: e.target.value });
                                setFieldErrors({ ...fieldErrors, newPass: '' });
                                setError(null);
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                fieldErrors.newPass ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            disabled={isLoading || !!successMessage}
                            placeholder="Mínimo 8 caracteres"
                        />
                        {fieldErrors.newPass && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {fieldErrors.newPass}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Debe contener mayúsculas, minúsculas y números
                        </p>
                    </div>

                    {/* Confirmar Nueva Contraseña */}
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPass}
                            onChange={(e) => {
                                setFormData({ ...formData, confirmPass: e.target.value });
                                setFieldErrors({ ...fieldErrors, confirmPass: '' });
                                setError(null);
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                fieldErrors.confirmPass ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            disabled={isLoading || !!successMessage}
                            placeholder="Repite la nueva contraseña"
                        />
                        {fieldErrors.confirmPass && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {fieldErrors.confirmPass}
                            </p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || !!successMessage}
                        >
                            {successMessage ? 'Cerrar' : 'Cancelar'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={isLoading || !!successMessage}
                        >
                            {isLoading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Cambiando...
                                </>
                            ) : successMessage ? (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Completado
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