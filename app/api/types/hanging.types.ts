// app/api/types/hanging.types.ts

export interface HangingWord {
    word: string;
    category?: string;
    clue?: string;
}

export interface HangingGame {
    id: string;
    activityId: string;
    words: HangingWord[];
    maxAttempts: number;
    caseSensitive: boolean;
    showCategory: boolean;
    showWordLength: boolean;
    pointsPerWord: number;
    bonusForNoErrors: number;
    penaltyPerError: number;
    penaltyPerHint: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHangingGameRequest {
    words: HangingWord[];
    maxAttempts?: number;
    caseSensitive?: boolean;
    showCategory?: boolean;
    showWordLength?: boolean;
    pointsPerWord?: number;
    bonusForNoErrors?: number;
    penaltyPerError?: number;
    penaltyPerHint?: number;
}

export interface UpdateHangingGameRequest extends Partial<CreateHangingGameRequest> {}

export interface HangingPlayableData {
    word: string;
    wordLength: number;
    category?: string;
    maxAttempts: number;
    showWordLength: boolean;
    hasMultipleWords: boolean;
    totalWords: number;
}

export interface HangingValidationResult {
    isCorrect: boolean;
    correctWord: string;
    score: number;
    errorsCount: number;
    matchedLetters: string[];
    missedLetters: string[];
}

export interface HangingHint {
    hint?: string;
    revealedLetter?: string;
    revealedPosition?: number;
}