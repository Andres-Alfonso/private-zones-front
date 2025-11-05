// components/tenant/viewCustomizers/FAQViewCustomizer.tsx
import React, { useState, useEffect, useRef } from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Bold, Italic, Underline, List, AlignLeft, AlignCenter, Link } from 'lucide-react';

// Interfaz para una pregunta FAQ individual
export interface FAQItem {
    id: string;
    question: string;
    answer: string; // HTML content
    isActive: boolean;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interfaz específica para configuraciones de FAQ
export interface FAQAdditionalSettings {
    // Títulos personalizados multiidioma
    customTitles?: {
        en?: string;
        es?: string;
    };

    // Configuraciones de visualización
    enableSearch?: boolean;
    groupByCategory?: boolean;
    showContactInfo?: boolean;
    allowVoting?: boolean;
    enableComments?: boolean;
    questionsPerPage?: number;
    showQuestionNumbers?: boolean;

    // Lista de preguntas FAQ
    faqItems?: FAQItem[];

    // Configuraciones de edición
    allowPublicSubmissions?: boolean;
    requireApprovalForSubmissions?: boolean;
    showAuthor?: boolean;
    enableEmailNotifications?: boolean;
}

// Extender las props para incluir configuraciones específicas de FAQ
interface FAQViewCustomizerProps extends SpecificViewCustomizerProps {
    faqSettings?: {
        customBackground?: boolean;
        backgroundType?: 'image' | 'color';
        backgroundImage?: string;
        backgroundColor?: string;
        additionalSettings?: FAQAdditionalSettings;
    };
}

// Componente Simple Rich Text Editor
const RichTextEditor: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}> = ({ value, onChange, placeholder = "Escribe la respuesta...", disabled = false }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Comandos de formato
    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    // Manejador de cambios en el contenido
    const handleContentChange = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    // Configurar el contenido inicial
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    return (
        <div className="border border-gray-300 rounded-md">
            {/* Toolbar */}
            <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={disabled}
                    title="Negrita"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={disabled}
                    title="Cursiva"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={disabled}
                    title="Subrayado"
                >
                    <Underline className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={disabled}
                    title="Lista con viñetas"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('justifyLeft')}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={disabled}
                    title="Alinear izquierda"
                >
                    <AlignLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('justifyCenter')}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={disabled}
                    title="Centrar"
                >
                    <AlignCenter className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt('Ingresa la URL:');
                        if (url) {
                            execCommand('createLink', url);
                        }
                    }}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={disabled}
                    title="Insertar enlace"
                >
                    <Link className="h-4 w-4" />
                </button>
            </div>

            {/* Editor area */}
            <div
                ref={editorRef}
                contentEditable={!disabled}
                onInput={handleContentChange}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                className={`min-h-[120px] p-3 focus:outline-none ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
                style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    wordBreak: 'break-word'
                }}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />

            {/* Estilo para placeholder */}
            <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          font-style: italic;
        }
      `}</style>
        </div>
    );
};

