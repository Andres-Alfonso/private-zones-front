// app/components/activities/games/word-search/WordSearchForm.tsx

import { Form } from "@remix-run/react";
import { useState } from "react";
import { Plus, Trash2, Grid3x3, Zap, Award, AlertCircle } from "lucide-react";
import type { WordSearchGame, WordDirection } from "~/api/types/word-search.types";

interface WordSearchFormProps {
    activityId: string;
    initialData?: WordSearchGame;
    errors?: Array<{ field: string; message: string }>;
    isEdit?: boolean;
}

interface WordFormData {
    word: string;
    clue: string;
    category: string;
}

const DIRECTION_OPTIONS: Array<{ value: WordDirection; label: string }> = [
    { value: 'horizontal' as WordDirection, label: 'Horizontal →' },
    { value: 'vertical' as WordDirection, label: 'Vertical ↓' },
    { value: 'diagonal_down' as WordDirection, label: 'Diagonal ↘' },
    { value: 'diagonal_up' as WordDirection, label: 'Diagonal ↗' },
    { value: 'horizontal_reverse' as WordDirection, label: 'Horizontal ← (Reversa)' },
    { value: 'vertical_reverse' as WordDirection, label: 'Vertical ↑ (Reversa)' },
    { value: 'diagonal_down_reverse' as WordDirection, label: 'Diagonal ↖ (Reversa)' },
    { value: 'diagonal_up_reverse' as WordDirection, label: 'Diagonal ↙ (Reversa)' },
];

