// app/components/courses/CourseVisibilityFields.tsx
import { Users, Link2, Shield, CheckCircle } from "lucide-react";
import Input from "~/components/ui/Input";

interface CourseVisibilityFieldsProps {
  formData: any;
  errors: Array<{ field: string; message: string }>;
  isSubmitting: boolean;
  onChange: (field: string, value: string | boolean | number) => void;
}

export function CourseVisibilityFields({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange 
}: CourseVisibilityFieldsProps) {
  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="space-y-6">
      {/* Configuración de inscripciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="number"
          id="maxEnrollments"
          name="maxEnrollments"
          label="Máximo de Inscripciones"
          min="1"
          error={getErrorByField('maxEnrollments')}
          disabled={isSubmitting}
          placeholder="50"
          value={formData.maxEnrollments || ''}
          onChange={(e) => onChange('maxEnrollments', e.target.value)}
          icon={<Users className="h-5 w-5" />}
          helperText="Deja vacío para sin límite"
        />

        <Input
          type="url"
          id="invitationLink"
          name="invitationLink"
          label="Enlace de Invitación"
          disabled={isSubmitting}
          placeholder="https://mi-curso.com/invitacion"
          value={formData.invitationLink || ''}
          onChange={(e) => onChange('invitationLink', e.target.value)}
          icon={<Link2 className="h-5 w-5" />}
          helperText="URL personalizada para invitar estudiantes"
        />
      </div>

      {/* Fechas de inscripción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="datetime-local"
          id="enrollmentStartDate"
          name="enrollmentStartDate"
          label="Inicio de Inscripciones"
          error={getErrorByField('enrollmentStartDate')}
          disabled={isSubmitting}
          value={formData.enrollmentStartDate || ''}
          onChange={(e) => onChange('enrollmentStartDate', e.target.value)}
          icon={<CheckCircle className="h-5 w-5" />}
        />

        <Input
          type="datetime-local"
          id="enrollmentEndDate"
          name="enrollmentEndDate"
          label="Fin de Inscripciones"
          error={getErrorByField('enrollmentEndDate')}
          disabled={isSubmitting}
          value={formData.enrollmentEndDate || ''}
          onChange={(e) => onChange('enrollmentEndDate', e.target.value)}
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      {/* Opciones de inscripción */}
      <div className="space-y-4">
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Opciones de Inscripción
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="allowSelfEnrollment"
                checked={formData.allowSelfEnrollment || false}
                onChange={(e) => onChange('allowSelfEnrollment', e.target.checked)}
                disabled={isSubmitting}
                className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span className="font-medium text-gray-900">Permitir auto-inscripción</span>
                <p className="text-sm text-gray-600">Los estudiantes pueden inscribirse automáticamente</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="requiresApproval"
                checked={formData.requiresApproval || false}
                onChange={(e) => onChange('requiresApproval', e.target.checked)}
                disabled={isSubmitting}
                className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span className="font-medium text-gray-900">Requiere aprobación</span>
                <p className="text-sm text-gray-600">Las inscripciones necesitan aprobación manual</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}