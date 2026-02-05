// app/api/mocks/activities.mock.ts

import type { 
    Activity, 
    ActivityFilters, 
    ActivityListResponse 
} from "~/api/types/activity.types";

const mockActivities: Activity[] = [
    {
        id: "act-1",
        slug: "sopa-letras-anatomia",
        tenantId: "tenant-1",
        courseId: "course-1",
        courseName: "Anatomía Básica",
        type: "word_search",
        status: "published",
        difficulty: "easy",
        isActive: true,
        order: 1,
        maxScore: 100,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T15:30:00Z",
        translations: [
            {
                id: "trans-1",
                activityId: "act-1",
                languageCode: "es",
                title: "Sopa de Letras: Sistema Óseo",
                description: "Encuentra todos los huesos del cuerpo humano escondidos en la sopa de letras",
                instructions: "Busca las palabras en todas las direcciones",
                welcomeMessage: "¡Bienvenido al juego!",
                completionMessage: "¡Felicitaciones!",
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
            }
        ],
        stats: {
            totalAttempts: 45,
            totalCompleted: 38,
            averageScore: 85.5,
            averageTime: 420,
        }
    },
    {
        id: "act-2",
        slug: "ahorcado-terminos-medicos",
        tenantId: "tenant-1",
        courseId: "course-1",
        courseName: "Anatomía Básica",
        type: "hanging",
        status: "published",
        difficulty: "medium",
        isActive: true,
        order: 2,
        maxScore: 100,
        created_at: "2024-01-16T10:00:00Z",
        updated_at: "2024-01-21T15:30:00Z",
        translations: [
            {
                id: "trans-2",
                activityId: "act-2",
                languageCode: "es",
                title: "Ahorcado: Términos Médicos",
                description: "Adivina términos médicos importantes letra por letra",
                instructions: "Selecciona letras para completar la palabra",
                welcomeMessage: "¡Demuestra tu conocimiento!",
                completionMessage: "¡Excelente trabajo!",
                createdAt: "2024-01-16T10:00:00Z",
                updatedAt: "2024-01-16T10:00:00Z",
            }
        ],
        stats: {
            totalAttempts: 32,
            totalCompleted: 28,
            averageScore: 78.3,
            averageTime: 360,
        }
    },
    {
        id: "act-3",
        slug: "completar-frase-circulatorio",
        tenantId: "tenant-1",
        courseId: "course-2",
        courseName: "Fisiología",
        type: "complete_phrase",
        status: "published",
        difficulty: "medium",
        isActive: true,
        order: 1,
        maxScore: 100,
        created_at: "2024-01-17T10:00:00Z",
        updated_at: "2024-01-22T15:30:00Z",
        translations: [
            {
                id: "trans-3",
                activityId: "act-3",
                languageCode: "es",
                title: "Completar: Sistema Circulatorio",
                description: "Completa las frases sobre el sistema circulatorio",
                instructions: "Arrastra las palabras correctas a cada hueco",
                createdAt: "2024-01-17T10:00:00Z",
                updatedAt: "2024-01-17T10:00:00Z",
            }
        ],
        stats: {
            totalAttempts: 27,
            totalCompleted: 23,
            averageScore: 82.1,
            averageTime: 480,
        }
    },
    {
        id: "act-4",
        slug: "crucigrama-nutricion",
        tenantId: "tenant-1",
        courseId: "course-3",
        courseName: "Nutrición",
        type: "crossword",
        status: "draft",
        difficulty: "hard",
        isActive: false,
        order: 1,
        maxScore: 150,
        created_at: "2024-01-18T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z",
        translations: [
            {
                id: "trans-4",
                activityId: "act-4",
                languageCode: "es",
                title: "Crucigrama: Nutrientes Esenciales",
                description: "Resuelve el crucigrama sobre nutrientes",
                createdAt: "2024-01-18T10:00:00Z",
                updatedAt: "2024-01-18T10:00:00Z",
            }
        ],
        stats: {
            totalAttempts: 0,
            totalCompleted: 0,
            averageScore: 0,
            averageTime: 0,
        }
    },
    {
        id: "act-5",
        slug: "memoria-organos",
        tenantId: "tenant-1",
        courseId: "course-1",
        courseName: "Anatomía Básica",
        type: "memory",
        status: "published",
        difficulty: "easy",
        isActive: true,
        order: 3,
        maxScore: 100,
        created_at: "2024-01-19T10:00:00Z",
        updated_at: "2024-01-23T15:30:00Z",
        translations: [
            {
                id: "trans-5",
                activityId: "act-5",
                languageCode: "es",
                title: "Memoria: Órganos del Cuerpo",
                description: "Encuentra las parejas de órganos y sus funciones",
                instructions: "Voltea las cartas para encontrar las parejas",
                createdAt: "2024-01-19T10:00:00Z",
                updatedAt: "2024-01-19T10:00:00Z",
            }
        ],
        stats: {
            totalAttempts: 52,
            totalCompleted: 48,
            averageScore: 91.2,
            averageTime: 300,
        }
    },
    {
        id: "act-6",
        slug: "quiz-primeros-auxilios",
        tenantId: "tenant-1",
        courseId: "course-4",
        courseName: "Primeros Auxilios",
        type: "quiz_game",
        status: "published",
        difficulty: "medium",
        isActive: true,
        order: 1,
        maxScore: 100,
        created_at: "2024-01-20T10:00:00Z",
        updated_at: "2024-01-24T15:30:00Z",
        translations: [
            {
                id: "trans-6",
                activityId: "act-6",
                languageCode: "es",
                title: "Quiz: Primeros Auxilios Básicos",
                description: "Pon a prueba tus conocimientos en primeros auxilios",
                instructions: "Responde todas las preguntas",
                createdAt: "2024-01-20T10:00:00Z",
                updatedAt: "2024-01-20T10:00:00Z",
            }
        ],
        stats: {
            totalAttempts: 64,
            totalCompleted: 59,
            averageScore: 76.8,
            averageTime: 540,
        }
    },
];

