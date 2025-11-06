import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Input from '~/components/ui/Input';

interface LogoCustomizerProps {
  onChange: (field: string, value: string | boolean | File) => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
  settings: {
    faviconPath?: string;
    logoPath?: string;
    loginBackgroundPath?: string;
    iconPath?: string;
    additionalSettings?: {
      loginLogoPath?: string;
    };
  };
}

export default function LogoCustomizer({ onChange, isSubmitting, errors, settings }: LogoCustomizerProps) {
  const [previewFavicon, setPreviewFavicon] = useState(settings.faviconPath || '');
  const [previewLogo, setPreviewLogo] = useState(settings.logoPath || '');
  const [previewLoginBg, setPreviewLoginBg] = useState(settings.loginBackgroundPath || '');
  const [previewIcon, setPreviewIcon] = useState(settings.iconPath || '');
  const [previewLoginLogo, setPreviewLoginLogo] = useState(settings.additionalSettings?.loginLogoPath || '');

  const handleImageUpload = (field: string, file: File | null, setPreview: (value: string) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(field, result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-6 py-6 space-y-8">
      {/* Favicon */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Favicon (16x16 o 32x32 px)
        </label>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {previewFavicon ? (
              <img src={previewFavicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              label="URL del Favicon"
              placeholder="https://ejemplo.com/favicon.ico"
              value={settings.faviconPath || ''}
              onChange={(e) => onChange('faviconPath', e.target.value)}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-xs text-gray-500">
              O sube una imagen (se convertirá a base64)
            </p>
            <input
              type="file"
              accept="image/x-icon,image/png,image/svg+xml"
              onChange={(e) => handleImageUpload('faviconPath', e.target.files?.[0] || null, setPreviewFavicon)}
              className="mt-2 text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Logo Principal */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Logo Principal (Barra de Navegacion)
        </label>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {previewLogo ? (
              <img src={previewLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              label="URL del Logo"
              placeholder="https://ejemplo.com/logo.png"
              value={settings.logoPath || ''}
              onChange={(e) => onChange('logoPath', e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('logoPath', e.target.files?.[0] || null, setPreviewLogo)}
              className="mt-2 text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Logo para Login */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Logo para Pantalla de Login
        </label>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {previewLoginLogo ? (
              <img src={previewLoginLogo} alt="Login Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              label="URL del Logo de Login"
              placeholder="https://ejemplo.com/login-logo.png"
              value={settings.additionalSettings?.loginLogoPath || ''}
              onChange={(e) => onChange('additionalSettings', { loginLogoPath: e.target.value })}
              disabled={isSubmitting}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('additionalSettings', e.target.files?.[0] || null, setPreviewLoginLogo)}
              className="mt-2 text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Fondo de Login */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Fondo de Pantalla de Login
        </label>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {previewLoginBg ? (
              <img src={previewLoginBg} alt="Login Background" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              label="URL del Fondo"
              placeholder="https://ejemplo.com/background.jpg"
              value={settings.loginBackgroundPath || ''}
              onChange={(e) => onChange('loginBackgroundPath', e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('loginBackgroundPath', e.target.files?.[0] || null, setPreviewLoginBg)}
              className="mt-2 text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Icono */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Icono (Opcional)
        </label>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {previewIcon ? (
              <img src={previewIcon} alt="Icon" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              label="URL del Icono"
              placeholder="https://ejemplo.com/icon.png"
              value={settings.iconPath || ''}
              onChange={(e) => onChange('iconPath', e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('iconPath', e.target.files?.[0] || null, setPreviewIcon)}
              className="mt-2 text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}