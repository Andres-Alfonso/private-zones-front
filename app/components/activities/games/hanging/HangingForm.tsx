// app/components/activities/games/hanging/HangingForm.tsx

import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { Save, Settings, BookOpen, Target } from "lucide-react";
import WordListManager from "./WordListManager";
import Input from "~/components/ui/Input";
import Checkbox from "~/components/ui/Checkbox";
import type { HangingGame, HangingWord } from "~/api/types/hanging.types";

interface HangingFormProps {
    activityId: string;
    initialData?: HangingGame;
    errors?: Array<{ field: string; message: string }>;
    isEdit?: boolean;
}

export default function HangingForm({ 
    activityId, 
    initialData, 
    errors = [],
    isEdit = false 
}: HangingFormProps) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [words, setWords] = useState<HangingWord[]>(
        initialData?.words || [{ word: "", category: "", clue: "" }]
    );

    const [config, setConfig] = useState({
        maxAttempts: initialData?.maxAttempts || 6,
        caseSensitive: initialData?.caseSensitive || false,
        showCategory: initialData?.showCategory ?? true,
        showWordLength: initialData?.showWordLength || false,
        pointsPerWord: initialData?.pointsPerWord || 10,
        bonusForNoErrors: initialData?.bonusForNoErrors || 5,
        penaltyPerError: initialData?.penaltyPerError || -2,
        penaltyPerHint: initialData?.penaltyPerHint || -3,
    });

    const updateConfig = (field: string, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const canSubmit = words.length > 0 && words.every(w => w.word.trim() !== "");

    return (
        <Form method="post" className="space-y-6">
            {/* Hidden fields */}
            <input type="hidden" name="words" value={JSON.stringify(words)} />
            <input type="hidden" name="maxAttempts" value={config.maxAttempts} />
            <input type="hidden" name="caseSensitive" value={config.caseSensitive.toString()} />
            <input type="hidden" name="showCategory" value={config.showCategory.toString()} />
            <input type="hidden" name="showWordLength" value={config.showWordLength.toString()} />
            <input type="hidden" name="pointsPerWord" value={config.pointsPerWord} />
            <input type="hidden" name="bonusForNoErrors" value={config.bonusForNoErrors} />
            <input type="hidden" name="penaltyPerError" value={config.penaltyPerError} />
            <input type="hidden" name="penaltyPerHint" value={config.penaltyPerHint} />

            {/* Palabras */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <BookOpen className="h-6 w-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Palabras del Juego</h2>
                </div>
                
                <WordListManager words={words} onChange={setWords} />
            </div>

            {/* Configuración de Juego */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Settings className="h-6 w-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Configuración del Juego</h2>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="maxAttempts"
                            label="Intentos Máximos"
                            type="number"
                            min="1"
                            max="15"
                            value={config.maxAttempts}
                            onChange={(e) => updateConfig("maxAttempts", parseInt(e.target.value) || 6)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Checkbox
                            id="caseSensitive"
                            label="Distinguir mayúsculas y minúsculas"
                            checked={config.caseSensitive}
                            onChange={(checked) => updateConfig("caseSensitive", checked)}
                        />
                        <Checkbox
                            id="showCategory"
                            label="Mostrar categoría de la palabra"
                            checked={config.showCategory}
                            onChange={(checked) => updateConfig("showCategory", checked)}
                        />
                        <Checkbox
                            id="showWordLength"
                            label="Mostrar cantidad de letras"
                            checked={config.showWordLength}
                            onChange={(checked) => updateConfig("showWordLength", checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Puntuación */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Target className="h-6 w-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Sistema de Puntuación</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="pointsPerWord"
                        label="Puntos por palabra correcta"
                        type="number"
                        value={config.pointsPerWord}
                        onChange={(e) => updateConfig("pointsPerWord", parseInt(e.target.value) || 10)}
                    />
                    <Input
                        id="bonusForNoErrors"
                        label="Bonus sin errores"
                        type="number"
                        value={config.bonusForNoErrors}
                        onChange={(e) => updateConfig("bonusForNoErrors", parseInt(e.target.value) || 5)}
                    />
                    <Input
                        id="penaltyPerError"
                        label="Penalización por error"
                        type="number"
                        value={config.penaltyPerError}
                        onChange={(e) => updateConfig("penaltyPerError", parseInt(e.target.value) || -2)}
                    />
                    <Input
                        id="penaltyPerHint"
                        label="Penalización por pista"
                        type="number"
                        value={config.penaltyPerHint}
                        onChange={(e) => updateConfig("penaltyPerHint", parseInt(e.target.value) || -3)}
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
                <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    <Save className="h-5 w-5" />
                    <span>{isSubmitting ? "Guardando..." : isEdit ? "Actualizar" : "Crear Juego"}</span>
                </button>
            </div>
        </Form>
    );
}