export function getActivitiesMock(filters: ActivityFilters): ActivityListResponse {
    let filteredActivities = [...mockActivities];

    // Aplicar filtros
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredActivities = filteredActivities.filter(activity => {
            const translation = activity.translations?.[0];
            return (
                translation?.title?.toLowerCase().includes(searchLower) ||
                translation?.description?.toLowerCase().includes(searchLower) ||
                activity.slug.toLowerCase().includes(searchLower)
            );
        });
    }

    if (filters.type) {
        filteredActivities = filteredActivities.filter(a => a.type === filters.type);
    }

    if (filters.status) {
        filteredActivities = filteredActivities.filter(a => a.status === filters.status);
    }

    if (filters.courseId) {
        filteredActivities = filteredActivities.filter(a => a.courseId === filters.courseId);
    }

    if (filters.actives !== undefined) {
        filteredActivities = filteredActivities.filter(a => a.isActive === filters.actives);
    }

    // Calcular estadísticas
    const byType = filteredActivities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const stats = {
        total: filteredActivities.length,
        totalActive: filteredActivities.filter(a => a.isActive).length,
        totalInactive: filteredActivities.filter(a => !a.isActive).length,
        byType,
    };

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

    return {
        activities: paginatedActivities,
        filters,
        pagination: {
            total: filteredActivities.length,
            page,
            limit,
            totalPages: Math.ceil(filteredActivities.length / limit),
        },
        stats,
    };
}

export function getAvailableCoursesMock() {
    return [
        { id: "course-1", title: "Anatomía Básica", slug: "anatomia-basica" },
        { id: "course-2", title: "Fisiología", slug: "fisiologia" },
        { id: "course-3", title: "Nutrición", slug: "nutricion" },
        { id: "course-4", title: "Primeros Auxilios", slug: "primeros-auxilios" },
        { id: "course-5", title: "Farmacología", slug: "farmacologia" },
    ];
}