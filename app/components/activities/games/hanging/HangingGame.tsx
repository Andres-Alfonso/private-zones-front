// app/components/activities/games/hanging/HangingGame.tsx

import { Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HangingAPI } from '~/api/endpoints/hanging';
import type { HangingPlayableData, HangingValidationResult, HangingHint } from '~/api/types/hanging.types';

interface HangingGameProps {
    activityId: string;
    fromModule?: boolean;
    onComplete?: (result: HangingValidationResult) => void;
}

type GameStatus = 'loading' | 'playing' | 'completed' | 'error';

export default function HangingGame({ activityId, fromModule = false, onComplete }: HangingGameProps) {
    const [status, setStatus] = useState<GameStatus>('loading');
    const [gameData, setGameData] = useState<HangingPlayableData | null>(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [errors, setErrors] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hint, setHint] = useState<HangingHint | null>(null);
    
    const [result, setResult] = useState<HangingValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

    const normalizeText = (text: string) => {
        // Preservar la Ñ antes de normalizar
        const textWithPlaceholder = text.replace(/[ñÑ]/g, '█');
        
        // Normalizar (eliminar acentos de vocales)
        const normalized = textWithPlaceholder
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
        
        // Restaurar la Ñ
        return normalized.replace(/█/g, 'Ñ');
    };

    // Función helper para verificar si una letra está en la palabra
    const isLetterInWord = (letter: string): boolean => {
        if (!gameData?.word) return false;
        const word = normalizeText(gameData.word);
        return word.includes(normalizeText(letter));
    };

    // Cargar datos del juego
    useEffect(() => {
        loadGame();
    }, [activityId]);

    const loadGame = async () => {
        try {
            setStatus('loading');
            const response = await HangingAPI.getPlayableData(activityId, currentWordIndex);
            
            if (response.success) {
                setGameData(response.data);
                setStatus('playing');
                setGuessedLetters([]);
                setErrors(0);
                setHintsUsed(0);
                setHint(null);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el juego');
            setStatus('error');
        }
    };

    const handleLetterClick = (letter: string) => {
        // Bloquear si ya adivinó la letra, no está jugando, o alcanzó el límite de errores
        if (guessedLetters.includes(letter) || 
            status !== 'playing' || 
            !gameData?.word ||
            errors >= gameData.maxAttempts) {
            return;
        }
        
        const newGuessed = [...guessedLetters, letter];
        setGuessedLetters(newGuessed);

        // Validar si la letra está en la palabra
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
                setHintsUsed(hintsUsed + 1);
            }
        } catch (err: any) {
            console.error('Error obteniendo pista:', err);
        }
    };

    const handleSubmit = async () => {
        if (!gameData) return;

        try {
            const response = await HangingAPI.validateAttempt(activityId, {
                wordIndex: currentWordIndex,
                guessedLetters,
                hintsUsed,
            });

            if (response.success) {
                setResult(response.data);
                setStatus('completed');

                // Solo ejecutar guardado si viene desde módulo
                if (fromModule && onComplete) {
                    onComplete(response.data);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al validar respuestas');
        }
    };

    const handleNextWord = () => {
        if (gameData && gameData.hasMultipleWords && currentWordIndex < gameData.totalWords - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
            setStatus('loading');
            loadGame();
        }
    };

    const handleRetry = () => {
        setCurrentWordIndex(0);
        setResult(null);
        setStatus('loading');
        loadGame();
    };

    // Verificar si ganó automáticamente
    useEffect(() => {
        if (!gameData?.word || status !== 'playing') return;
        
        const word = normalizeText(gameData.word);
        const uniqueLetters = new Set(word.split('').filter(l => l.trim() !== ''));
        
        // Verificar si todas las letras únicas fueron adivinadas
        const allGuessed = Array.from(uniqueLetters).every(letter => 
            guessedLetters.some(gl => normalizeText(gl) === letter)
        );
        
        // Si adivinó todas las letras, validar automáticamente
        if (allGuessed) {
            handleSubmit();
        }
    }, [guessedLetters, gameData]);

    useEffect(() => {
        if (!gameData || status !== 'playing') return;
        
        // Si alcanzó el máximo de errores, terminar el juego
        if (errors >= gameData.maxAttempts) {
            handleSubmit();
        }
    }, [errors, gameData]);

    // Calcular errores actuales
    useEffect(() => {
        if (!result) return;
        setErrors(result.errorsCount);
    }, [result]);

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

    if (status === 'error') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-800 mb-4">⚠️ {error}</p>
                <button
                    onClick={loadGame}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (status === 'completed' && result) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="text-center mb-6">
                    {result.isCorrect ? (
                        <>
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-green-600 mb-2">¡Felicitaciones!</h2>
                            <p className="text-gray-600">Has completado la palabra correctamente</p>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">😢</div>
                            <h2 className="text-3xl font-bold text-red-600 mb-2">Game Over</h2>
                            <p className="text-gray-600">Has agotado tus intentos</p>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Palabra correcta</p>
                            <p className="text-2xl font-bold text-gray-900">{result.correctWord}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Puntaje</p>
                            <p className="text-2xl font-bold text-blue-600">{result.score} pts</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                            <span>✓</span>
                            <span>Aciertos: {result.matchedLetters.length}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-red-600">
                            <span>✗</span>
                            <span>Errores: {result.errorsCount}</span>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3 justify-center">
                    {gameData && gameData.hasMultipleWords && currentWordIndex < gameData.totalWords - 1 && (
                        <button
                            onClick={handleNextWord}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Siguiente Palabra →
                        </button>
                    )}
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                    >
                        Volver a Intentar
                    </button>
                </div>
            </div>
        );
    }

    if (!gameData) return null;

    // Renderizar el muñeco del ahorcado basado en errores
    const renderHangman = () => {
        const maxAttempts = gameData.maxAttempts;
        const parts = ['cabeza', 'cuerpo', 'brazo izq', 'brazo der', 'pierna izq', 'pierna der'];
        
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

    // Mostrar la palabra con letras adivinadas
    const renderWord = () => {
        if (!gameData?.word) return null;
        
        const word = gameData.word;
        const letters = word.split('');
        
        return (
            <div className="flex flex-wrap justify-center gap-2 my-8">
                {letters.map((char, index) => {
                    const normalizedChar = normalizeText(char);
                    const isGuessed = guessedLetters.some(l => normalizeText(l) === normalizedChar);
                    const isHint = hint?.revealedPosition === index;

                    // Si es un espacio, no mostrar raya
                    if (char === ' ') return <div key={index} className="w-8" />;

                    return (
                        <div
                            key={index}
                            className={`w-10 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold uppercase shadow-sm transition-colors
                                ${isGuessed || isHint 
                                    ? 'bg-green-100 border-green-400 text-green-700' 
                                    : 'bg-white border-gray-300 text-transparent'
                                }`}
                        >
                            {isGuessed || isHint ? char : '_'}
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
                                disabled={isGuessed}
                                className={`
                                    py-3 px-2 rounded-lg font-semibold text-sm transition-all
                                    ${isDisabled
                                        ? isGameOver 
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' // Juego terminado
                                            : isLetterInWord(letter)
                                                ? 'bg-green-500 text-white cursor-not-allowed' // Correcta
                                                : 'bg-red-500 text-white cursor-not-allowed'   // Incorrecta
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

            {/* Letras adivinadas */}
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
                    onClick={handleSubmit}
                    disabled={guessedLetters.length === 0 || status !== 'playing'}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Validar Respuesta
                </button>
            </div>
        </div>
    );
}