// app/components/activities/games/hanging/HangingGame.tsx

import { Lightbulb } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { HangingAPI } from '~/api/endpoints/hanging';
import type { HangingPlayableData, HangingValidationResult, HangingHint } from '~/api/types/hanging.types';

interface HangingGameProps {
    activityId: string;
    fromModule?: boolean;
    onComplete?: (result: HangingValidationResult) => void;
}

type GameStatus = 'loading' | 'playing' | 'word_completed' | 'completed' | 'error';

// Resultado agregado que se construye al finalizar todas las palabras
interface AggregatedResult {
    totalScore: number;
    totalCorrect: number;
    totalErrors: number;
    totalWords: number;
    wordResults: HangingValidationResult[];
    percentage: number;
}

export default function HangingGame({ activityId, fromModule = false, onComplete }: HangingGameProps) {
    const [status, setStatus] = useState<GameStatus>('loading');
    const [gameData, setGameData] = useState<HangingPlayableData | null>(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [errors, setErrors] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hint, setHint] = useState<HangingHint | null>(null);

    // Acumulador de resultados por palabra
    const [wordResults, setWordResults] = useState<HangingValidationResult[]>([]);
    const [aggregatedResult, setAggregatedResult] = useState<AggregatedResult | null>(null);
    // Resultado de la palabra actual (para mostrar feedback rápido antes de avanzar)
    const [currentWordResult, setCurrentWordResult] = useState<HangingValidationResult | null>(null);

    const [error, setError] = useState<string | null>(null);

    // Ref para evitar doble submit por los useEffect concurrentes
    const isSubmittingRef = useRef(false);

    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

    const normalizeText = (text: string) => {
        const textWithPlaceholder = text.replace(/[ñÑ]/g, '█');
        const normalized = textWithPlaceholder
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
        return normalized.replace(/█/g, 'Ñ');
    };

    const isLetterInWord = (letter: string): boolean => {
        if (!gameData?.word) return false;
        const word = normalizeText(gameData.word);
        return word.includes(normalizeText(letter));
    };

    useEffect(() => {
        loadGame();
    }, [activityId]);

    const loadGame = async (wordIndex = 0) => {
        try {
            setStatus('loading');
            const response = await HangingAPI.getPlayableData(activityId, fromModule, wordIndex);

            if (response.success) {
                setGameData(response.data);
                setStatus('playing');
                setGuessedLetters([]);
                setErrors(0);
                setHintsUsed(0);
                setHint(null);
                setCurrentWordResult(null);
                isSubmittingRef.current = false;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el juego');
            setStatus('error');
        }
    };

    const handleLetterClick = (letter: string) => {
        if (
            guessedLetters.includes(letter) ||
            status !== 'playing' ||
            !gameData?.word ||
            errors >= gameData.maxAttempts
        ) return;

        const newGuessed = [...guessedLetters, letter];
        setGuessedLetters(newGuessed);

        const word = normalizeText(gameData.word);
        if (!word.includes(normalizeText(letter))) {
            setErrors(prev => prev + 1);
        }
    };

    const handleGetHint = async () => {
        try {
            const response = await HangingAPI.getHint(activityId, currentWordIndex);
            if (response.success) {
                setHint(response.data);
                setHintsUsed(prev => prev + 1);
            }
        } catch (err: any) {
            console.error('Error obteniendo pista:', err);
        }
    };

    /**
     * Valida la palabra actual contra la API y acumula el resultado.
     * Si hay más palabras, avanza automáticamente.
     * Si era la última, construye el resultado final y muestra la pantalla de fin.
     */
    const submitCurrentWord = async (currentGuessedLetters: string[]) => {
        if (!gameData || isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        try {
            const response = await HangingAPI.validateAttempt(activityId, {
                wordIndex: currentWordIndex,
                guessedLetters: currentGuessedLetters,
                hintsUsed,
            });

            if (response.success) {
                const wordResult = response.data;
                setCurrentWordResult(wordResult);

                const updatedResults = [...wordResults, wordResult];
                setWordResults(updatedResults);

                const isLastWord =
                    !gameData.hasMultipleWords ||
                    currentWordIndex >= gameData.totalWords - 1;

                if (isLastWord) {
                    // Construir resultado agregado
                    const totalScore = updatedResults.reduce((acc, r) => acc + r.score, 0);
                    const totalCorrect = updatedResults.filter(r => r.isCorrect).length;
                    const totalErrors = updatedResults.reduce((acc, r) => acc + r.errorsCount, 0);
                    // Promedio de los porcentajes individuales que devuelve la API
                    const percentage = updatedResults.reduce((acc, r) => acc + (r.percentage ?? (r.isCorrect ? 100 : 0)), 0) / updatedResults.length;

                    const aggregated: AggregatedResult = {
                        totalScore,
                        totalCorrect,
                        totalErrors,
                        totalWords: updatedResults.length,
                        wordResults: updatedResults,
                        percentage,
                    };

                    setAggregatedResult(aggregated);
                    setStatus('completed');

                    // Notificar al módulo padre con los datos agregados de todas las palabras
                    if (fromModule && onComplete) {
                        onComplete({
                            ...wordResult,
                            score: aggregated.totalScore,
                            percentage: aggregated.percentage,
                        });
                    }
                } else {
                    // Mostrar feedback breve y avanzar a la siguiente palabra
                    setStatus('word_completed');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al validar respuestas');
            isSubmittingRef.current = false;
        }
    };

    const handleNextWord = () => {
        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        loadGame(nextIndex);
    };

    const handleRetry = () => {
        setCurrentWordIndex(0);
        setWordResults([]);
        setAggregatedResult(null);
        setCurrentWordResult(null);
        loadGame(0);
    };

    // Auto-submit cuando el jugador adivina todas las letras
    useEffect(() => {
        if (!gameData?.word || status !== 'playing') return;

        const word = normalizeText(gameData.word);
        const uniqueLetters = new Set(word.split('').filter(l => l.trim() !== ''));

        const allGuessed = Array.from(uniqueLetters).every(letter =>
            guessedLetters.some(gl => normalizeText(gl) === letter)
        );

        if (allGuessed && guessedLetters.length > 0) {
            submitCurrentWord(guessedLetters);
        }
    }, [guessedLetters, gameData]);

    // Auto-submit cuando se agotan los intentos
    useEffect(() => {
        if (!gameData || status !== 'playing') return;

        if (errors >= gameData.maxAttempts) {
            submitCurrentWord(guessedLetters);
        }
    }, [errors, gameData]);

    // ─── Pantalla: Cargando ───────────────────────────────────────────────────
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando juego...</p>
                </div>
            </div>
        );
    }

    // ─── Pantalla: Error ──────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-800 mb-4">⚠️ {error}</p>
                <button
                    onClick={() => loadGame(currentWordIndex)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // ─── Pantalla: Palabra completada → avanzar a la siguiente ───────────────
    if (status === 'word_completed' && currentWordResult && gameData) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="text-center mb-6">
                    {currentWordResult.isCorrect ? (
                        <>
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-green-600 mb-2">¡Correcto!</h2>
                            <p className="text-gray-600">
                                La palabra era: <strong>{currentWordResult.correctWord}</strong>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">😢</div>
                            <h2 className="text-3xl font-bold text-red-600 mb-2">¡Sin intentos!</h2>
                            <p className="text-gray-600">
                                La palabra era: <strong>{currentWordResult.correctWord}</strong>
                            </p>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500">Puntaje</p>
                        <p className="text-xl font-bold text-blue-600">{currentWordResult.score} pts</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Aciertos</p>
                        <p className="text-xl font-bold text-green-600">{currentWordResult.matchedLetters.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Errores</p>
                        <p className="text-xl font-bold text-red-600">{currentWordResult.errorsCount}</p>
                    </div>
                </div>

                {/* Progreso general */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
                    <p className="text-blue-900 font-medium">
                        Palabra {currentWordIndex + 1} de {gameData.totalWords}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        Puntaje acumulado: {wordResults.reduce((acc, r) => acc + r.score, 0)} pts
                    </p>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleNextWord}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Siguiente Palabra →
                    </button>
                </div>
            </div>
        );
    }

    // ─── Pantalla: Resultado final (todas las palabras completadas) ───────────
    if (status === 'completed' && aggregatedResult) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="text-center mb-6">
                    {aggregatedResult.percentage === 100 ? (
                        <>
                            <div className="text-6xl mb-4">🏆</div>
                            <h2 className="text-3xl font-bold text-green-600 mb-2">¡Perfecto!</h2>
                            <p className="text-gray-600">Adivinaste todas las palabras</p>
                        </>
                    ) : aggregatedResult.percentage >= 50 ? (
                        <>
                            <div className="text-6xl mb-4">🎯</div>
                            <h2 className="text-3xl font-bold text-blue-600 mb-2">¡Bien hecho!</h2>
                            <p className="text-gray-600">Adivinaste la mayoría de las palabras</p>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">📚</div>
                            <h2 className="text-3xl font-bold text-orange-600 mb-2">¡Sigue practicando!</h2>
                            <p className="text-gray-600">Puedes mejorar tu puntaje</p>
                        </>
                    )}
                </div>

                {/* Stats generales */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Puntaje total</p>
                            <p className="text-2xl font-bold text-blue-600">{aggregatedResult.totalScore} pts</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Porcentaje</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {aggregatedResult.percentage.toFixed(0)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Palabras correctas</p>
                            <p className="text-2xl font-bold text-green-600">
                                {aggregatedResult.totalCorrect} / {aggregatedResult.totalWords}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Errores totales</p>
                            <p className="text-2xl font-bold text-red-600">{aggregatedResult.totalErrors}</p>
                        </div>
                    </div>
                </div>

                {/* Detalle por palabra */}
                <div className="space-y-2 mb-6">
                    {aggregatedResult.wordResults.map((wr, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                wr.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{wr.isCorrect ? '✓' : '✗'}</span>
                                <div>
                                    <p className="font-medium">{wr.correctWord}</p>
                                    <p className="text-xs opacity-70">
                                        {wr.matchedLetters.length} aciertos · {wr.errorsCount} errores
                                    </p>
                                </div>
                            </div>
                            <span className="font-bold">{wr.score} pts</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-[#25343F] text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        Volver a Intentar
                    </button>
                </div>
            </div>
        );
    }

    if (!gameData) return null;

    // ─── Pantalla: Jugando ────────────────────────────────────────────────────

    const renderHangman = () => {
        const maxAttempts = gameData.maxAttempts;

        return (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">
                    {errors === 0 && '🤔'}
                    {errors === 1 && '😰'}
                    {errors === 2 && '😨'}
                    {errors === 3 && '😱'}
                    {errors >= 4 && '💀'}
                </div>
                <div className="text-sm text-gray-600">
                    Errores: {errors} / {maxAttempts}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            errors >= maxAttempts ? 'bg-red-600' : 'bg-orange-500'
                        }`}
                        style={{ width: `${(errors / maxAttempts) * 100}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    const renderWord = () => {
        if (!gameData?.word) return null;

        const word = gameData.word;

        return (
            <div className="flex flex-wrap justify-center gap-2 my-8">
                {word.split('').map((char, index) => {
                    const normalizedChar = normalizeText(char);
                    const isGuessed = guessedLetters.some(l => normalizeText(l) === normalizedChar);
                    const isHintLetter = hint?.revealedPosition === index;

                    if (char === ' ') return <div key={index} className="w-8" />;

                    return (
                        <div
                            key={index}
                            className={`w-10 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold uppercase shadow-sm transition-colors
                                ${isGuessed || isHintLetter
                                    ? 'bg-green-100 border-green-400 text-green-700'
                                    : 'bg-white border-gray-300 text-transparent'
                                }`}
                        >
                            {isGuessed || isHintLetter ? char : '_'}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Adivina la Palabra</h3>
                    {gameData.category && (
                        <p className="text-sm text-gray-600 mt-1">Categoría: {gameData.category}</p>
                    )}
                    {gameData.hasMultipleWords && (
                        <p className="text-sm text-gray-500 mt-1">
                            Palabra {currentWordIndex + 1} de {gameData.totalWords}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    {gameData.showWordLength && (
                        <p className="text-sm text-gray-600">Letras: {gameData.wordLength}</p>
                    )}
                    <p className="text-sm text-gray-600">Pistas usadas: {hintsUsed}</p>
                    {wordResults.length > 0 && (
                        <p className="text-sm font-medium text-blue-600 mt-1">
                            Acumulado: {wordResults.reduce((acc, r) => acc + r.score, 0)} pts
                        </p>
                    )}
                </div>
            </div>

            {/* Ahorcado visual */}
            {renderHangman()}

            {/* Palabra oculta */}
            {renderWord()}

            {/* Pista */}
            {hint && hint.hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-2">
                        <span className="text-xl">💡</span>
                        <div>
                            <p className="font-medium text-yellow-900">Pista:</p>
                            <p className="text-sm text-yellow-800">{hint.hint}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Teclado */}
            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 text-center">Selecciona las letras:</p>
                <div className="grid grid-cols-7 gap-2">
                    {alphabet.map((letter) => {
                        const isGuessed = guessedLetters.includes(letter);
                        const isGameOver = errors >= gameData.maxAttempts;
                        const isDisabled = isGuessed || isGameOver;

                        return (
                            <button
                                key={letter}
                                onClick={() => handleLetterClick(letter)}
                                disabled={isDisabled}
                                className={`
                                    py-3 px-2 rounded-lg font-semibold text-sm transition-all
                                    ${isDisabled
                                        ? isGameOver
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : isLetterInWord(letter)
                                                ? 'bg-green-500 text-white cursor-not-allowed'
                                                : 'bg-red-500 text-white cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                                    }
                                `}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Letras intentadas */}
            {guessedLetters.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-2">Letras intentadas:</p>
                    <div className="flex flex-wrap gap-2">
                        {guessedLetters.map((letter, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium"
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Acciones */}
            <div className="flex space-x-3 justify-center">
                <button
                    onClick={handleGetHint}
                    disabled={status !== 'playing' || errors >= gameData.maxAttempts}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Lightbulb className="w-5 h-5" />
                    <span>Pista</span>
                </button>

                <button
                    onClick={() => submitCurrentWord(guessedLetters)}
                    disabled={guessedLetters.length === 0 || status !== 'playing'}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Validar Respuesta
                </button>
            </div>
        </div>
    );
}