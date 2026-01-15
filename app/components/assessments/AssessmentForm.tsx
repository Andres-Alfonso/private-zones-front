// app/routes/assessments/AssessmentForm.tsx

import { useState, useEffect } from 'react';
import { Form } from '@remix-run/react';
import {
    Save, X, AlertCircle, ClipboardList, Settings,
    Clock, FileText
} from 'lucide-react';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';

interface AssessmentFormData {
    slug: string;
    type: 'evaluation' | 'survey' | 'self_assessment';
    status: 'draft' | 'published' | 'archived' | 'suspended';
    isActive: boolean;
    order: number;
    courseId: string;
    // Traducción principal (español por defecto)
    title: string;
    description: string;
    instructions: string;
    welcomeMessage: string;
    completionMessage: string;
    // Configuración
    isGradable: boolean;
    gradingMethod: 'automatic' | 'manual' | 'hybrid';
    passingScore: number | null;
    maxScore: number;
    timeLimit: number | null;
    strictTimeLimit: boolean;
    maxAttempts: number;
    allowReview: boolean;
    showCorrectAnswers: boolean;
    showScoreImmediately: boolean;
    randomizeOptions: boolean;
    oneQuestionPerPage: boolean;
}

interface AssessmentFormProps {
    initialData?: Partial<AssessmentFormData>;
    errors?: Array<{ field: string; message: string }>;
    isSubmitting?: boolean;
    onCancel: () => void;
    submitLabel?: string;
    availableCourses?: Array<{ id: string; title: string; slug: string }>;
}

const getErrorByField = (errors: Array<{ field: string; message: string }> = [], field: string): string | null => {
    const error = errors.find(e => e.field === field);
    return error ? error.message : null;
};

