// app/routes/activities/create.tsx

import {
    json,
    redirect,
    ActionFunction,
    LoaderFunction,
} from "@remix-run/node";
import {
    useActionData,
    useNavigation,
    useNavigate,
    useLoaderData,
    Form,
} from "@remix-run/react";
import { AlertCircle, Gamepad2, Plus, X } from "lucide-react";
import { useState } from "react";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { ActivitiesAPI } from "~/api/endpoints/activities";
import { CourseBasic, CourseFromAPI } from "~/api/types/course.types";

interface LoaderData {
    availableCourses: CourseBasic[];
}

interface ActionData {
    errors?: Array<{ field: string; message: string }>;
    generalError?: string;
    success?: boolean;
    activityId?: string;
}

interface WordItem {
    word: string;
    clue: string;
    category: string;
}

function processCourseTranslations(
    courses: CourseFromAPI[],
    preferredLanguage: string = "es"
): CourseBasic[] {
    return courses.map((course) => {
        let selectedTranslation = course.translations.find(
            (t) => t.languageCode === preferredLanguage
        );

        if (!selectedTranslation && course.translations.length > 0) {
            selectedTranslation = course.translations[0];
        }

        if (!selectedTranslation) {
            selectedTranslation = {
                id: "",
                courseId: course.id,
                languageCode: preferredLanguage,
                title: "Sin título",
                description: "Sin descripción",
                metadata: {},
                createdAt: course.created_at,
                updatedAt: course.updated_at,
            };
        }

        return {
            id: course.id,
            slug: course.slug,
            title: selectedTranslation.title,
            description: selectedTranslation.description,
            isActive: course.isActive,
            tenantId: course.tenantId,
            created_at: course.created_at,
            updated_at: course.updated_at,
            languageCode: selectedTranslation.languageCode,
            allTranslations: course.translations,
        };
    });
}

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const urlParams = new URLSearchParams(url.search);
        const preferredLanguage = urlParams.get("lang") || "es";

        const requestApiClient = createApiClientFromRequest(request);
        const coursesResult = await CoursesAPI.getByTenant(requestApiClient);

        if ("error" in coursesResult) {
            console.error("Courses API Error:", coursesResult.error);
            return json<LoaderData>(
                {
                    availableCourses: [],
                },
                { status: 500 }
            );
        }

        const processedCourses = processCourseTranslations(
            coursesResult as CourseFromAPI[],
            preferredLanguage
        );

        return json<LoaderData>({
            availableCourses: processedCourses || [],
        });
    } catch (error: any) {
        console.error("Unexpected error loading courses:", error);
        return json<LoaderData>(
            {
                availableCourses: [],
            },
            { status: 500 }
        );
    }
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    try {
        const requestApiClient = createApiClientFromRequest(request);

        // Obtener palabras del formData
        const wordsJson = formData.get("words") as string;
        const words = wordsJson ? JSON.parse(wordsJson) : [];

        if (words.length === 0) {
            return json<ActionData>(
                {
                    generalError: "Debe agregar al menos una palabra",
                },
                { status: 400 }
            );
        }

        // Preparar datos de la actividad
        const activityData = {
            courseId: formData.get("courseId") as string,
            type: "word_search",
            status: formData.get("status") as string || "draft",
            difficulty: formData.get("difficulty") as string || "medium",
            isActive: formData.get("isActive") === "true",
            order: parseInt(formData.get("order") as string) || 0,
            maxScore: parseInt(formData.get("maxScore") as string) || (words.length * 10),
            translations: [
                {
                    languageCode: "es",
                    title: formData.get("title") as string,
                    description: (formData.get("description") as string) || "",
                    instructions: (formData.get("instructions") as string) || "",
                    welcomeMessage: (formData.get("welcomeMessage") as string) || "",
                    completionMessage: (formData.get("completionMessage") as string) || "",
                }
            ],
            configuration: {
                timeLimit: formData.get("timeLimit") ? parseInt(formData.get("timeLimit") as string) : null,
                strictTimeLimit: formData.get("strictTimeLimit") === "true",
                maxAttempts: parseInt(formData.get("maxAttempts") as string) || 0,
                showTimer: formData.get("showTimer") === "true",
                showScore: formData.get("showScore") === "true",
                showHints: formData.get("showHints") === "true",
                maxHints: parseInt(formData.get("maxHints") as string) || 3,
                isGradable: formData.get("isGradable") === "true",
                passingScore: formData.get("passingScore") ? parseFloat(formData.get("passingScore") as string) : null,
                showScoreImmediately: formData.get("showScoreImmediately") === "true",
                showFeedbackAfterCompletion: formData.get("showFeedbackAfterCompletion") === "true",
            },
        };

        // Crear la actividad primero
        const activityResult = await ActivitiesAPI.create(activityData, requestApiClient);

        // Ahora crear el juego de word-search
        const wordSearchData = {
            gridWidth: parseInt(formData.get("gridWidth") as string) || 15,
            gridHeight: parseInt(formData.get("gridHeight") as string) || 15,
            words: words,
            allowedDirections: ["horizontal", "vertical", "diagonal_down"],
            fillEmptyCells: true,
            caseSensitive: false,
            showWordList: formData.get("showWordList") === "true",
            showClues: formData.get("showClues") === "true",
            pointsPerWord: parseInt(formData.get("pointsPerWord") as string) || 10,
        };

        // Importar el API de word-search
        const { WordSearchAPI } = await import("~/api/endpoints/word-search");
        await WordSearchAPI.create(activityResult.data.id, wordSearchData, requestApiClient);

        return redirect(`/activities/${activityResult.data.id}?created=true`);
    } catch (error: any) {
        console.error("Error creating activity:", error);
        return json<ActionData>(
            {
                generalError: error.message || "Error interno del servidor",
            },
            { status: 500 }
        );
    }
};

