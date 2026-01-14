// app/components/assessments/QuestionBuilder/QuestionEditor.tsx

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Question, QuestionType } from './QuestionBuilder';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import MultipleChoiceEditor from './QuestionTypes/MultipleChoiceEditor';
import MultipleResponseEditor from './QuestionTypes/MultipleChoiceEditor';
import TrueFalseEditor from './QuestionTypes/TrueFalseEditor';
import ShortAnswerEditor from './QuestionTypes/ShortAnswerEditor';
import EssayEditor from './QuestionTypes/EssayEditor';

interface QuestionEditorProps {
    question: Question;
    onSave: (question: Question) => void;
    onCancel: () => void;
}

const questionTypeLabels: Record<QuestionType, string> = {
    multiple_choice: 'Opción Múltiple',
    multiple_response: 'Múltiple Respuesta',
    true_false: 'Verdadero/Falso',
    short_answer: 'Respuesta Corta',
    essay: 'Ensayo',
    matching: 'Emparejar',
    ordering: 'Ordenar',
    fill_in_blank: 'Completar Espacios',
    scale: 'Escala',
    matrix: 'Matriz'
};

export default function QuestionEditor({
    question,
    onSave,
    onCancel
}: QuestionEditorProps) {

    const [formData, setFormData] = useState<Question>(question);
    const [errors, setErrors] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'feedback'>('content');

    useEffect(() => {
        setFormData(question);
    }, [question]);

    const updateField = (field: keyof Question, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateTranslation = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            translations: prev.translations.map(t =>
                t.languageCode === 'es'
                    ? { ...t, [field]: value }
                    : t
            )
        }));
    };

    const getTranslation = (field: string): string => {
        const translation = formData.translations.find(t => t.languageCode === 'es');
        return (translation as any)?.[field] || '';
    };

    const validate = (): boolean => {
        const newErrors: string[] = [];

        if (!getTranslation('questionText').trim()) {
            newErrors.push('El texto de la pregunta es requerido');
        }

        if (formData.isGradable && formData.points <= 0) {
            newErrors.push('El puntaje debe ser mayor a 0');
        }

        // Validaciones específicas por tipo
        if (['multiple_choice', 'multiple_response', 'true_false'].includes(formData.type)) {
            if (!formData.options || formData.options.length === 0) {
                newErrors.push('Debe agregar al menos una opción');
            }

            const hasCorrect = formData.options?.some(o => o.isCorrect);
            if (!hasCorrect && formData.isGradable) {
                newErrors.push('Debe marcar al menos una opción como correcta');
            }
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    const renderTypeSpecificEditor = () => {
        const commonProps = {
            question: formData,
            onChange: (updated: Question) => setFormData(updated)
        };

        switch (formData.type) {
            case 'multiple_choice':
                return <MultipleChoiceEditor {...commonProps} />;
            case 'multiple_response':
                return <MultipleResponseEditor {...commonProps} />;
            case 'true_false':
                return <TrueFalseEditor {...commonProps} />;
            case 'short_answer':
                return <ShortAnswerEditor {...commonProps} />;
            case 'essay':
                return <EssayEditor {...commonProps} />;
            default:
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">
                            Editor para tipo "{questionTypeLabels[formData.type]}" en desarrollo
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {question.id.startsWith('temp-') ? 'Nueva Pregunta' : 'Editar Pregunta'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Tipo: {questionTypeLabels[formData.type]}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Errores */}
                {errors.length > 0 && (
                    <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-800 mb-2">Errores de validación:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index} className="text-red-700 text-sm">{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 px-6">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'content'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Contenido
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'settings'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Configuración
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'feedback'
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Retroalimentación
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 max-h-[calc(100vh-20rem)] overflow-y-auto">

                    {/* Tab: Contenido */}
                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Texto de la Pregunta *
                                </label>
                                <textarea
                                    value={getTranslation('questionText')}
                                    onChange={(e) => updateTranslation('questionText', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Escribe aquí el texto de tu pregunta..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pista (opcional)
                                </label>
                                <textarea
                                    value={getTranslation('hint')}
                                    onChange={(e) => updateTranslation('hint', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Pista para ayudar al estudiante..."
                                />
                            </div>

                            {/* Editor específico por tipo */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Opciones de Respuesta
                                </h3>
                                {renderTypeSpecificEditor()}
                            </div>
                        </div>
                    )}

                    {/* Tab: Configuración */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Checkbox
                                    id="isGradable"
                                    label="Pregunta calificable"
                                    checked={formData.isGradable}
                                    onChange={(checked) => updateField('isGradable', checked)}
                                />
                                <Checkbox
                                    id="isRequired"
                                    label="Pregunta obligatoria"
                                    checked={formData.isRequired}
                                    onChange={(checked) => updateField('isRequired', checked)}
                                />
                            </div>

                            {formData.isGradable && (
                                <>
                                    <Input
                                        id="points"
                                        label="Puntos *"
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => updateField('points', parseFloat(e.target.value) || 1)}
                                        min="0.01"
                                        step="0.01"
                                    />

                                    <Checkbox
                                        id="allowPartialCredit"
                                        label="Permitir crédito parcial"
                                        checked={formData.allowPartialCredit}
                                        onChange={(checked) => updateField('allowPartialCredit', checked)}
                                    />
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dificultad
                                </label>
                                <select
                                    value={formData.difficulty || ''}
                                    onChange={(e) => updateField('difficulty', e.target.value || undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Sin especificar</option>
                                    <option value="easy">Fácil</option>
                                    <option value="medium">Media</option>
                                    <option value="hard">Difícil</option>
                                </select>
                            </div>

                            <Input
                                id="category"
                                label="Categoría"
                                type="text"
                                value={formData.category || ''}
                                onChange={(e) => updateField('category', e.target.value || undefined)}
                                placeholder="ej: Anatomía, Fisiología..."
                            />

                            <Input
                                id="tag"
                                label="Etiquetas"
                                type="text"
                                value={formData.tag || ''}
                                onChange={(e) => updateField('tag', e.target.value || undefined)}
                                placeholder="ej: sistema-cardiovascular"
                            />
                        </div>
                    )}

                    {/* Tab: Retroalimentación */}
                    {activeTab === 'feedback' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Retroalimentación General
                                </label>
                                <textarea
                                    value={getTranslation('feedback')}
                                    onChange={(e) => updateTranslation('feedback', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Feedback que siempre se muestra..."
                                />
                            </div>

                            {formData.isGradable && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Feedback para Respuesta Correcta
                                        </label>
                                        <textarea
                                            value={getTranslation('correctFeedback')}
                                            onChange={(e) => updateTranslation('correctFeedback', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            placeholder="¡Excelente! Has respondido correctamente..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Feedback para Respuesta Incorrecta
                                        </label>
                                        <textarea
                                            value={getTranslation('incorrectFeedback')}
                                            onChange={(e) => updateTranslation('incorrectFeedback', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            placeholder="No es correcto. Revisa el tema..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Explicación
                                        </label>
                                        <textarea
                                            value={getTranslation('explanation')}
                                            onChange={(e) => updateTranslation('explanation', e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            placeholder="Explicación detallada de la respuesta correcta..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Save className="h-4 w-4" />
                        <span>Guardar Pregunta</span>
                    </button>
                </div>
            </div>
        </div>
    );
}