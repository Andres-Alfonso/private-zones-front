// app/routes/assessments/create.tsx

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
} from "@remix-run/react";
import { AlertCircle, ClipboardList } from "lucide-react";
import AssessmentForm from "../../components/assessments/AssessmentForm";
import { createApiClientFromRequest } from "~/api/client";
import { CoursesAPI } from "~/api/endpoints/courses";
import { CourseBasic, CourseFromAPI } from "~/api/types/course.types";

interface LoaderData {
  availableCourses: CourseBasic[];
}

interface ActionData {
  errors?: Array<{ field: string; message: string }>;
  generalError?: string;
  success?: boolean;
  assessmentId?: string;
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

// Función de validación
function validateAssessmentForm(formData: FormData): {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const errors: Array<{ field: string; message: string }> = [];

  // Validar campos requeridos
  const title = formData.get("title") as string;
  if (!title || title.trim() === "") {
    errors.push({ field: "title", message: "El título es requerido" });
  }

  const slug = formData.get("slug") as string;
  if (!slug || slug.trim() === "") {
    errors.push({ field: "slug", message: "El slug es requerido" });
  }

  const courseId = formData.get("courseId") as string;
  if (!courseId || courseId.trim() === "") {
    errors.push({ field: "courseId", message: "Debe seleccionar un curso" });
  }

  const isGradable = formData.get("isGradable") === "true";
  if (isGradable) {
    const maxScore = parseFloat(formData.get("maxScore") as string);
    if (isNaN(maxScore) || maxScore <= 0) {
      errors.push({
        field: "maxScore",
        message: "El puntaje máximo debe ser mayor a 0",
      });
    }

    const passingScore = formData.get("passingScore") as string;
    if (passingScore) {
      const passingScoreNum = parseFloat(passingScore);
      if (
        isNaN(passingScoreNum) ||
        passingScoreNum < 0 ||
        passingScoreNum > maxScore
      ) {
        errors.push({
          field: "passingScore",
          message: "La nota mínima debe estar entre 0 y el puntaje máximo",
        });
      }
    }
  }

  const maxAttempts = parseInt(formData.get("maxAttempts") as string);
  if (isNaN(maxAttempts) || maxAttempts < 1) {
    errors.push({
      field: "maxAttempts",
      message: "Debe permitir al menos 1 intento",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
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

  const validation = validateAssessmentForm(formData);

  if (!validation.isValid) {
    return json<ActionData>(
      {
        errors: validation.errors,
      },
      { status: 400 }
    );
  }

  try {
    const requestApiClient = createApiClientFromRequest(request);

    // Preparar datos del assessment
    const assessmentData = {
      slug: formData.get("slug") as string,
      type: formData.get("type") as string,
      status: formData.get("status") as string,
      isActive: formData.get("isActive") === "true",
      order: parseInt(formData.get("order") as string) || 0,
      courseId: formData.get("courseId") as string,
      // Traducción
      translation: {
        languageCode: "es",
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || "",
        instructions: (formData.get("instructions") as string) || "",
        welcomeMessage: (formData.get("welcomeMessage") as string) || "",
        completionMessage: (formData.get("completionMessage") as string) || "",
      },
      // Configuración
      configuration: {
        isGradable: formData.get("isGradable") === "true",
        gradingMethod: formData.get("gradingMethod") as string,
        passingScore: formData.get("passingScore")
          ? parseFloat(formData.get("passingScore") as string)
          : null,
        maxScore: parseFloat(formData.get("maxScore") as string),
        timeLimit: formData.get("timeLimit")
          ? parseInt(formData.get("timeLimit") as string)
          : null,
        strictTimeLimit: formData.get("strictTimeLimit") === "true",
        maxAttempts: parseInt(formData.get("maxAttempts") as string),
        allowReview: formData.get("allowReview") === "true",
        showCorrectAnswers: formData.get("showCorrectAnswers") === "true",
        showScoreImmediately: formData.get("showScoreImmediately") === "true",
        randomizeOptions: formData.get("randomizeOptions") === "true",
        oneQuestionPerPage: formData.get("oneQuestionPerPage") === "true",
      },
    };

    // Aquí deberías llamar a tu API para crear el assessment
    // const result = await AssessmentAPI.create(assessmentData, requestApiClient);

    // Por ahora simulamos éxito
    console.log("Assessment data to create:", assessmentData);

    // Simular respuesta exitosa
    const mockAssessmentId = "new-assessment-id";

    return redirect(`/assessments/${mockAssessmentId}/questions?created=true`);
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    return json<ActionData>(
      {
        generalError: error.message || "Error interno del servidor",
      },
      { status: 500 }
    );
  }
};

export default function CreateAssessment() {
  const { availableCourses } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSubmitting = navigation.state === "submitting";
  const errors = actionData?.errors || [];

  const handleCancel = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres cancelar? Se perderán todos los cambios."
      )
    ) {
      navigate("/assessments");
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <ClipboardList className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Crear Nueva Evaluación
            </h1>
            <p className="text-gray-600">
              Complete la información para crear una nueva evaluación
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
      <AssessmentForm
        errors={errors}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        submitLabel="Crear Evaluación"
        availableCourses={availableCourses}
      />
    </div>
  );
}