export default function CreateActivity() {
    const { availableCourses } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const navigate = useNavigate();

    const [words, setWords] = useState<WordItem[]>([]);
    const [currentWord, setCurrentWord] = useState<WordItem>({
        word: "",
        clue: "",
        category: "",
    });

    const isSubmitting = navigation.state === "submitting";

    const handleAddWord = () => {
        if (currentWord.word.trim() === "") {
            alert("La palabra no puede estar vacía");
            return;
        }

        setWords([...words, currentWord]);
        setCurrentWord({ word: "", clue: "", category: "" });
    };

    const handleRemoveWord = (index: number) => {
        setWords(words.filter((_, i) => i !== index));
    };

    const handleCancel = () => {
        if (
            confirm(
                "¿Estás seguro de que quieres cancelar? Se perderán todos los cambios."
            )
        ) {
            navigate("/activities");
        }
    };

    return (
        <div className="container mx-auto px-4">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
                <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
                        <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Crear Sopa de Letras
                        </h1>
                        <p className="text-gray-600">
                            Crea una nueva actividad de sopa de letras para tu curso
                        </p>
                    </div>
                </div>
            </div>

            {/* Error general */}
            {actionData?.generalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                        <p className="text-red-800">{actionData.generalError}</p>
                    </div>
                </div>
            )}

            {/* Formulario */}
            <Form method="post" className="space-y-6">
                {/* Información básica */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Información Básica
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título *
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: Sopa de Letras - Vocabulario Médico"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Curso *
                            </label>
                            <select
                                name="courseId"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Selecciona un curso</option>
                                {availableCourses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Describe brevemente la actividad..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Instrucciones
                            </label>
                            <textarea
                                name="instructions"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Instrucciones para completar la actividad..."
                            />
                        </div>
                    </div>
                </div>

                {/* Palabras */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Palabras a Buscar
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Palabra *
                                </label>
                                <input
                                    type="text"
                                    value={currentWord.word}
                                    onChange={(e) =>
                                        setCurrentWord({ ...currentWord, word: e.target.value.toUpperCase() })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="PALABRA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pista (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={currentWord.clue}
                                    onChange={(e) =>
                                        setCurrentWord({ ...currentWord, clue: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Pista o definición"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={currentWord.category}
                                    onChange={(e) =>
                                        setCurrentWord({ ...currentWord, category: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Categoría"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddWord}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Agregar Palabra</span>
                        </button>

                        {/* Lista de palabras agregadas */}
                        {words.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Palabras agregadas ({words.length})
                                </h3>
                                <div className="space-y-2">
                                    {words.map((word, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <span className="font-semibold text-gray-900">
                                                    {word.word}
                                                </span>
                                                {word.clue && (
                                                    <span className="text-gray-600 ml-3">
                                                        - {word.clue}
                                                    </span>
                                                )}
                                                {word.category && (
                                                    <span className="text-purple-600 ml-2 text-sm">
                                                        ({word.category})
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveWord(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Campo oculto para enviar las palabras */}
                    <input type="hidden" name="words" value={JSON.stringify(words)} />
                </div>

                {/* Configuración */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Configuración
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dificultad
                            </label>
                            <select
                                name="difficulty"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="easy">Fácil</option>
                                <option value="medium">Medio</option>
                                <option value="hard">Difícil</option>
                                <option value="expert">Experto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Límite de tiempo (minutos)
                            </label>
                            <input
                                type="number"
                                name="timeLimit"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="0 = Sin límite"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ancho de la cuadrícula
                            </label>
                            <input
                                type="number"
                                name="gridWidth"
                                min="10"
                                max="30"
                                defaultValue="15"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alto de la cuadrícula
                            </label>
                            <input
                                type="number"
                                name="gridHeight"
                                min="10"
                                max="30"
                                defaultValue="15"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="showWordList"
                                id="showWordList"
                                defaultChecked
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showWordList" className="ml-2 text-sm text-gray-700">
                                Mostrar lista de palabras
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="showClues"
                                id="showClues"
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showClues" className="ml-2 text-sm text-gray-700">
                                Mostrar pistas en lugar de palabras
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="showHints"
                                id="showHints"
                                defaultChecked
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showHints" className="ml-2 text-sm text-gray-700">
                                Permitir pistas
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isGradable"
                                id="isGradable"
                                defaultChecked
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isGradable" className="ml-2 text-sm text-gray-700">
                                Actividad calificable
                            </label>
                        </div>
                    </div>

                    {/* Campos ocultos */}
                    <input type="hidden" name="status" value="draft" />
                    <input type="hidden" name="isActive" value="true" />
                    <input type="hidden" name="maxAttempts" value="0" />
                    <input type="hidden" name="showTimer" value="true" />
                    <input type="hidden" name="showScore" value="true" />
                    <input type="hidden" name="maxHints" value="3" />
                    <input type="hidden" name="showScoreImmediately" value="true" />
                    <input type="hidden" name="showFeedbackAfterCompletion" value="true" />
                    <input type="hidden" name="pointsPerWord" value="10" />
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || words.length === 0}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creando..." : "Crear Sopa de Letras"}
                    </button>
                </div>
            </Form>
        </div>
    );
}