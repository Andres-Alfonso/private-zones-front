// app/components/activities/games/complete-phrase/CompletePhraseGame.tsx

import { useState, useEffect } from 'react';
import { 
    Lightbulb, 
    Star, 
    ThumbsUp, 
    ClipboardList, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    RotateCcw,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { CompletePhraseAPI } from '~/api/endpoints/complete-phrase';
import type { 
    CompletePhrasePlayableData, 
    CompletePhraseValidationResult, 
    CompletePhraseHint,
    BlankType 
} from '~/api/types/complete-phrase.types';

interface CompletePhraseGameProps {
    activityId: string;
    fromModule?: boolean;
    onComplete?: (result: CompletePhraseValidationResult) => void;
}

type GameStatus = 'loading' | 'playing' | 'completed' | 'error';

interface Answer {
    blankId: number;
    answer: string;
}

export default function CompletePhraseGame({ activityId, fromModule = false, onComplete }: CompletePhraseGameProps) {
    const [status, setStatus] = useState<GameStatus>('loading');
    const [gameData, setGameData] = useState<CompletePhrasePlayableData | null>(null);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hints, setHints] = useState<Record<number, CompletePhraseHint>>({});
    
    const [result, setResult] = useState<CompletePhraseValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos del juego
    useEffect(() => {
        loadGame();
    }, [activityId, currentPhraseIndex]);

    const loadGame = async () => {
        try {
            setStatus('loading');
            const response = await CompletePhraseAPI.getPlayableData(activityId, currentPhraseIndex);
            
            if (response.success) {
                setGameData(response.data);
                setStatus('playing');
                
                // Inicializar respuestas vacías
                const initialAnswers = response.data.blanks.map(blank => ({
                    blankId: blank.id,
                    answer: '',
                }));
                setAnswers(initialAnswers);
                setHintsUsed(0);
                setHints({});
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el juego');
            setStatus('error');
        }
    };

    const handleAnswerChange = (blankId: number, value: string) => {
        setAnswers(answers.map(answer => 
            answer.blankId === blankId ? { ...answer, answer: value } : answer
        ));
    };

    const handleGetHint = async (blankId: number) => {
        try {
            const response = await CompletePhraseAPI.getHint(activityId, currentPhraseIndex, blankId);
            if (response.success) {
                setHints({ ...hints, [blankId]: response.data });
                setHintsUsed(hintsUsed + 1);
            }
        } catch (err: any) {
            console.error('Error obteniendo pista:', err);
        }
    };

    const handleSubmit = async () => {
        if (!gameData) return;

        try {
            const response = await CompletePhraseAPI.validateAttempt(activityId, {
                phraseIndex: currentPhraseIndex,
                answers,
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

    const handleNextPhrase = () => {
        if (gameData && gameData.hasMutiplePhrases && currentPhraseIndex < gameData.totalPhrases - 1) {
            setCurrentPhraseIndex(currentPhraseIndex + 1);
            setResult(null);
        }
    };

    const handleRetry = () => {
        setCurrentPhraseIndex(0);
        setResult(null);
        loadGame();
    };

    // Función para parsear la frase y reemplazar los marcadores con líneas visuales
    const renderPhraseWithBlanks = (phrase: string) => {
        const parts: (string | number)[] = [];
        let currentText = '';
        let i = 0;

        while (i < phrase.length) {
            if (phrase[i] === '{') {
                // Guardar el texto acumulado
                if (currentText) {
                    parts.push(currentText);
                    currentText = '';
                }

                // Buscar el número dentro de {}
                let j = i + 1;
                let numberStr = '';
                while (j < phrase.length && phrase[j] !== '}') {
                    numberStr += phrase[j];
                    j++;
                }

                const blankNumber = parseInt(numberStr);
                if (!isNaN(blankNumber)) {
                    parts.push(blankNumber);
                }

                i = j + 1; // Saltar el }
            } else {
                currentText += phrase[i];
                i++;
            }
        }

        // Agregar cualquier texto restante
        if (currentText) {
            parts.push(currentText);
        }

        return (
            <div className="flex flex-wrap items-center justify-center gap-2 leading-relaxed">
                {parts.map((part, index) => {
                    if (typeof part === 'string') {
                        return (
                            <span key={index} className="text-lg font-medium text-gray-800">
                                {part}
                            </span>
                        );
                    } else {
                        // Es un número (marcador de blanco)
                        return (
                            <span
                                key={index}
                                className="inline-flex items-center justify-center min-w-[120px] px-4 py-1 border-b-4 border-blue-400 border-dashed"
                            >
                                <span className="text-xs text-blue-600 font-semibold">
                                    {part + 1}
                                </span>
                            </span>
                        );
                    }
                })}
            </div>
        );
    };

    const renderBlank = (blank: any, index: number) => {
        const answer = answers.find(a => a.blankId === blank.id);
        const hint = hints[blank.id];
        const detail = result?.details.find(d => d.blankId === blank.id);

        const blankClass = result 
            ? detail?.isCorrect 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
            : 'border-blue-300 focus:border-blue-500';

        switch (blank.type as BlankType) {
            case 'text':
                return (
                    <div key={blank.id} className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <label className="text-sm font-semibold text-gray-700 bg-blue-100 px-3 py-1 rounded-full">
                                Espacio {index + 1}
                            </label>
                            {!result && (
                                <button
                                    onClick={() => handleGetHint(blank.id)}
                                    className="flex items-center gap-1.5 text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors font-medium"
                                >
                                    <Lightbulb size={14} />
                                    <span>Pista</span>
                                </button>
                            )}
                        </div>
                        
                        {hint && (
                            <div className="text-base text-gray-600 mb-2 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                                {hint.hint && (
                                    <p className="flex items-center gap-1.5">
                                        <Lightbulb size={14} className="text-yellow-600" />
                                        <span>{hint.hint}</span>
                                    </p>
                                )}
                                {hint.firstLetter && <p>Primera letra: <strong>{hint.firstLetter}</strong></p>}
                                {hint.wordLength && <p>Longitud: {hint.wordLength} letras</p>}
                            </div>
                        )}
                        
                        <input
                            type="text"
                            value={answer?.answer || ''}
                            onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                            disabled={status === 'completed'}
                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${blankClass}`}
                            placeholder="Escribe tu respuesta..."
                        />
                        
                        {result && detail && !detail.isCorrect && (
                            <p className="text-xs text-red-600 mt-1">
                                Respuesta correcta: <strong>{detail.correctAnswer}</strong>
                            </p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={blank.id} className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <label className="text-sm font-semibold text-gray-700 bg-blue-100 px-3 py-1 rounded-full">
                                Espacio {index + 1}
                            </label>
                            {!result && (
                                <button
                                    onClick={() => handleGetHint(blank.id)}
                                    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-yellow-100 border-4 border-amber-500 text-yellow-800 rounded-full hover:bg-yellow-200 hover:border-amber-600 transition-all font-medium shadow-sm"
                                >
                                    <Lightbulb size={14} />
                                    <span>Pista</span>
                                </button>
                            )}
                        </div>
                        
                        {hint && hint.hint && (
                            <div className="text-xs text-gray-600 mb-2 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                                <p className="flex items-center gap-1.5">
                                    <Lightbulb size={14} className="text-yellow-600" />
                                    <span>{hint.hint}</span>
                                </p>
                            </div>
                        )}
                        
                        <select
                            value={answer?.answer || ''}
                            onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                            disabled={status === 'completed'}
                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${blankClass}`}
                        >
                            <option value="">Selecciona una opción...</option>
                            {blank.options?.map((option: any, idx: number) => (
                                <option key={idx} value={option.text}>
                                    {option.text}
                                </option>
                            ))}
                        </select>
                        
                        {result && detail && !detail.isCorrect && (
                            <p className="text-xs text-red-600 mt-1">
                                Respuesta correcta: <strong>{detail.correctAnswer}</strong>
                            </p>
                        )}
                    </div>
                );

            case 'drag_drop':
                // Simplificado como SELECT por ahora
                return renderBlank({ ...blank, type: 'select' }, index);

            default:
                return null;
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando juego...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-red-800 mb-4">
                    <AlertTriangle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
                <button
                    onClick={loadGame}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <RotateCcw size={16} />
                    <span>Reintentar</span>
                </button>
            </div>
        );
    }

    if (status === 'completed' && result) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="text-center mb-6">
                    {result.isPerfect ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <Star className="h-16 w-16 text-yellow-500 fill-yellow-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-green-600 mb-2">¡Perfecto!</h2>
                            <p className="text-gray-600">Has completado todas las frases correctamente</p>
                        </>
                    ) : result.percentage >= 70 ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <ThumbsUp className="h-16 w-16 text-blue-600 fill-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-blue-600 mb-2">¡Bien hecho!</h2>
                            <p className="text-gray-600">Has completado la mayoría de las frases</p>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center mb-4">
                                <ClipboardList className="h-16 w-16 text-orange-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-orange-600 mb-2">Puedes mejorar</h2>
                            <p className="text-gray-600">Sigue practicando</p>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Puntaje</p>
                            <p className="text-2xl font-bold text-blue-600">{result.score} pts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Porcentaje</p>
                            <p className="text-2xl font-bold text-purple-600">{result.percentage.toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Correctas</p>
                            <p className="text-2xl font-bold text-green-600">{result.correctBlanks}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Incorrectas</p>
                            <p className="text-2xl font-bold text-red-600">{result.incorrectBlanks}</p>
                        </div>
                    </div>
                </div>

                {/* Mostrar detalles de cada respuesta */}
                <div className="space-y-3 mb-6">
                    {result.details.map((detail, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${
                                detail.isCorrect
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-1">Espacio {index + 1}</p>
                                    <p className="font-medium">
                                        Tu respuesta: <span className={detail.isCorrect ? 'text-green-700' : 'text-red-700'}>
                                            {detail.userAnswer || '(vacío)'}
                                        </span>
                                    </p>
                                    {!detail.isCorrect && (
                                        <p className="text-sm text-gray-700 mt-1">
                                            Correcta: <strong>{detail.correctAnswer}</strong>
                                        </p>
                                    )}
                                </div>
                                {detail.isCorrect ? (
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                ) : (
                                    <XCircle className="h-8 w-8 text-red-600" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                    {gameData && gameData.hasMutiplePhrases && currentPhraseIndex < gameData.totalPhrases - 1 && (
                        <button
                            onClick={handleNextPhrase}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <span>Siguiente Frase</span>
                            <ArrowRight size={18} />
                        </button>
                    )}
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                    >
                        <RotateCcw size={18} />
                        <span>Volver a Intentar</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!gameData) return null;

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Completa la Frase</h3>
                    {gameData.category && (
                        <p className="text-sm text-gray-600 mt-1">Categoría: {gameData.category}</p>
                    )}
                    {/* {gameData.difficulty && (
                        <p className="text-sm text-gray-600 mt-1">Dificultad: {gameData.difficulty}</p>
                    )} */}
                </div>
                <div className="text-right">
                    {gameData.hasMutiplePhrases && (
                        <p className="text-3xl text-gray-500">
                            Frase {currentPhraseIndex + 1} de {gameData.totalPhrases}
                        </p>
                    )}
                    <p className="text-base text-gray-600">Pistas usadas: {hintsUsed}</p>
                </div>
            </div>

            {/* Frase con líneas visuales */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 mb-8 shadow-sm">
                {renderPhraseWithBlanks(gameData.phrase)}
                <p className="text-sm text-gray-600 text-center mt-4">
                    Completa los {gameData.totalBlanks} espacios en blanco
                </p>
            </div>

            {/* Blancos */}
            <div className="mb-6 space-y-4">
                {gameData.blanks.map((blank, index) => renderBlank(blank, index))}
            </div>

            {/* Botón de enviar */}
            <div className="flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={answers.some(a => !a.answer.trim())}
                    className="px-8 py-3 bg-gradient-to-r bg-[#25343F] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Validar Palabra
                </button>
            </div>
        </div>
    );
}