export default function WordSearchForm({ activityId, initialData, errors, isEdit = false }: WordSearchFormProps) {
    // Estado de palabras
    const [words, setWords] = useState<WordFormData[]>(
        initialData?.words.map(w => ({
            word: w.word,
            clue: w.clue || '',
            category: w.category || ''
        })) || [{ word: '', clue: '', category: '' }]
    );

    // Estado de configuración del grid
    const [gridWidth, setGridWidth] = useState(initialData?.gridWidth || 15);
    const [gridHeight, setGridHeight] = useState(initialData?.gridHeight || 15);

    // Estado de direcciones permitidas
    const [allowedDirections, setAllowedDirections] = useState<Set<WordDirection>>(
        new Set(initialData?.allowedDirections || ['horizontal', 'vertical', 'diagonal_down'] as WordDirection[])
    );

    // Estado de opciones
    const [fillEmptyCells, setFillEmptyCells] = useState(initialData?.fillEmptyCells ?? true);
    const [caseSensitive, setCaseSensitive] = useState(initialData?.caseSensitive ?? false);
    const [showWordList, setShowWordList] = useState(initialData?.showWordList ?? true);
    const [showClues, setShowClues] = useState(initialData?.showClues ?? false);

    // Estado de puntuación
    const [pointsPerWord, setPointsPerWord] = useState(initialData?.pointsPerWord || 10);
    const [bonusForSpeed, setBonusForSpeed] = useState(initialData?.bonusForSpeed || 5);
    const [penaltyPerHint, setPenaltyPerHint] = useState(initialData?.penaltyPerHint || -2);

    // Funciones para gestionar palabras
    const addWord = () => {
        if (words.length < 50) {
            setWords([...words, { word: '', clue: '', category: '' }]);
        }
    };

    const removeWord = (index: number) => {
        if (words.length > 1) {
            setWords(words.filter((_, i) => i !== index));
        }
    };

    const updateWord = (index: number, field: keyof WordFormData, value: string) => {
        const newWords = [...words];
        newWords[index][field] = value;
        setWords(newWords);
    };

    // Funciones para gestionar direcciones
    const toggleDirection = (direction: WordDirection) => {
        const newDirections = new Set(allowedDirections);
        if (newDirections.has(direction)) {
            if (newDirections.size > 1) { // Mantener al menos una dirección
                newDirections.delete(direction);
            }
        } else {
            newDirections.add(direction);
        }
        setAllowedDirections(newDirections);
    };

    // Validación básica
    const validateWords = () => {
        const filledWords = words.filter(w => w.word.trim() !== '');
        if (filledWords.length === 0) {
            return "Debe agregar al menos una palabra";
        }
        
        for (const word of filledWords) {
            if (word.word.length < 2) {
                return "Todas las palabras deben tener al menos 2 caracteres";
            }
            if (word.word.length > 20) {
                return "Las palabras no pueden tener más de 20 caracteres";
            }
        }
        
        return null;
    };

    const validationError = validateWords();

    return (
        <Form method="post" className="space-y-6">
            {/* Hidden fields */}
            <input type="hidden" name="words" value={JSON.stringify(words.filter(w => w.word.trim() !== ''))} />
            <input type="hidden" name="gridWidth" value={gridWidth} />
            <input type="hidden" name="gridHeight" value={gridHeight} />
            <input type="hidden" name="allowedDirections" value={JSON.stringify(Array.from(allowedDirections))} />
            <input type="hidden" name="fillEmptyCells" value={fillEmptyCells.toString()} />
            <input type="hidden" name="caseSensitive" value={caseSensitive.toString()} />
            <input type="hidden" name="showWordList" value={showWordList.toString()} />
            <input type="hidden" name="showClues" value={showClues.toString()} />
            <input type="hidden" name="pointsPerWord" value={pointsPerWord} />
            <input type="hidden" name="bonusForSpeed" value={bonusForSpeed} />
            <input type="hidden" name="penaltyPerHint" value={penaltyPerHint} />

            {/* Sección: Dimensiones del Grid */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                        <Grid3x3 className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Dimensiones del Tablero</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ancho (10-30 celdas)
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="30"
                            value={gridWidth}
                            onChange={(e) => setGridWidth(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">10</span>
                            <span className="text-2xl font-bold text-purple-600">{gridWidth}</span>
                            <span className="text-sm text-gray-500">30</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alto (10-30 celdas)
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="30"
                            value={gridHeight}
                            onChange={(e) => setGridHeight(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">10</span>
                            <span className="text-2xl font-bold text-purple-600">{gridHeight}</span>
                            <span className="text-sm text-gray-500">30</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-sm text-purple-800">
                        📐 <strong>Tablero:</strong> {gridWidth} × {gridHeight} = {gridWidth * gridHeight} celdas
                    </p>
                </div>
            </div>

            {/* Sección: Palabras */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
                            <span className="text-xl">📝</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Palabras a Buscar</h2>
                            <p className="text-sm text-gray-600">Agrega entre 1 y 50 palabras</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addWord}
                        disabled={words.length >= 50}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Agregar Palabra</span>
                    </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {words.map((word, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Palabra *
                                        </label>
                                        <input
                                            type="text"
                                            value={word.word}
                                            onChange={(e) => updateWord(index, 'word', e.target.value.toUpperCase())}
                                            maxLength={20}
                                            placeholder="EJEMPLO"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{word.word.length}/20 caracteres</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Categoría (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={word.category}
                                            onChange={(e) => updateWord(index, 'category', e.target.value)}
                                            maxLength={50}
                                            placeholder="Ej: Animales, Países..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Pista (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={word.clue}
                                            onChange={(e) => updateWord(index, 'clue', e.target.value)}
                                            maxLength={200}
                                            placeholder="Descripción o ayuda..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeWord(index)}
                                    disabled={words.length === 1}
                                    className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Eliminar palabra"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                        💡 <strong>{words.filter(w => w.word.trim() !== '').length} palabras válidas</strong> de {words.length} total
                    </p>
                </div>
            </div>

            {/* Sección: Direcciones Permitidas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Direcciones Permitidas</h2>
                        <p className="text-sm text-gray-600">Selecciona las direcciones para colocar palabras</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DIRECTION_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleDirection(option.value)}
                            className={`
                                p-4 rounded-xl border-2 transition-all text-left
                                ${allowedDirections.has(option.value)
                                    ? 'border-green-500 bg-green-50 shadow-md'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                }
                            `}
                        >
                            <div className="text-sm font-medium text-gray-900">
                                {option.label}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-800">
                        ✓ <strong>{allowedDirections.size} direcciones</strong> seleccionadas
                    </p>
                </div>
            </div>

            {/* Sección: Opciones de Visualización */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-xl">
                        <span className="text-xl text-white">👁️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Opciones de Visualización</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={fillEmptyCells}
                            onChange={(e) => setFillEmptyCells(e.target.checked)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <div>
                            <div className="font-medium text-gray-900">Rellenar celdas vacías</div>
                            <div className="text-sm text-gray-600">Agrega letras aleatorias en espacios vacíos</div>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <div>
                            <div className="font-medium text-gray-900">Sensible a mayúsculas</div>
                            <div className="text-sm text-gray-600">Diferenciar entre mayúsculas y minúsculas</div>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={showWordList}
                            onChange={(e) => setShowWordList(e.target.checked)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <div>
                            <div className="font-medium text-gray-900">Mostrar lista de palabras</div>
                            <div className="text-sm text-gray-600">El jugador ve las palabras a buscar</div>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={showClues}
                            onChange={(e) => setShowClues(e.target.checked)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <div>
                            <div className="font-medium text-gray-900">Mostrar pistas en lugar de palabras</div>
                            <div className="text-sm text-gray-600">Más desafiante: muestra las pistas en vez de las palabras</div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Sección: Sistema de Puntuación */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-2 rounded-xl">
                        <Award className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Sistema de Puntuación</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Puntos por palabra (1-100)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={pointsPerWord}
                            onChange={(e) => setPointsPerWord(parseInt(e.target.value) || 10)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Base de puntos por cada palabra encontrada</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bonus por velocidad (0-50)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={bonusForSpeed}
                            onChange={(e) => setBonusForSpeed(parseInt(e.target.value) || 5)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Puntos extra por completar rápido</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Penalización por pista (-10 a 0)
                        </label>
                        <input
                            type="number"
                            min="-10"
                            max="0"
                            value={penaltyPerHint}
                            onChange={(e) => setPenaltyPerHint(parseInt(e.target.value) || -2)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Puntos restados por usar pistas</p>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                        🏆 <strong>Puntaje máximo posible:</strong> {words.filter(w => w.word.trim() !== '').length * (pointsPerWord + bonusForSpeed)} puntos
                    </p>
                </div>
            </div>

            {/* Alerta de validación */}
            {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-900">Error de validación</p>
                        <p className="text-sm text-red-700">{validationError}</p>
                    </div>
                </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!!validationError}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isEdit ? 'Actualizar Sopa de Letras' : 'Crear Sopa de Letras'}
                </button>
            </div>
        </Form>
    );
}