// app/api/types/word-search.types.ts

export enum WordDirection {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
    DIAGONAL_DOWN = 'diagonal_down',
    DIAGONAL_UP = 'diagonal_up',
    HORIZONTAL_REVERSE = 'horizontal_reverse',
    VERTICAL_REVERSE = 'vertical_reverse',
    DIAGONAL_DOWN_REVERSE = 'diagonal_down_reverse',
    DIAGONAL_UP_REVERSE = 'diagonal_up_reverse'
}

export interface WordItem {
    word: string;
    clue?: string;
    category?: string;
}

export interface WordSearchGame {
    id: string;
    activityId: string;
    gridWidth: number;
    gridHeight: number;
    seed: string;
    words: WordItem[];
    allowedDirections: WordDirection[];
    fillEmptyCells: boolean;
    caseSensitive: boolean;
    showWordList: boolean;
    showClues: boolean;
    pointsPerWord: number;
    bonusForSpeed: number;
    penaltyPerHint: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWordSearchGameRequest {
    gridWidth: number;
    gridHeight: number;
    words: WordItem[];
    allowedDirections: WordDirection[];
    seed?: string;
    fillEmptyCells?: boolean;
    caseSensitive?: boolean;
    showWordList?: boolean;
    showClues?: boolean;
    pointsPerWord?: number;
    bonusForSpeed?: number;
    penaltyPerHint?: number;
}

export interface UpdateWordSearchGameRequest extends Partial<CreateWordSearchGameRequest> {}

export interface WordSearchPlayableData {
    grid: string[][];
    words: Array<{ word?: string; clue?: string; category?: string }>;
    width: number;
    height: number;
    configuration: {
        showWordList: boolean;
        showClues: boolean;
        caseSensitive: boolean;
    };
}

export interface WordSearchValidationResult {
    score: number;
    percentage: number;
    correct: number;
    incorrect: number;
    missing: number;
    details: Array<{ word: string; isCorrect: boolean }>;
}

export interface WordSearchHint {
    hint: string;
    wordLength: number;
    firstLetter?: string;
}

export interface PlacedWord {
    word: string;
    startRow: number;
    startCol: number;
    direction: WordDirection;
    clue?: string;
    category?: string;
}

export interface GeneratedGrid {
    grid: Array<Array<{
        letter: string;
        row: number;
        col: number;
        isPartOfWord?: boolean;
        wordId?: number;
    }>>;
    placedWords: PlacedWord[];
    width: number;
    height: number;
}