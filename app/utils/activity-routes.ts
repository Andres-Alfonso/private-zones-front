// app/utils/activity-routes.ts

import type { Activity, GameType } from "~/api/types/activity.types";

/**
 * Mapa de tipos de actividad a sus identificadores de ruta
 */
const activityGameTypeMap: Record<GameType, string> = {
    word_search: 'word-search',
    hanging: 'hanging',
    complete_phrase: 'complete-phrase',
    crossword: 'crossword',
    drag_drop: 'drag-drop',
    matching: 'matching',
    memory: 'memory',
    quiz_game: 'quiz',
    puzzle: 'puzzle',
};

/**
 * Obtiene el identificador de ruta para un tipo de actividad
 */
function getGameTypeSlug(type: GameType): string {
    return activityGameTypeMap[type] || type;
}

/**
 * Obtiene la ruta para crear una nueva actividad de un tipo específico
 * Ejemplo: /activities/create/hanging
 */
export function getActivityCreateRoute(type: GameType, courseId?: string): string {
    const gameTypeSlug = getGameTypeSlug(type);
    const basePath = `/activities/create/${gameTypeSlug}`;
    return courseId ? `${basePath}?course=${courseId}` : basePath;
}

/**
 * Obtiene la ruta para ver una actividad
 * Ejemplo: /activities/123
 */
export function getActivityViewRoute(activityId: string): string {
    return `/activities/${activityId}`;
}

/**
 * Obtiene la ruta para editar los metadatos de una actividad
 * Ejemplo: /activities/123/edit
 */
export function getActivityMetadataEditRoute(activityId: string): string {
    return `/activities/${activityId}/edit`;
}

/**
 * Obtiene la ruta para crear el contenido del juego específico
 * Ejemplo: /activities/123/games/hanging/create
 */
export function getActivityGameCreateRoute(activityId: string, type: GameType): string {
    const gameTypeSlug = getGameTypeSlug(type);
    return `/activities/${activityId}/games/${gameTypeSlug}/create`;
}

/**
 * Obtiene la ruta para editar el contenido del juego específico
 * Ejemplo: /activities/123/games/hanging/edit
 */
export function getActivityGameEditRoute(activityId: string, type: GameType): string {
    const gameTypeSlug = getGameTypeSlug(type);
    return `/activities/${activityId}/games/${gameTypeSlug}/edit`;
}

/**
 * Obtiene la ruta para jugar una actividad
 * Ejemplo: /activities/123/games/hanging/play
 */
export function getActivityPlayRoute(activityId: string, type: GameType): string {
    const gameTypeSlug = getGameTypeSlug(type);
    return `/activities/${activityId}/games/${gameTypeSlug}/play`;
}

/**
 * Helper para determinar si una actividad tiene su juego configurado
 * basándose en si existe gameData en configuration
 */
export function hasGameConfigured(activity: Activity): boolean {
    return !!activity.configuration?.gameData && 
           Object.keys(activity.configuration.gameData).length > 0;
}

/**
 * Obtiene la ruta de edición apropiada:
 * - Si el juego está configurado: ruta de edición del juego
 * - Si no está configurado: ruta de creación del juego
 */
export function getActivityEditRoute(activity: Activity): string {
    if (hasGameConfigured(activity)) {
        return getActivityGameEditRoute(activity.id, activity.type);
    }
    return getActivityGameCreateRoute(activity.id, activity.type);
}