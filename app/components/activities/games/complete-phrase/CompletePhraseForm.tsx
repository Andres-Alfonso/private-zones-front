// app/components/activities/games/complete-phrase/CompletePhraseForm.tsx

import { Form } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Settings } from "lucide-react";
import type { CompletePhraseGame, CompletePhraseItem, PhraseBlank, BlankType, BlankOption } from "~/api/types/complete-phrase.types";

interface CompletePhraseFormProps {
    activityId: string;
    initialData?: CompletePhraseGame;
    errors?: Array<{ field: string; message: string }>;
    isEdit?: boolean;
}

export default function CompletePhraseForm({ activityId, initialData, errors, isEdit }: CompletePhraseFormProps) {
    const [phrases, setPhrases] = useState<CompletePhraseItem[]>(
        initialData?.phrases || [
            {
                phrase: "",
                blanks: [],
                category: "",
                difficulty: "medium",
                hint: "",
            },
        ]
    );

    const [caseSensitive, setCaseSensitive] = useState(initialData?.caseSensitive ?? false);
    const [showHints, setShowHints] = useState(initialData?.showHints ?? true);
    const [shuffleOptions, setShuffleOptions] = useState(initialData?.shuffleOptions ?? false);
    const [allowPartialCredit, setAllowPartialCredit] = useState(initialData?.allowPartialCredit ?? false);
    const [pointsPerBlank, setPointsPerBlank] = useState(initialData?.pointsPerBlank ?? 10);
    const [bonusForPerfect, setBonusForPerfect] = useState(initialData?.bonusForPerfect ?? 5);
    const [penaltyPerError, setPenaltyPerError] = useState(initialData?.penaltyPerError ?? -1);
    const [penaltyPerHint, setPenaltyPerHint] = useState(initialData?.penaltyPerHint ?? -2);

    const addPhrase = () => {
        setPhrases([
            ...phrases,
            {
                phrase: "",
                blanks: [],
                category: "",
                difficulty: "medium",
                hint: "",
            },
        ]);
    };

    const removePhrase = (index: number) => {
        if (phrases.length > 1) {
            setPhrases(phrases.filter((_, i) => i !== index));
        }
    };

    const updatePhrase = (index: number, field: keyof CompletePhraseItem, value: any) => {
        const newPhrases = [...phrases];
        newPhrases[index] = { ...newPhrases[index], [field]: value };
        setPhrases(newPhrases);
    };

    const addBlank = (phraseIndex: number) => {
        const newPhrases = [...phrases];
        const currentBlanks = newPhrases[phraseIndex].blanks || [];
        const newBlankId = currentBlanks.length;
        
        newPhrases[phraseIndex].blanks = [
            ...currentBlanks,
            {
                id: newBlankId,
                type: 'text' as BlankType,
                correctAnswer: "",
                caseSensitive: false,
                acceptSynonyms: false,
                synonyms: [],
            },
        ];
        setPhrases(newPhrases);
    };

    const removeBlank = (phraseIndex: number, blankIndex: number) => {
        const newPhrases = [...phrases];
        newPhrases[phraseIndex].blanks = newPhrases[phraseIndex].blanks.filter((_, i) => i !== blankIndex);
        // Re-indexar los IDs
        newPhrases[phraseIndex].blanks = newPhrases[phraseIndex].blanks.map((blank, idx) => ({
            ...blank,
            id: idx,
        }));
        setPhrases(newPhrases);
    };

    const updateBlank = (phraseIndex: number, blankIndex: number, field: keyof PhraseBlank, value: any) => {
        const newPhrases = [...phrases];
        newPhrases[phraseIndex].blanks[blankIndex] = {
            ...newPhrases[phraseIndex].blanks[blankIndex],
            [field]: value,
        };
        setPhrases(newPhrases);
    };

    const addOption = (phraseIndex: number, blankIndex: number) => {
        const newPhrases = [...phrases];
        const blank = newPhrases[phraseIndex].blanks[blankIndex];
        const currentOptions = blank.options || [];
        
        newPhrases[phraseIndex].blanks[blankIndex].options = [
            ...currentOptions,
            { text: "", isCorrect: false },
        ];
        setPhrases(newPhrases);
    };

    const removeOption = (phraseIndex: number, blankIndex: number, optionIndex: number) => {
        const newPhrases = [...phrases];
        const blank = newPhrases[phraseIndex].blanks[blankIndex];
        if (blank.options) {
            blank.options = blank.options.filter((_, i) => i !== optionIndex);
        }
        setPhrases(newPhrases);
    };

    const updateOption = (
        phraseIndex: number,
        blankIndex: number,
        optionIndex: number,
        field: keyof BlankOption,
        value: any
    ) => {
        const newPhrases = [...phrases];
        const blank = newPhrases[phraseIndex].blanks[blankIndex];
        if (blank.options) {
            blank.options[optionIndex] = {
                ...blank.options[optionIndex],
                [field]: value,
            };
        }
        setPhrases(newPhrases);
    };

    const addSynonym = (phraseIndex: number, blankIndex: number) => {
        const newPhrases = [...phrases];
        const blank = newPhrases[phraseIndex].blanks[blankIndex];
        const currentSynonyms = blank.synonyms || [];
        
        newPhrases[phraseIndex].blanks[blankIndex].synonyms = [...currentSynonyms, ""];
        setPhrases(newPhrases);
    };

    const removeSynonym = (phraseIndex: number, blankIndex: number, synonymIndex: number) => {
        const newPhrases = [...phrases];
        const blank = newPhrases[phraseIndex].blanks[blankIndex];
        if (blank.synonyms) {
            blank.synonyms = blank.synonyms.filter((_, i) => i !== synonymIndex);
        }
        setPhrases(newPhrases);
    };

    const updateSynonym = (phraseIndex: number, blankIndex: number, synonymIndex: number, value: string) => {
        const newPhrases = [...phrases];
        const blank = newPhrases[phraseIndex].blanks[blankIndex];
        if (blank.synonyms) {
            blank.synonyms[synonymIndex] = value;
        }
        setPhrases(newPhrases);
    };

    return (
        <Form method="post" className="space-y-6">
            {/* Frases */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Frases</h2>
                        <p className="text-sm text-gray-600">
                            Define las frases con espacios en blanco. Usa {"{0}"}, {"{1}"}, etc. para marcar los espacios.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addPhrase}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Agregar Frase</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {phrases.map((phrase, phraseIdx) => (
                        <div
                            key={phraseIdx}
                            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                    <span className="font-semibold text-gray-700">Frase {phraseIdx + 1}</span>
                                </div>
                                {phrases.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePhrase(phraseIdx)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            {/* Frase con marcadores */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frase (usa {"{0}"}, {"{1}"}, etc. para los espacios en blanco)
                                </label>
                                <textarea
                                    value={phrase.phrase}
                                    onChange={(e) => updatePhrase(phraseIdx, "phrase", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder='Ej: "El {0} es el rey de la {1}"'
                                    required
                                />
                            </div>

                            {/* Metadatos de la frase */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categoría (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={phrase.category || ""}
                                        onChange={(e) => updatePhrase(phraseIdx, "category", e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Animales"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dificultad
                                    </label>
                                    <select
                                        value={phrase.difficulty || "medium"}
                                        onChange={(e) => updatePhrase(phraseIdx, "difficulty", e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="easy">Fácil</option>
                                        <option value="medium">Media</option>
                                        <option value="hard">Difícil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pista general (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={phrase.hint || ""}
                                        onChange={(e) => updatePhrase(phraseIdx, "hint", e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Pista para toda la frase"
                                    />
                                </div>
                            </div>

                            {/* Botón para agregar blanco */}
                            <button
                                type="button"
                                onClick={() => addBlank(phraseIdx)}
                                className="mb-4 flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Agregar Espacio en Blanco</span>
                            </button>

                            {/* Espacios en blanco */}
                            <div className="space-y-4">
                                {phrase.blanks && phrase.blanks.map((blank, blankIdx) => (
                                    <div
                                        key={blankIdx}
                                        className="bg-white rounded-lg p-4 border border-purple-200"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-medium text-purple-700">
                                                Blanco {"{" + blankIdx + "}"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeBlank(phraseIdx, blankIdx)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tipo de entrada
                                                </label>
                                                <select
                                                    value={blank.type}
                                                    onChange={(e) =>
                                                        updateBlank(phraseIdx, blankIdx, "type", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm"
                                                >
                                                    <option value="text">Texto libre</option>
                                                    <option value="select">Selección múltiple</option>
                                                    <option value="drag_drop">Arrastrar y soltar</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Respuesta correcta
                                                </label>
                                                <input
                                                    type="text"
                                                    value={blank.correctAnswer}
                                                    onChange={(e) =>
                                                        updateBlank(phraseIdx, blankIdx, "correctAnswer", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Opciones para SELECT y DRAG_DROP */}
                                        {(blank.type === 'select' || blank.type === 'drag_drop') && (
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Opciones
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addOption(phraseIdx, blankIdx)}
                                                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                    >
                                                        + Opción
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {blank.options?.map((option, optIdx) => (
                                                        <div key={optIdx} className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) =>
                                                                    updateOption(
                                                                        phraseIdx,
                                                                        blankIdx,
                                                                        optIdx,
                                                                        "text",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="flex-1 px-3 py-1 rounded border border-gray-300 text-sm"
                                                                placeholder="Texto de la opción"
                                                            />
                                                            <label className="flex items-center space-x-1 text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={option.isCorrect}
                                                                    onChange={(e) =>
                                                                        updateOption(
                                                                            phraseIdx,
                                                                            blankIdx,
                                                                            optIdx,
                                                                            "isCorrect",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="rounded"
                                                                />
                                                                <span>Correcta</span>
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeOption(phraseIdx, blankIdx, optIdx)
                                                                }
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Opciones adicionales para TEXT */}
                                        {blank.type === 'text' && (
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={blank.caseSensitive || false}
                                                        onChange={(e) =>
                                                            updateBlank(
                                                                phraseIdx,
                                                                blankIdx,
                                                                "caseSensitive",
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="rounded"
                                                    />
                                                    <span>Sensible a mayúsculas/minúsculas</span>
                                                </label>

                                                <label className="flex items-center space-x-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={blank.acceptSynonyms || false}
                                                        onChange={(e) =>
                                                            updateBlank(
                                                                phraseIdx,
                                                                blankIdx,
                                                                "acceptSynonyms",
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="rounded"
                                                    />
                                                    <span>Aceptar sinónimos</span>
                                                </label>

                                                {/* Sinónimos */}
                                                {blank.acceptSynonyms && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-xs font-medium text-gray-700">
                                                                Sinónimos aceptados
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => addSynonym(phraseIdx, blankIdx)}
                                                                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            >
                                                                + Sinónimo
                                                            </button>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {blank.synonyms?.map((synonym, synIdx) => (
                                                                <div key={synIdx} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="text"
                                                                        value={synonym}
                                                                        onChange={(e) =>
                                                                            updateSynonym(
                                                                                phraseIdx,
                                                                                blankIdx,
                                                                                synIdx,
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        className="flex-1 px-2 py-1 rounded border border-gray-300 text-xs"
                                                                        placeholder="Sinónimo"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeSynonym(phraseIdx, blankIdx, synIdx)
                                                                        }
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configuración General */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <Settings className="h-6 w-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900">Configuración General</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Opciones booleanas */}
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={caseSensitive}
                                onChange={(e) => setCaseSensitive(e.target.checked)}
                                className="w-5 h-5 rounded text-blue-600"
                            />
                            <span className="text-gray-700">Sensible a mayúsculas/minúsculas</span>
                        </label>

                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={showHints}
                                onChange={(e) => setShowHints(e.target.checked)}
                                className="w-5 h-5 rounded text-blue-600"
                            />
                            <span className="text-gray-700">Mostrar pistas</span>
                        </label>

                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={shuffleOptions}
                                onChange={(e) => setShuffleOptions(e.target.checked)}
                                className="w-5 h-5 rounded text-blue-600"
                            />
                            <span className="text-gray-700">Mezclar opciones (SELECT/DRAG_DROP)</span>
                        </label>

                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={allowPartialCredit}
                                onChange={(e) => setAllowPartialCredit(e.target.checked)}
                                className="w-5 h-5 rounded text-blue-600"
                            />
                            <span className="text-gray-700">Permitir crédito parcial</span>
                        </label>
                    </div>

                    {/* Puntuaciones */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puntos por blanco correcto
                            </label>
                            <input
                                type="number"
                                value={pointsPerBlank}
                                onChange={(e) => setPointsPerBlank(parseInt(e.target.value))}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bonus por frase perfecta
                            </label>
                            <input
                                type="number"
                                value={bonusForPerfect}
                                onChange={(e) => setBonusForPerfect(parseInt(e.target.value))}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Penalización por error
                            </label>
                            <input
                                type="number"
                                value={penaltyPerError}
                                onChange={(e) => setPenaltyPerError(parseInt(e.target.value))}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                max="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Penalización por pista
                            </label>
                            <input
                                type="number"
                                value={penaltyPerHint}
                                onChange={(e) => setPenaltyPerHint(parseInt(e.target.value))}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                max="0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden inputs para envío del formulario */}
            <input type="hidden" name="phrases" value={JSON.stringify(phrases)} />
            <input type="hidden" name="caseSensitive" value={String(caseSensitive)} />
            <input type="hidden" name="showHints" value={String(showHints)} />
            <input type="hidden" name="shuffleOptions" value={String(shuffleOptions)} />
            <input type="hidden" name="allowPartialCredit" value={String(allowPartialCredit)} />
            <input type="hidden" name="pointsPerBlank" value={String(pointsPerBlank)} />
            <input type="hidden" name="bonusForPerfect" value={String(bonusForPerfect)} />
            <input type="hidden" name="penaltyPerError" value={String(penaltyPerError)} />
            <input type="hidden" name="penaltyPerHint" value={String(penaltyPerHint)} />

            {/* Botón de envío */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                >
                    {isEdit ? "Actualizar Juego" : "Crear Juego"}
                </button>
            </div>
        </Form>
    );
}