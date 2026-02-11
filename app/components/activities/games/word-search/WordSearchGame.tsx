// app/components/activities/games/word-search/WordSearchGame.tsx

import { useState, useEffect } from 'react';
import { WordSearchAPI } from '~/api/endpoints/word-search';
import type { 
    WordSearchPlayableData, 
    WordSearchValidationResult, 
    WordSearchHint 
} from '~/api/types/word-search.types';

interface WordSearchGameProps {
    activityId: string;
    fromModule?: boolean;
    onComplete?: (result: WordSearchValidationResult) => void;
}

type GameStatus = 'loading' | 'playing' | 'completed' | 'error';

interface CellPosition {
    row: number;
    col: number;
}

interface FoundWord {
    word: string;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}

export default function WordSearchGame({ activityId, fromModule = false, onComplete }: WordSearchGameProps) {
    const [status, setStatus] = useState<GameStatus>('loading');
    const [gameData, setGameData] = useState<WordSearchPlayableData | null>(null);
    
    const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);
    const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [hints, setHints] = useState<Record<number, WordSearchHint>>({});
    
    const [result, setResult] = useState<WordSearchValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos del juego
    useEffect(() => {
        loadGame();
    }, [activityId]);

    const loadGame = async () => {
        try {
            setStatus('loading');
            const response = await WordSearchAPI.getPlayableGrid(activityId);
            
            if (response.success) {
                setGameData(response.data);
                setStatus('playing');
                setSelectedCells([]);
                setFoundWords([]);
                setHints({});
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el juego');
            setStatus('error');
        }
    };

    const handleGetHint = async (wordIndex: number) => {
        try {
            const response = await WordSearchAPI.getHint(activityId, wordIndex);
            if (response.success) {
                setHints({ ...hints, [wordIndex]: response.data });
            }
        } catch (err: any) {
            console.error('Error obteniendo pista:', err);
        }
    };

    const handleMouseDown = (row: number, col: number) => {
        setIsSelecting(true);
        setSelectedCells([{ row, col }]);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (!isSelecting) return;
        
        // IMPORTANTE: Validar siempre contra el origen (la primera celda pulsada)
        const startCell = selectedCells[0];
        if (!startCell) return;

        if (isValidSelection(startCell, { row, col })) {
            const newSelection = getSelectionPath(startCell, { row, col });
            setSelectedCells(newSelection);
        }
    };

    const handleMouseUp = () => {
        if (selectedCells.length > 1 && gameData) {
            const word = getWordFromSelection();
            const reversedWord = word.split('').reverse().join('');
            
            // Buscamos si la palabra seleccionada (o su reversa) existe
            const wordExists = gameData.words.find(w => {
                if (!w.word) return false; // Evitamos el undefined
                return gameData.configuration.caseSensitive 
                    ? (w.word === word || w.word === reversedWord)
                    : (w.word.toLowerCase() === word.toLowerCase() || w.word.toLowerCase() === reversedWord.toLowerCase());
            });

            // Verificamos que wordExists y wordExists.word no sean nulos/undefined
            if (wordExists && wordExists.word && word.length >= 2) {
                const start = selectedCells[0];
                const end = selectedCells[selectedCells.length - 1];
                
                const alreadyFound = foundWords.some(fw => 
                    fw.startRow === start.row && 
                    fw.startCol === start.col &&
                    fw.endRow === end.row && 
                    fw.endCol === end.col
                );

                if (!alreadyFound) {
                    // Usamos wordExists.word! (non-null assertion) o simplemente el string validado
                    setFoundWords([...foundWords, {
                        word: wordExists.word, 
                        startRow: start.row,
                        startCol: start.col,
                        endRow: end.row,
                        endCol: end.col,
                    }]);
                }
            }
        }
        
        setIsSelecting(false);
        setSelectedCells([]);
    };

    const isValidSelection = (start: CellPosition, end: CellPosition): boolean => {
        const rowDiff = Math.abs(end.row - start.row);
        const colDiff = Math.abs(end.col - start.col);

        // Horizontal, vertical o diagonal
        return rowDiff === 0 || colDiff === 0 || rowDiff === colDiff;
    };

    const getSelectionPath = (start: CellPosition, end: CellPosition): CellPosition[] => {
        const path: CellPosition[] = [];
        
        const rowDiff = end.row - start.row;
        const colDiff = end.col - start.col;
        
        // Calculamos cuántos pasos hay que dar (la distancia máxima en cualquier eje)
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        
        // Determinamos la dirección (-1, 0, o 1)
        const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
        const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
        
        for (let i = 0; i <= steps; i++) {
            path.push({
                row: start.row + (i * rowStep),
                col: start.col + (i * colStep)
            });
        }
        
        return path;
    };

    const getWordFromSelection = (): string => {
        if (!gameData) return '';
        
        return selectedCells
            .map(cell => gameData.grid[cell.row][cell.col])
            .join('');
    };

    const isCellSelected = (row: number, col: number): boolean => {
        return selectedCells.some(cell => cell.row === row && cell.col === col);
    };

    const isCellFound = (row: number, col: number): boolean => {
        return foundWords.some(word => {
            const path = getSelectionPath(
                { row: word.startRow, col: word.startCol },
                { row: word.endRow, col: word.endCol }
            );
            return path.some(cell => cell.row === row && cell.col === col);
        });
    };

    const handleSubmit = async () => {
        if (!gameData) return;

        try {
            const response = await WordSearchAPI.validateAttempt(activityId, {
                foundWords,
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

    const handleRetry = () => {
        setResult(null);
        setFoundWords([]);
        setSelectedCells([]);
        setHints({});
        setStatus('playing');
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generando sopa de letras...</p>
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
                    {result.percentage === 100 ? (
                        <>
                            <div className="text-6xl mb-4">🏆</div>
                            <h2 className="text-3xl font-bold text-green-600 mb-2">¡Perfecto!</h2>
                            <p className="text-gray-600">Has encontrado todas las palabras</p>
                        </>
                    ) : result.percentage >= 70 ? (
                        <>
                            <div className="text-6xl mb-4">🎯</div>
                            <h2 className="text-3xl font-bold text-blue-600 mb-2">¡Excelente!</h2>
                            <p className="text-gray-600">Has encontrado la mayoría de las palabras</p>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="text-3xl font-bold text-orange-600 mb-2">Sigue buscando</h2>
                            <p className="text-gray-600">Puedes mejorar</p>
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
                            <p className="text-sm text-gray-600 mb-1">Encontradas</p>
                            <p className="text-2xl font-bold text-green-600">{result.correct}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Faltantes</p>
                            <p className="text-2xl font-bold text-orange-600">{result.missing}</p>
                        </div>
                    </div>
                </div>

                {/* Detalles */}
                <div className="space-y-2 mb-6">
                    {result.details.map((detail, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                detail.isCorrect
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-gray-50 text-gray-700'
                            }`}
                        >
                            <span className="font-medium">{detail.word}</span>
                            <span className="text-xl">{detail.isCorrect ? '✓' : '○'}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        Volver a Intentar
                    </button>
                </div>
            </div>
        );
    }

    if (!gameData) return null;

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sopa de Letras</h3>
                <p className="text-gray-600">
                    Encuentra las palabras ocultas en el grid. Arrastra el mouse para seleccionar.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Grid */}
                <div className="lg:col-span-2">
                    <div 
                        className="inline-block bg-gray-50 rounded-xl p-4"
                        onMouseLeave={() => {
                            setIsSelecting(false);
                            setSelectedCells([]);
                        }}
                    >
                        <div className="grid gap-1" style={{ 
                            gridTemplateColumns: `repeat(${gameData.width}, minmax(0, 1fr))` 
                        }}>
                            {gameData.grid.map((row, rowIndex) => (
                                row.map((letter, colIndex) => {
                                    const isSelected = isCellSelected(rowIndex, colIndex);
                                    const isFound = isCellFound(rowIndex, colIndex);
                                    
                                    return (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            className={`
                                                w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center 
                                                font-bold text-sm sm:text-base cursor-pointer rounded
                                                transition-all select-none
                                                ${isFound 
                                                    ? 'bg-green-200 text-green-800' 
                                                    : isSelected 
                                                        ? 'bg-blue-300 text-blue-900 scale-110' 
                                                        : 'bg-white hover:bg-gray-100'
                                                }
                                            `}
                                            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                            onMouseUp={handleMouseUp}
                                        >
                                            {letter}
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lista de palabras */}
                <div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-bold text-gray-900 mb-3">
                            {gameData.configuration.showWordList ? 'Palabras a buscar' : 'Pistas'}
                        </h4>
                        
                        <div className="space-y-2">
                            {gameData.words.map((wordItem, index) => {
                                // Comprobamos si esta palabra específica ya está en nuestro array de encontradas
                                const isWordFound = foundWords.some(fw => 
                                    gameData.configuration.caseSensitive 
                                        ? fw.word === wordItem.word
                                        : fw.word.toLowerCase() === wordItem.word?.toLowerCase()
                                );
                                
                                const hint = hints[index];

                                return (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                                            isWordFound
                                                ? 'bg-green-100 border-green-500 opacity-80' // Color más fuerte al encontrarla
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium transition-all ${
                                                isWordFound ? 'text-green-700 line-through decoration-2' : 'text-gray-900'
                                            }`}>
                                                {gameData.configuration.showWordList && wordItem.word}
                                                {gameData.configuration.showClues && wordItem.clue}
                                                {!gameData.configuration.showWordList && !gameData.configuration.showClues && `Palabra ${index + 1}`}
                                            </span>
                                            
                                            {isWordFound ? (
                                                <span className="text-green-600 font-bold">✓</span> // Icono de éxito
                                            ) : (
                                                <button
                                                    onClick={() => handleGetHint(index)}
                                                    className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                >
                                                    💡
                                                </button>
                                            )}
                                        </div>
                                        
                                        {wordItem.category && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {wordItem.category}
                                            </p>
                                        )}
                                        
                                        {hint && !isWordFound && (
                                            <div className="text-xs text-gray-600 mt-2 bg-yellow-50 p-2 rounded">
                                                <p>{hint.hint}</p>
                                                {hint.firstLetter && (
                                                    <p>Primera letra: <strong>{hint.firstLetter}</strong></p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contador */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-4">
                        <p className="text-center text-blue-900 font-medium">
                            Encontradas: {foundWords.length} / {gameData.words.length}
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ 
                                    width: `${(foundWords.length / gameData.words.length) * 100}%` 
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Botón de enviar */}
                    <button
                        onClick={handleSubmit}
                        disabled={foundWords.length === 0}
                        className="w-full mt-4 px-6 py-3 bg-[#25343F] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Validar ({foundWords.length} palabras)
                    </button>
                </div>
            </div>
        </div>
    );
}