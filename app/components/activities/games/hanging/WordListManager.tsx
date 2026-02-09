// app/components/activities/games/hanging/WordListManager.tsx

import { Plus, Trash2, GripVertical } from "lucide-react";
import type { HangingWord } from "~/api/types/hanging.types";

interface WordListManagerProps {
    words: HangingWord[];
    onChange: (words: HangingWord[]) => void;
}

export default function WordListManager({ words, onChange }: WordListManagerProps) {
    
    const addWord = () => {
        onChange([...words, { word: "", category: "", clue: "" }]);
    };

    const removeWord = (index: number) => {
        if (words.length > 1) {
            onChange(words.filter((_, i) => i !== index));
        }
    };

    const updateWord = (index: number, field: keyof HangingWord, value: string) => {
        const updated = words.map((word, i) => 
            i === index ? { ...word, [field]: value } : word
        );
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                    {words.length} palabra{words.length !== 1 ? "s" : ""} configurada{words.length !== 1 ? "s" : ""}
                </p>
                <button
                    type="button"
                    onClick={addWord}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Palabra</span>
                </button>
            </div>

            <div className="space-y-3">
                {words.map((word, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-red-300 transition-colors"
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-2 cursor-move text-gray-400 hover:text-gray-600">
                                <GripVertical className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Palabra *
                                        </label>
                                        <input
                                            type="text"
                                            value={word.word}
                                            onChange={(e) => updateWord(index, "word", e.target.value.toUpperCase())}
                                            placeholder="CORAZON"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Categoría
                                        </label>
                                        <input
                                            type="text"
                                            value={word.category || ""}
                                            onChange={(e) => updateWord(index, "category", e.target.value)}
                                            placeholder="Órganos"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pista
                                    </label>
                                    <input
                                        type="text"
                                        value={word.clue || ""}
                                        onChange={(e) => updateWord(index, "clue", e.target.value)}
                                        placeholder="Bombea sangre por todo el cuerpo"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeWord(index)}
                                disabled={words.length === 1}
                                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Eliminar palabra"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Palabra #{index + 1}</span>
                                <span>{word.word.length} letra{word.word.length !== 1 ? "s" : ""}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {words.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No hay palabras configuradas</p>
                    <button
                        type="button"
                        onClick={addWord}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Agregar Primera Palabra</span>
                    </button>
                </div>
            )}
        </div>
    );
}