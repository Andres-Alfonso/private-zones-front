import { ImageIcon } from 'lucide-react';
import Input  from '../ui/Input'; // Ajusta la ruta según tu estructura

interface BrandingSettingsProps {
  formData: {
    primaryColor?: string;
    secondaryColor?: string;
    faviconPath?: string;
    logoPath?: string;
    language?: string;
    timezone?: string;
  };
  isSubmitting: boolean;
  previewFavicon: string | null;
  previewLogo: string | null;
  languages: { code: string; name: string }[];
  getErrorByField: (field: string) => string | undefined;
  handleChange: (field: string, value: string) => void;
  handleImageUpload: (
    field: string, 
    file: File | null, 
    setPreview: (value: string | null) => void
  ) => void;
  setPreviewFavicon: (value: string | null) => void;
  setPreviewLogo: (value: string | null) => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({
  formData,
  isSubmitting,
  previewFavicon,
  previewLogo,
  languages,
  getErrorByField,
  handleChange,
  handleImageUpload,
  setPreviewFavicon,
  setPreviewLogo,
}) => {
  return (
    <div className="px-6 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="color"
          id="primaryColor"
          name="primaryColor"
          label="Color Primario"
          error={getErrorByField('primaryColor')}
          disabled={isSubmitting}
          value={formData.primaryColor || '#0052cc'}
          onChange={(e) => handleChange('primaryColor', e.target.value)}
        />

        <Input
          type="color"
          id="secondaryColor"
          name="secondaryColor"
          label="Color Secundario"
          error={getErrorByField('secondaryColor')}
          disabled={isSubmitting}
          value={formData.secondaryColor || '#ffffff'}
          onChange={(e) => handleChange('secondaryColor', e.target.value)}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6'>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Favicon (16x16 o 32x32 px)
          </label>
          
          <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mx-auto">
            {previewFavicon ? (
              <img src={previewFavicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="favicon-file" className="block text-sm font-medium text-gray-700">
              Subir archivo
            </label>
            <input
              id="favicon-file"
              type="file"
              accept="image/x-icon,image/png,image/svg+xml"
              onChange={(e) => handleImageUpload('faviconPath', e.target.files?.[0] || null, setPreviewFavicon)}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Formatos permitidos: .ico, .png, .svg
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              label="Ingresar URL del favicon"
              placeholder="https://ejemplo.com/favicon.ico"
              value={formData.faviconPath || ''}
              onChange={(e) => handleChange('faviconPath', e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Alternativa: ingresa la URL directa de tu favicon
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Logo Principal (Barra de Navegación)
          </label>
          
          <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mx-auto">
            {previewLogo ? (
              <img src={previewLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="logo-file" className="block text-sm font-medium text-gray-700">
              Subir archivo
            </label>
            <input
              id="logo-file"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('logoPath', e.target.files?.[0] || null, setPreviewLogo)}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Formatos permitidos: PNG, JPG, SVG (recomendado: fondo transparente)
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              label="Ingresar URL del logo"
              placeholder="https://ejemplo.com/logo.png"
              value={formData.logoPath || ''}
              onChange={(e) => handleChange('logoPath', e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Alternativa: ingresa la URL directa de tu logo
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Idioma
          </label>
          <select
            id="language"
            name="language"
            disabled={isSubmitting}
            value={formData.language || 'es'}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        <Input
          type="text"
          id="timezone"
          name="timezone"
          label="Zona Horaria"
          disabled={isSubmitting}
          placeholder="America/Bogota"
          value={formData.timezone || ''}
          onChange={(e) => handleChange('timezone', e.target.value)}
        />
      </div>
    </div>
  );
};