export default function AssessmentForm({
    initialData = {},
    errors = [],
    isSubmitting = false,
    onCancel,
    submitLabel = 'Guardar',
    availableCourses = []
}: AssessmentFormProps) {

    const [formData, setFormData] = useState<AssessmentFormData>({
        slug: '',
        type: 'evaluation',
        status: 'draft',
        isActive: true,
        order: 0,
        courseId: '',
        title: '',
        description: '',
        instructions: '',
        welcomeMessage: '',
        completionMessage: '',
        isGradable: true,
        gradingMethod: 'automatic',
        passingScore: 70,
        maxScore: 100,
        timeLimit: null,
        strictTimeLimit: false,
        maxAttempts: 1,
        allowReview: true,
        showCorrectAnswers: false,
        showScoreImmediately: true,
        randomizeOptions: false,
        oneQuestionPerPage: false,
        ...initialData
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

    // Generar slug automáticamente desde el título
    useEffect(() => {
        if (formData.title && autoGenerateSlug) {
            const slug = formData.title
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, autoGenerateSlug]);

    const updateField = (field: keyof AssessmentFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);

        if (field === 'slug') {
            setAutoGenerateSlug(false);
        }
    };

    return (
        <Form method="post" className="space-y-6">
            {/* Campos ocultos */}
            <input type="hidden" name="slug" value={formData.slug} />
            <input type="hidden" name="type" value={formData.type} />
            <input type="hidden" name="status" value={formData.status} />
            <input type="hidden" name="isActive" value={formData.isActive ? 'true' : 'false'} />
            <input type="hidden" name="order" value={formData.order} />
            <input type="hidden" name="courseId" value={formData.courseId} />
            <input type="hidden" name="title" value={formData.title} />
            <input type="hidden" name="description" value={formData.description} />
            <input type="hidden" name="instructions" value={formData.instructions} />
            <input type="hidden" name="welcomeMessage" value={formData.welcomeMessage} />
            <input type="hidden" name="completionMessage" value={formData.completionMessage} />
            <input type="hidden" name="isGradable" value={formData.isGradable ? 'true' : 'false'} />
            <input type="hidden" name="gradingMethod" value={formData.gradingMethod} />
            <input type="hidden" name="passingScore" value={formData.passingScore || ''} />
            <input type="hidden" name="maxScore" value={formData.maxScore} />
            <input type="hidden" name="timeLimit" value={formData.timeLimit || ''} />
            <input type="hidden" name="strictTimeLimit" value={formData.strictTimeLimit ? 'true' : 'false'} />
            <input type="hidden" name="maxAttempts" value={formData.maxAttempts} />
            <input type="hidden" name="allowReview" value={formData.allowReview ? 'true' : 'false'} />
            <input type="hidden" name="showCorrectAnswers" value={formData.showCorrectAnswers ? 'true' : 'false'} />
            <input type="hidden" name="showScoreImmediately" value={formData.showScoreImmediately ? 'true' : 'false'} />
            <input type="hidden" name="randomizeOptions" value={formData.randomizeOptions ? 'true' : 'false'} />
            <input type="hidden" name="oneQuestionPerPage" value={formData.oneQuestionPerPage ? 'true' : 'false'} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Columna izquierda - Cards del formulario */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Información Básica */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <ClipboardList className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    id="title"
                                    name="title"
                                    label="Título de la Evaluación *"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    error={getErrorByField(errors, 'title')}
                                    placeholder="Ej: Evaluación Final - Módulo 1"
                                />
                                <Input
                                    id="slug"
                                    name="slug"
                                    label="Slug (URL amigable) *"
                                    type="text"
                                    required
                                    disabled
                                    value={formData.slug}
                                    onChange={(e) => updateField('slug', e.target.value)}
                                    error={getErrorByField(errors, 'slug')}
                                    placeholder="evaluacion-final-modulo-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Evaluación *
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={(e) => updateField('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="evaluation">Evaluación</option>
                                        <option value="survey">Encuesta</option>
                                        <option value="self_assessment">Autoevaluación</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Curso *
                                    </label>
                                    <select
                                        id="courseId"
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={(e) => updateField('courseId', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Seleccionar curso...</option>
                                        {availableCourses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                    {getErrorByField(errors, 'courseId') && (
                                        <p className="mt-1 text-sm text-red-600">{getErrorByField(errors, 'courseId')}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Describe el contenido y objetivos de esta evaluación..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    id="order"
                                    name="order"
                                    label="Orden de visualización"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => updateField('order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                                <div className="flex items-end">
                                    <Checkbox
                                        id="isActive"
                                        name="isActive"
                                        label="Evaluación activa"
                                        checked={formData.isActive}
                                        onChange={(checked) => updateField('isActive', checked)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado *
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={(e) => updateField('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="draft">Borrador</option>
                                        <option value="published">Publicada</option>
                                        <option value="archived">Archivada</option>
                                        <option value="suspended">Suspendida</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuración de Calificación */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <Settings className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Configuración de Calificación</h2>
                        </div>

                        <div className="space-y-4">
                            <Checkbox
                                id="isGradable"
                                name="isGradable"
                                label="Esta evaluación otorga calificación"
                                checked={formData.isGradable}
                                onChange={(checked) => updateField('isGradable', checked)}
                            />

                            {formData.isGradable && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Método de Calificación
                                        </label>
                                        <select
                                            name="gradingMethod"
                                            value={formData.gradingMethod}
                                            onChange={(e) => updateField('gradingMethod', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="automatic">Automática</option>
                                            <option value="manual">Manual</option>
                                            <option value="hybrid">Híbrida</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            id="maxScore"
                                            name="maxScore"
                                            label="Puntaje máximo *"
                                            type="number"
                                            required
                                            value={formData.maxScore}
                                            onChange={(e) => updateField('maxScore', parseFloat(e.target.value) || 100)}
                                            min="1"
                                            step="0.01"
                                        />
                                        <Input
                                            id="passingScore"
                                            name="passingScore"
                                            label="Nota mínima para aprobar"
                                            type="number"
                                            value={formData.passingScore || ''}
                                            onChange={(e) => updateField('passingScore', e.target.value ? parseFloat(e.target.value) : null)}
                                            min="0"
                                            step="0.01"
                                            placeholder="Ej: 70"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Configuración de Tiempo e Intentos */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <Clock className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Tiempo e Intentos</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    id="timeLimit"
                                    name="timeLimit"
                                    label="Límite de tiempo (minutos)"
                                    type="number"
                                    value={formData.timeLimit || ''}
                                    onChange={(e) => updateField('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                                    min="1"
                                    placeholder="Sin límite"
                                />
                                <Input
                                    id="maxAttempts"
                                    name="maxAttempts"
                                    label="Máximo de intentos *"
                                    type="number"
                                    required
                                    value={formData.maxAttempts}
                                    onChange={(e) => updateField('maxAttempts', parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                            </div>

                            {formData.timeLimit && (
                                <Checkbox
                                    id="strictTimeLimit"
                                    name="strictTimeLimit"
                                    label="Límite de tiempo estricto (auto-enviar al terminar)"
                                    checked={formData.strictTimeLimit}
                                    onChange={(checked) => updateField('strictTimeLimit', checked)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Opciones de Visualización */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <Settings className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Opciones de Visualización</h2>
                        </div>

                        <div className="space-y-3">
                            <Checkbox
                                id="allowReview"
                                name="allowReview"
                                label="Permitir revisar respuestas después de enviar"
                                checked={formData.allowReview}
                                onChange={(checked) => updateField('allowReview', checked)}
                            />
                            <Checkbox
                                id="showCorrectAnswers"
                                name="showCorrectAnswers"
                                label="Mostrar respuestas correctas después de enviar"
                                checked={formData.showCorrectAnswers}
                                onChange={(checked) => updateField('showCorrectAnswers', checked)}
                            />
                            <Checkbox
                                id="showScoreImmediately"
                                name="showScoreImmediately"
                                label="Mostrar calificación inmediatamente"
                                checked={formData.showScoreImmediately}
                                onChange={(checked) => updateField('showScoreImmediately', checked)}
                            />
                            <Checkbox
                                id="randomizeOptions"
                                name="randomizeOptions"
                                label="Aleatorizar orden de opciones"
                                checked={formData.randomizeOptions}
                                onChange={(checked) => updateField('randomizeOptions', checked)}
                            />
                            <Checkbox
                                id="oneQuestionPerPage"
                                name="oneQuestionPerPage"
                                label="Una pregunta por página"
                                checked={formData.oneQuestionPerPage}
                                onChange={(checked) => updateField('oneQuestionPerPage', checked)}
                            />
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <FileText className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Mensajes e Instrucciones</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                                    Instrucciones para el estudiante
                                </label>
                                <textarea
                                    id="instructions"
                                    name="instructions"
                                    rows={4}
                                    value={formData.instructions}
                                    onChange={(e) => updateField('instructions', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Instrucciones sobre cómo realizar la evaluación..."
                                />
                            </div>

                            <div>
                                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mensaje de bienvenida
                                </label>
                                <textarea
                                    id="welcomeMessage"
                                    name="welcomeMessage"
                                    rows={3}
                                    value={formData.welcomeMessage}
                                    onChange={(e) => updateField('welcomeMessage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Mensaje que verá el estudiante al iniciar..."
                                />
                            </div>

                            <div>
                                <label htmlFor="completionMessage" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mensaje de finalización
                                </label>
                                <textarea
                                    id="completionMessage"
                                    name="completionMessage"
                                    rows={3}
                                    value={formData.completionMessage}
                                    onChange={(e) => updateField('completionMessage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Mensaje que verá al completar la evaluación..."
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                                    <p className="text-sm text-blue-800">
                                        Estos mensajes pueden ser personalizados por idioma después de crear la evaluación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Panel de Resumen (sticky) */}
                <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <Settings className="h-6 w-6 text-purple-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-sm font-medium text-gray-700">Título:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formData.title || <span className="text-gray-400 italic">Sin especificar</span>}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Slug:</span>
                                <p className="text-sm text-gray-900 mt-1 font-mono">
                                    /{formData.slug || <span className="text-gray-400 not-italic">sin-slug</span>}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Tipo:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formData.type === 'evaluation' ? 'Evaluación' :
                                        formData.type === 'survey' ? 'Encuesta' : 'Autoevaluación'}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Curso:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formData.courseId
                                        ? availableCourses.find(c => c.id === formData.courseId)?.title || 'Seleccionado'
                                        : <span className="text-gray-400 italic">No seleccionado</span>
                                    }
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Calificable:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formData.isGradable ? 'Sí' : 'No'}
                                </p>
                            </div>
                            {formData.isGradable && (
                                <>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Puntaje máximo:</span>
                                        <p className="text-sm text-gray-900 mt-1">{formData.maxScore}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Nota mínima:</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formData.passingScore || <span className="text-gray-400 italic">No especificada</span>}
                                        </p>
                                    </div>
                                </>
                            )}
                            <div>
                                <span className="text-sm font-medium text-gray-700">Límite de tiempo:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formData.timeLimit ? `${formData.timeLimit} minutos` : 'Sin límite'}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Intentos máximos:</span>
                                <p className="text-sm text-gray-900 mt-1">{formData.maxAttempts}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Estado:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formData.isActive ? 'Activa' : 'Inactiva'}
                                </p>
                            </div>
                        </div>

                        {hasChanges && (
                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-amber-400 mr-2 flex-shrink-0" />
                                    <p className="text-xs text-amber-800">
                                        {initialData.title ? 'Tienes cambios sin guardar' : 'Completa el formulario para crear la evaluación'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="mt-6 space-y-3">
                            <button
                                name="intent"
                                value="update"
                                type="submit"
                                disabled={isSubmitting || !formData.title || !formData.slug || !formData.courseId}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                <Save className="h-5 w-5" />
                                <span>{isSubmitting ? 'Guardando...' : submitLabel}</span>
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                <X className="h-5 w-5" />
                                <span>Cancelar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    );
}