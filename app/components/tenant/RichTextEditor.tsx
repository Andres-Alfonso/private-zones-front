import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

// Componente RichTextEditor simple
const RichTextEditor = ({ value, onChange, placeholder, disabled }) => {
    const editorRef = useRef(null);
    const isUpdatingRef = useRef(false);

    // Solo actualizar el contenido si el valor cambió externamente (no por el usuario escribiendo)
    useEffect(() => {
        if (editorRef.current && !isUpdatingRef.current) {
            const currentContent = editorRef.current.innerHTML;
            if (currentContent !== (value || '')) {
                editorRef.current.innerHTML = value || '';
            }
        }
        isUpdatingRef.current = false;
    }, [value]);

    const handleInput = (e) => {
        isUpdatingRef.current = true;
        if (onChange) {
            onChange(e.target.innerHTML);
        }
    };

    const handleCommand = (command) => {
        if (disabled || !editorRef.current) return;

        editorRef.current.focus();
        document.execCommand(command);

        // Actualizar el valor después del comando
        if (onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="border border-gray-300 rounded-md">
            <div className="border-b border-gray-200 p-2 bg-gray-50">
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded"
                        onClick={() => handleCommand('bold')}
                        disabled={disabled}
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded italic"
                        onClick={() => handleCommand('italic')}
                        disabled={disabled}
                    >
                        I
                    </button>
                    <button
                        type="button"
                        className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded underline"
                        onClick={() => handleCommand('underline')}
                        disabled={disabled}
                    >
                        U
                    </button>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <button
                        type="button"
                        className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded"
                        onClick={() => handleCommand('insertUnorderedList')}
                        disabled={disabled}
                    >
                        • Lista
                    </button>
                </div>
            </div>
            <div
                ref={editorRef}
                contentEditable={!disabled}
                className={`min-h-[200px] p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    }`}
                style={{ minHeight: '200px' }}
                data-placeholder={placeholder}
                onInput={handleInput}
                suppressContentEditableWarning={true}
            />

            {/* Placeholder personalizado */}
            <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};

const TermsPrivacyConfig = ({
    formData = {},
    handleChange,
    getErrorByField,
    isSubmitting
}) => {
    const [activeTab, setActiveTab] = useState('terms-es');

    const tabs = [
        { id: 'terms-es', label: 'Términos y Condiciones (ES)', field: 'termsEs' },
        { id: 'terms-en', label: 'Terms & Conditions (EN)', field: 'termsEn' },
        { id: 'privacy-es', label: 'Política de Privacidad (ES)', field: 'privacyEs' },
        { id: 'privacy-en', label: 'Privacy Policy (EN)', field: 'privacyEn' }
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (



        <>
            {/* Pestañas */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                            disabled={isSubmitting}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenido de la pestaña activa */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTabData?.label}
                    </label>
                    <RichTextEditor
                        value={formData[activeTabData?.field] || ''}
                        onChange={(value) => handleChange && handleChange(activeTabData?.field, value)}
                        placeholder={`Ingrese el contenido para ${activeTabData?.label.toLowerCase()}...`}
                        disabled={isSubmitting}
                    />
                    {getErrorByField && getErrorByField(activeTabData?.field) && (
                        <p className="mt-2 text-sm text-red-600">
                            {getErrorByField(activeTabData?.field)}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default TermsPrivacyConfig;