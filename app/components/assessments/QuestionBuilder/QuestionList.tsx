// app/components/assessments/QuestionBuilder/QuestionList.tsx

import { useState } from 'react';
import {
    Plus, Edit2, Trash2, Copy, GripVertical,
    CheckCircle, XCircle, Star, Menu
} from 'lucide-react';
import type { Question, QuestionType } from './QuestionBuilder';

interface QuestionListProps {
    questions: Question[];
    onEdit: (question: Question) => void;
    onDelete: (questionId: string) => void;
    onDuplicate: (question: Question) => void;
    onReorder: (startIndex: number, endIndex: number) => void;
    onCreateNew: (type: QuestionType) => void;
    readOnly?: boolean;
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

const questionTypeColors: Record<QuestionType, string> = {
    multiple_choice: 'bg-blue-100 text-blue-800',
    multiple_response: 'bg-purple-100 text-purple-800',
    true_false: 'bg-green-100 text-green-800',
    short_answer: 'bg-yellow-100 text-yellow-800',
    essay: 'bg-orange-100 text-orange-800',
    matching: 'bg-pink-100 text-pink-800',
    ordering: 'bg-indigo-100 text-indigo-800',
    fill_in_blank: 'bg-teal-100 text-teal-800',
    scale: 'bg-cyan-100 text-cyan-800',
    matrix: 'bg-red-100 text-red-800'
};

export default function QuestionList({
    questions,
    onEdit,
    onDelete,
    onDuplicate,
    onReorder,
    onCreateNew,
    readOnly = false
}: QuestionListProps) {

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showTypeMenu, setShowTypeMenu] = useState(false);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        onReorder(draggedIndex, index);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const getQuestionText = (question: Question): string => {
        const translation = question.translations.find(t => t.languageCode === 'es');
        return translation?.questionText || 'Sin texto';
    };

    const getDifficultyBadge = (difficulty?: string) => {
        if (!difficulty) return null;

        const colors = {
            easy: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            hard: 'bg-red-100 text-red-800'
        };

        const labels = {
            easy: 'Fácil',
            medium: 'Media',
            hard: 'Difícil'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty as keyof typeof colors]}`}>
                {labels[difficulty as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="space-y-4">

            {/* Botón para agregar pregunta */}
            {/* Agregamos z-20 al contenedor del botón para que esté por encima de la lista */}
            <div className="relative z-20"> 
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowTypeMenu(!showTypeMenu)}
                            disabled={readOnly}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Agregar Pregunta</span>
                        </button>

                        {/* Menú de tipos de pregunta */}
                        {showTypeMenu && (
                            <>
                                {/* Overlay invisible para cerrar el menú al hacer clic fuera */}
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowTypeMenu(false)} 
                                />
                                
                                {/* Menú ajustado con z-50 */}
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in duration-200">
                                    <div className="p-2 space-y-1">
                                        {(Object.keys(questionTypeLabels) as QuestionType[]).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    onCreateNew(type);
                                                    setShowTypeMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                            >
                                                <span className="text-gray-900 font-medium">{questionTypeLabels[type]}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${questionTypeColors[type]}`}>
                                                    {type}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Lista de preguntas */}
            {questions.length === 0 ? (
                <div className="relative z-0"> {/* Reducimos z-index aquí */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
                        <Menu className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay preguntas aún
                        </h3>
                        <p className="text-gray-600">
                            Comienza agregando tu primera pregunta usando el botón de arriba
                        </p>
                    </div>
                </div>

            ) : (
                <div className="relative z-10 space-y-3">
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            draggable={!readOnly}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 transition-all duration-200 ${draggedIndex === index ? 'opacity-50' : 'hover:shadow-xl'
                                }`}
                        >
                            <div className="flex items-start space-x-4">

                                {/* Drag handle */}
                                {!readOnly && (
                                    <div className="flex-shrink-0 cursor-move pt-1">
                                        <GripVertical className="h-5 w-5 text-gray-400" />
                                    </div>
                                )}

                                {/* Número de pregunta */}
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-medium line-clamp-2">
                                                {getQuestionText(question) || <span className="text-gray-400 italic">Sin texto</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metadatos */}
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${questionTypeColors[question.type]}`}>
                                            {questionTypeLabels[question.type]}
                                        </span>

                                        {question.isGradable ? (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                {question.points} {question.points === 1 ? 'punto' : 'puntos'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                No calificable
                                            </span>
                                        )}

                                        {question.isRequired && (
                                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                                <Star className="h-3 w-3 mr-1" />
                                                Obligatoria
                                            </span>
                                        )}

                                        {getDifficultyBadge(question.difficulty)}

                                        {question.category && (
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {question.category}
                                            </span>
                                        )}

                                        {question.options && question.options.length > 0 && (
                                            <span className="text-xs text-gray-500">
                                                {question.options.length} {question.options.length === 1 ? 'opción' : 'opciones'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones */}
                                {!readOnly && (
                                    <div className="flex-shrink-0 flex items-center space-x-2">
                                        <button
                                            onClick={() => onEdit(question)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => onDuplicate(question)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Duplicar"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => onDelete(question.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}