export const FAQViewCustomizer: React.FC<FAQViewCustomizerProps> = ({
    onChange,
    isSubmitting = false,
    errors = {},
    settings,
    faqSettings,
    ...props
}) => {
    // Estados locales para configuraciones específicas de FAQ
    const [faqConfig, setFaqConfig] = useState<FAQAdditionalSettings>({
        customTitles: {
            en: 'Frequently Asked Questions',
            es: 'Preguntas Frecuentes'
        },
        enableSearch: true,
        groupByCategory: false,
        showContactInfo: true,
        allowVoting: false,
        enableComments: false,
        questionsPerPage: 10,
        showQuestionNumbers: true,
        faqItems: [],
        allowPublicSubmissions: false,
        requireApprovalForSubmissions: true,
        showAuthor: false,
        enableEmailNotifications: true,
        ...faqSettings?.additionalSettings
    });

    // Estados para el formulario de nueva pregunta/edición
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
    const [questionForm, setQuestionForm] = useState({
        question: '',
        answer: ''
    });

    // Sincronizar con cambios del padre
    useEffect(() => {
        if (faqSettings?.additionalSettings) {
            setFaqConfig(prev => ({
                ...prev,
                ...faqSettings.additionalSettings
            }));
        }
    }, [faqSettings?.additionalSettings]);

    // Manejador para cambios en configuraciones específicas de FAQ
    const handleFaqConfigChange = (field: keyof FAQAdditionalSettings, value: any) => {
        const newConfig = { ...faqConfig, [field]: value };
        setFaqConfig(newConfig);

        // Enviar al componente padre
        onChange('additionalSettings', newConfig);
    };

    // Manejador para títulos multiidioma
    const handleTitleChange = (language: 'en' | 'es', title: string) => {
        const newTitles = {
            ...faqConfig.customTitles,
            [language]: title
        };
        handleFaqConfigChange('customTitles', newTitles);
    };

    // Funciones para gestión de preguntas FAQ
    const generateId = () => `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addQuestion = () => {
        if (questionForm.question.trim() && questionForm.answer.trim()) {
            const newQuestion: FAQItem = {
                id: generateId(),
                question: questionForm.question.trim(),
                answer: questionForm.answer,
                isActive: true,
                order: (faqConfig.faqItems?.length || 0) + 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const updatedItems = [...(faqConfig.faqItems || []), newQuestion];
            handleFaqConfigChange('faqItems', updatedItems);

            // Limpiar formulario
            setQuestionForm({ question: '', answer: '' });
            setIsAddingQuestion(false);
        }
    };

    const updateQuestion = (id: string) => {
        if (questionForm.question.trim() && questionForm.answer.trim()) {
            const updatedItems = (faqConfig.faqItems || []).map(item =>
                item.id === id
                    ? {
                        ...item,
                        question: questionForm.question.trim(),
                        answer: questionForm.answer,
                        updatedAt: new Date()
                    }
                    : item
            );

            handleFaqConfigChange('faqItems', updatedItems);

            // Limpiar formulario
            setQuestionForm({ question: '', answer: '' });
            setEditingQuestion(null);
        }
    };

    const deleteQuestion = (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
            const updatedItems = (faqConfig.faqItems || []).filter(item => item.id !== id);
            handleFaqConfigChange('faqItems', updatedItems);
        }
    };

    const toggleQuestionStatus = (id: string) => {
        const updatedItems = (faqConfig.faqItems || []).map(item =>
            item.id === id
                ? { ...item, isActive: !item.isActive, updatedAt: new Date() }
                : item
        );
        handleFaqConfigChange('faqItems', updatedItems);
    };

    const startEditing = (question: FAQItem) => {
        setQuestionForm({
            question: question.question,
            answer: question.answer
        });
        setEditingQuestion(question.id);
        setIsAddingQuestion(false);
    };

    const cancelEditing = () => {
        setQuestionForm({ question: '', answer: '' });
        setEditingQuestion(null);
        setIsAddingQuestion(false);
    };

    const startAdding = () => {
        setQuestionForm({ question: '', answer: '' });
        setEditingQuestion(null);
        setIsAddingQuestion(true);
    };

    return (
        <div className="space-y-6">
            {/* Configuración básica de fondo */}
            <ViewCustomizer
                title="Configuración de Vista FAQ"
                description="Personaliza la apariencia y gestiona las preguntas frecuentes"
                onChange={onChange}
                isSubmitting={isSubmitting}
                errors={errors}
                settings={settings}
                {...props}
            />

            {/* Configuraciones específicas de FAQ */}
            <div className="px-6 py-6 space-y-8 border-t border-gray-200">
                <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Configuraciones Específicas de FAQ
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
                                    value={faqConfig.customTitles?.es || ''}
                                    onChange={(e) => handleTitleChange('es', e.target.value)}
                                    placeholder="Preguntas Frecuentes"
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
                                    value={faqConfig.customTitles?.en || ''}
                                    onChange={(e) => handleTitleChange('en', e.target.value)}
                                    placeholder="Frequently Asked Questions"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuraciones de visualización */}
                    {/* <div className="mb-8 p-4 bg-green-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-800 mb-3">Configuraciones de Visualización</h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        id="enableSearch"
                                        type="checkbox"
                                        checked={faqConfig.enableSearch || false}
                                        onChange={(e) => handleFaqConfigChange('enableSearch', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="enableSearch" className="ml-2 text-sm text-gray-700">
                                        Habilitar búsqueda
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="showContactInfo"
                                        type="checkbox"
                                        checked={faqConfig.showContactInfo || false}
                                        onChange={(e) => handleFaqConfigChange('showContactInfo', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="showContactInfo" className="ml-2 text-sm text-gray-700">
                                        Mostrar información de contacto
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="showQuestionNumbers"
                                        type="checkbox"
                                        checked={faqConfig.showQuestionNumbers || false}
                                        onChange={(e) => handleFaqConfigChange('showQuestionNumbers', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="showQuestionNumbers" className="ml-2 text-sm text-gray-700">
                                        Mostrar números de pregunta
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        id="allowVoting"
                                        type="checkbox"
                                        checked={faqConfig.allowVoting || false}
                                        onChange={(e) => handleFaqConfigChange('allowVoting', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="allowVoting" className="ml-2 text-sm text-gray-700">
                                        Permitir votación (útil/no útil)
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="enableComments"
                                        type="checkbox"
                                        checked={faqConfig.enableComments || false}
                                        onChange={(e) => handleFaqConfigChange('enableComments', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="enableComments" className="ml-2 text-sm text-gray-700">
                                        Permitir comentarios
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preguntas por página
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="50"
                                        value={faqConfig.questionsPerPage || 10}
                                        onChange={(e) => handleFaqConfigChange('questionsPerPage', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Gestión de preguntas FAQ */}
                    <div className="mb-8 p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-medium text-gray-800">
                                Gestión de Preguntas ({faqConfig.faqItems?.length || 0} preguntas)
                            </h5>
                            <button
                                type="button"
                                onClick={startAdding}
                                disabled={isSubmitting || isAddingQuestion || editingQuestion !== null}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Agregar Pregunta</span>
                            </button>
                        </div>

                        {/* Formulario para agregar/editar pregunta */}
                        {(isAddingQuestion || editingQuestion) && (
                            <div className="mb-6 p-4 bg-white border-2 border-blue-200 rounded-lg">
                                <h6 className="text-sm font-medium text-gray-800 mb-3">
                                    {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
                                </h6>

                                <div className="space-y-4">
                                    {/* Campo pregunta */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pregunta *
                                        </label>
                                        <input
                                            type="text"
                                            value={questionForm.question}
                                            onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                            placeholder="¿Cuál es tu pregunta?"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Campo respuesta con Rich Text Editor */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Respuesta *
                                        </label>
                                        <RichTextEditor
                                            value={questionForm.answer}
                                            onChange={(value) => setQuestionForm(prev => ({ ...prev, answer: value }))}
                                            placeholder="Escribe la respuesta detallada..."
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={editingQuestion ? () => updateQuestion(editingQuestion) : addQuestion}
                                            disabled={isSubmitting || !questionForm.question.trim() || !questionForm.answer.trim()}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span>{editingQuestion ? 'Actualizar' : 'Guardar'}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Cancelar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lista de preguntas existentes */}
                        <div className="space-y-3">
                            {faqConfig.faqItems && faqConfig.faqItems.length > 0 ? (
                                faqConfig.faqItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 border rounded-lg ${item.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-75'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${item.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {item.isActive ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </div>

                                                <h6 className="text-sm font-medium text-gray-900 mb-2">
                                                    {item.question}
                                                </h6>

                                                <div
                                                    className="text-sm text-gray-600 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: item.answer }}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(item)}
                                                    disabled={isSubmitting || isAddingQuestion || editingQuestion !== null}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Editar pregunta"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleQuestionStatus(item.id)}
                                                    disabled={isSubmitting}
                                                    className={`p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${item.isActive
                                                            ? 'text-yellow-600 hover:bg-yellow-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={item.isActive ? 'Desactivar pregunta' : 'Activar pregunta'}
                                                >
                                                    {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteQuestion(item.id)}
                                                    disabled={isSubmitting}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Eliminar pregunta"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">No hay preguntas frecuentes configuradas.</p>
                                    <p className="text-xs">Haz clic en "Agregar Pregunta" para comenzar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};