// app/api/types/complete-phrase.types.ts

export enum BlankType {
    TEXT = 'text',
    SELECT = 'select',
    DRAG_DROP = 'drag_drop'
}

export interface BlankOption {
    text: string;
    isCorrect: boolean;
}

export interface PhraseBlank {
    id: number;
    type: BlankType;
    correctAnswer: string;
    options?: BlankOption[];
    caseSensitive?: boolean;
    acceptSynonyms?: boolean;
    synonyms?: string[];
}

export interface CompletePhraseItem {
    phrase: string;
    blanks: PhraseBlank[];
    category?: string;
    difficulty?: string;
    hint?: string;
}

export interface CompletePhraseGame {
    id: string;
    activityId: string;
    phrases: CompletePhraseItem[];
    caseSensitive: boolean;
    showHints: boolean;
    shuffleOptions: boolean;
    allowPartialCredit: boolean;
    pointsPerBlank: number;
    bonusForPerfect: number;
    penaltyPerError: number;
    penaltyPerHint: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCompletePhraseRequest {
    phrases: CompletePhraseItem[];
    caseSensitive?: boolean;
    showHints?: boolean;
    shuffleOptions?: boolean;
    allowPartialCredit?: boolean;
    pointsPerBlank?: number;
    bonusForPerfect?: number;
    penaltyPerError?: number;
    penaltyPerHint?: number;
}

export interface UpdateCompletePhraseRequest extends Partial<CreateCompletePhraseRequest> {}

export interface CompletePhrasePlayableData {
    phrase: string;
    blanks: Array<{
        id: number;
        type: BlankType;
        options?: Array<{ text: string }>;
    }>;
    category?: string;
    difficulty?: string;
    totalBlanks: number;
    shuffleOptions: boolean;
    hasMutiplePhrases: boolean;
    totalPhrases: number;
}

export interface CompletePhraseValidationResult {
    score: number;
    percentage: number;
    correctBlanks: number;
    incorrectBlanks: number;
    totalBlanks: number;
    isPerfect: boolean;
    details: Array<{
        blankId: number;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
    }>;
}

export interface CompletePhraseHint {
    hint?: string;
    firstLetter?: string;
    wordLength?: number;
}