import React from 'react';
import { Palette, Home, User, Settings, Bell, Search, Menu } from 'lucide-react';

interface NavbarCustomizerProps {
    // Props para los valores actuales
    backgroundColor: string;
    textColor: string;
    logo: string;
    showSearch: boolean;
    showNotifications: boolean;
    showProfile: boolean;

    // Callback para manejar cambios
    onChange: (field: string, value: string | boolean) => void;

    // Estado de carga
    isSubmitting?: boolean;

    // Errores de validación
    errors?: Record<string, string>;
}

const NavbarCustomizer: React.FC<NavbarCustomizerProps> = ({
    backgroundColor,
    textColor,
    logo,
    showSearch,
    showNotifications,
    showProfile,
    onChange,
    isSubmitting = false,
    errors = {}
}) => {
    const presetColors = [
        { name: 'Blanco', bg: '#ffffff', text: '#374151' },
        { name: 'Azul', bg: '#3b82f6', text: '#ffffff' },
        { name: 'Gris Oscuro', bg: '#374151', text: '#ffffff' },
        { name: 'Negro', bg: '#000000', text: '#ffffff' },
        { name: 'Verde', bg: '#10b981', text: '#ffffff' },
        { name: 'Morado', bg: '#8b5cf6', text: '#ffffff' }
    ];

    // Componente de preview del Navbar
    const NavbarPreview = () => (
        <div
            id="customNavbar"
            className="w-full px-6 py-4 flex items-center justify-between border-b-2 transition-all duration-300"
            style={{
                backgroundColor: backgroundColor,
                color: textColor,
                borderBottomColor: textColor + '20'
            }}
        >
            {/* Logo */}
            <div className="flex items-center space-x-2">
                {logo && (logo.startsWith('http') || logo.startsWith('/storage/')) ? (
                    <>
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-34 h-26 object-contain rounded"
                    />
                    </>
                ) : (
                    <>
                    <div
                        className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: textColor, color: backgroundColor }}
                    >
                        {logo?.charAt(0) || 'L'}
                    </div>
                    <span className="text-xl font-semibold">{logo || 'Logo'}</span>
                    </>
                )}
            </div>


            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
                <a href="#customNavbar" className="flex items-center space-x-1 hover:opacity-75 transition-opacity">
                    <Home className="h-4 w-4" />
                    <span>Inicio</span>
                </a>
                <a href="#customNavbar" className="flex items-center space-x-1 hover:opacity-75 transition-opacity">
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                </a>
                <a href="#customNavbar" className="flex items-center space-x-1 hover:opacity-75 transition-opacity">
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
                {/* {showSearch && (
                    <button className="p-2 rounded-lg hover:opacity-75 transition-opacity">
                        <Search className="h-5 w-5" />
                    </button>
                )} */}
                {showNotifications && (
                    <button className="p-2 rounded-lg hover:opacity-75 transition-opacity relative">
                        <Bell className="h-5 w-5" />
                        <span
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center"
                            style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                        >
                            3
                        </span>
                    </button>
                )}
                {showProfile && (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ backgroundColor: textColor, color: backgroundColor }}
                    >
                        U
                    </div>
                )}
                <button className="md:hidden p-2 rounded-lg hover:opacity-75 transition-opacity">
                    <Menu className="h-5 w-5" />
                </button>
            </div>
        </div>
    );

    const handleColorPresetClick = (preset: { bg: string; text: string }) => {
        onChange('backgroundColorNavbar', preset.bg);
        onChange('textColorNavbar', preset.text);
    };

    const handleReset = () => {
        onChange('backgroundColorNavbar', '#0052cc');
        onChange('textColorNavbar', '#ffffff');
        onChange('logoNavbar', 'Mi App');
        onChange('showSearch', true);
        onChange('showNotifications', true);
        onChange('showProfile', true);
    };

    return (
        <div className="space-y-8">
            {/* Preview */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Vista Previa del Navbar</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Observa cómo se verá tu navbar con la configuración actual
                    </p>
                </div>
                <NavbarPreview />
            </div>

            {/* Configuración */}
            <div className="px-6 py-6 space-y-8">
                {/* Colores personalizados */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Colores Personalizados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="backgroundColorNavbar" className="block text-sm font-medium text-gray-700 mb-2">
                                Color de Fondo del Navbar
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="color"
                                    id="backgroundColorNavbar"
                                    name="backgroundColorNavbar"
                                    disabled={isSubmitting}
                                    value={backgroundColor}
                                    onChange={(e) => onChange('backgroundColorNavbar', e.target.value)}
                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
                                />
                                <input
                                    type="text"
                                    value={backgroundColor}
                                    onChange={(e) => onChange('backgroundColorNavbar', e.target.value)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                    placeholder="#0052cc"
                                />
                            </div>
                            {errors.backgroundColorNavbar && (
                                <p className="mt-1 text-sm text-red-600">{errors.backgroundColorNavbar}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="textColorNavbar" className="block text-sm font-medium text-gray-700 mb-2">
                                Color de Texto del Navbar
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="color"
                                    id="textColorNavbar"
                                    name="textColorNavbar"
                                    disabled={isSubmitting}
                                    value={textColor}
                                    onChange={(e) => onChange('textColorNavbar', e.target.value)}
                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
                                />
                                <input
                                    type="text"
                                    value={textColor}
                                    onChange={(e) => onChange('textColorNavbar', e.target.value)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                    placeholder="#ffffff"
                                />
                            </div>
                            {errors.textColorNavbar && (
                                <p className="mt-1 text-sm text-red-600">{errors.textColorNavbar}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Colores predefinidos */}
                <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Combinaciones Predefinidas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {presetColors.map((preset, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleColorPresetClick(preset)}
                                disabled={isSubmitting}
                                className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors disabled:opacity-50 group"
                                style={{ backgroundColor: preset.bg, color: preset.text }}
                            >
                                <div className="text-sm font-medium">{preset.name}</div>
                                <div className="text-xs opacity-75 mt-1">
                                    {preset.bg} / {preset.text}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Configuración del contenido */}
                {/* <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Contenido del Navbar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="logoNavbar" className="block text-sm font-medium text-gray-700 mb-2">
                                Texto del Logo
                            </label>
                            <input
                                type="text"
                                id="logoNavbar"
                                name="logoNavbar"
                                disabled={isSubmitting}
                                value={logo}
                                onChange={(e) => onChange('logoNavbar', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                placeholder="Mi Aplicación"
                            />
                            {errors.logoNavbar && (
                                <p className="mt-1 text-sm text-red-600">{errors.logoNavbar}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Elementos Visibles
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="showSearch"
                                        checked={showSearch}
                                        onChange={(e) => onChange('showSearch', e.target.checked)}
                                        disabled={isSubmitting}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Mostrar búsqueda</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="showNotifications"
                                        checked={showNotifications}
                                        onChange={(e) => onChange('showNotifications', e.target.checked)}
                                        disabled={isSubmitting}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Mostrar notificaciones</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="showProfile"
                                        checked={showProfile}
                                        onChange={(e) => onChange('showProfile', e.target.checked)}
                                        disabled={isSubmitting}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Mostrar perfil</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Botón de restaurar */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        Restablecer Navbar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavbarCustomizer;