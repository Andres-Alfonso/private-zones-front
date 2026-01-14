// app/components/assessments/QuestionBuilder/QuestionBuilder.tsx

import { useState } from 'react';
import {
    Plus, Save, Eye, Trash2, GripVertical, Copy,
    AlertCircle, CheckCircle
} from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import QuestionList from './QuestionList';
import QuestionPreview from './QuestionPreview';

export type QuestionType =
    | 'multiple_choice'
    | 'multiple_response'
    | 'true_false'
    | 'short_answer'
    | 'essay'
    | 'matching'
    | 'ordering'
    | 'fill_in_blank'
    | 'scale'
    | 'matrix';

export interface QuestionOption {
    id: string;
    order: number;
    isCorrect: boolean;
    partialCreditPercentage?: number;
    matchingPairId?: string;
    matchingGroup?: string;
    translations: {
        languageCode: string;
        optionText: string;
        feedback?: string;
    }[];
}

export interface Question {
    id: string;
    type: QuestionType;
    order: number;
    isGradable: boolean;
    points: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    isRequired: boolean;
    allowPartialCredit: boolean;
    caseSensitive?: boolean;
    minLength?: number;
    maxLength?: number;
    scaleMin?: number;
    scaleMax?: number;
    scaleStep?: number;
    category?: string;
    tag?: string;
    translations: {
        languageCode: string;
        questionText: string;
        hint?: string;
        feedback?: string;
        correctFeedback?: string;
        incorrectFeedback?: string;
        explanation?: string;
    }[];
    options: QuestionOption[];
}

interface QuestionBuilderProps {
    assessmentId: string;
    initialQuestions?: Question[];
    onSave: (questions: Question[]) => Promise<void>;
    readOnly?: boolean;
}

export default function QuestionBuilder({
    assessmentId,
    initialQuestions = [],
    onSave,
    readOnly = false
}: QuestionBuilderProps) {

    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Crear nueva pregunta
    const handleCreateQuestion = (type: QuestionType) => {
        const newQuestion: Question = {
            id: `temp-${Date.now()}`,
            type,
            order: questions.length,
            isGradable: true,
            points: 1,
            isRequired: true,
            allowPartialCredit: false,
            translations: [
                {
                    languageCode: 'es',
                    questionText: '',
                    hint: '',
                    feedback: '',
                    correctFeedback: '',
                    incorrectFeedback: '',
                    explanation: ''
                }
            ],
            options: []
        };

        setQuestions([...questions, newQuestion]);
        setSelectedQuestion(newQuestion);
        setIsEditing(true);
    };

    // Guardar/actualizar pregunta
    const handleSaveQuestion = (question: Question) => {
        const existingIndex = questions.findIndex(q => q.id === question.id);

        if (existingIndex >= 0) {
            // Actualizar existente
            const updated = [...questions];
            updated[existingIndex] = question;
            setQuestions(updated);
        } else {
            // Agregar nueva
            setQuestions([...questions, question]);
        }

        setIsEditing(false);
        setSelectedQuestion(null);
    };

    // Eliminar pregunta
    const handleDeleteQuestion = (questionId: string) => {
        if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
            setQuestions(questions.filter(q => q.id !== questionId));
        }
    };

    // Duplicar pregunta
    const handleDuplicateQuestion = (question: Question) => {
        const duplicated: Question = {
            ...question,
            id: `temp-${Date.now()}`,
            order: questions.length,
            translations: question.translations.map(t => ({ ...t })),
            options: question.options.map(o => ({
                ...o,
                id: `temp-opt-${Date.now()}-${Math.random()}`,
                translations: o.translations.map(t => ({ ...t }))
            }))
        };

        setQuestions([...questions, duplicated]);
    };

    // Reordenar preguntas
    const handleReorder = (startIndex: number, endIndex: number) => {
        const result = Array.from(questions);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        // Actualizar orden
        const reordered = result.map((q, index) => ({
            ...q,
            order: index
        }));

        setQuestions(reordered);
    };

    // Guardar todas las preguntas
    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus('saving');

        try {
            await onSave(questions);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Error saving questions:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Calcular estadísticas
    const stats = {
        total: questions.length,
        gradable: questions.filter(q => q.isGradable).length,
        additional: questions.filter(q => !q.isGradable).length,
        totalPoints: questions.filter(q => q.isGradable).reduce((sum, q) => sum + q.points, 0)
    };

    return (
        <div className="space-y-6">

            {/* Header con estadísticas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Constructor de Preguntas</h2>
                        <p className="text-gray-600 mt-1">
                            Agrega y configura las preguntas de tu evaluación
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <Eye className="h-4 w-4" />
                            <span>{showPreview ? 'Ocultar' : 'Vista Previa'}</span>
                        </button>

                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving || readOnly || questions.length === 0}
                            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSaving ? 'Guardando...' : 'Guardar Todo'}</span>
                        </button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-sm text-purple-600 font-medium">Total Preguntas</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium">Calificables</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.gradable}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-green-600 font-medium">Adicionales</p>
                        <p className="text-2xl font-bold text-green-900">{stats.additional}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-sm text-amber-600 font-medium">Puntos Totales</p>
                        <p className="text-2xl font-bold text-amber-900">{stats.totalPoints}</p>
                    </div>
                </div>

                {/* Mensaje de estado */}
                {saveStatus === 'success' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <p className="text-green-800 font-medium">Preguntas guardadas exitosamente</p>
                        </div>
                    </div>
                )}

                {saveStatus === 'error' && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-800 font-medium">Error al guardar las preguntas</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Lista de preguntas */}
                <div className="xl:col-span-2">
                    <QuestionList
                        questions={questions}
                        onEdit={(question) => {
                            setSelectedQuestion(question);
                            setIsEditing(true);
                        }}
                        onDelete={handleDeleteQuestion}
                        onDuplicate={handleDuplicateQuestion}
                        onReorder={handleReorder}
                        onCreateNew={handleCreateQuestion}
                        readOnly={readOnly}
                    />
                </div>

                {/* Vista previa */}
                {showPreview && (
                    <div className="xl:col-span-1">
                        <QuestionPreview questions={questions} />
                    </div>
                )}
            </div>

            {/* Editor modal */}
            {isEditing && selectedQuestion && (
                <QuestionEditor
                    question={selectedQuestion}
                    onSave={handleSaveQuestion}
                    onCancel={() => {
                        setIsEditing(false);
                        setSelectedQuestion(null);
                    }}
                />
            )}
        </div>
    );
}