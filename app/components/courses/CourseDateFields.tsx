// app/components/courses/CourseDateFields.tsx
import { Calendar, Clock } from "lucide-react";
import Input from "~/components/ui/Input";

interface CourseDateFieldsProps {
  formData: any;
  errors: Array<{ field: string; message: string }>;
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
}

export function CourseDateFields({ 
  formData, 
  errors = [],
  isSubmitting, 
  onChange 
}: CourseDateFieldsProps) {
  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="space-y-8">
      {/* Fechas del curso */}
      <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Período del Curso</h3>
            <p className="text-sm text-gray-600">Define cuándo se desarrollará el curso</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="date"
            id="startDate"
            name="startDate"
            label="Fecha de Inicio del Curso"
            error={getErrorByField('startDate')}
            disabled={isSubmitting}
            value={formData.startDate || ''}
            onChange={(e) => onChange('startDate', e.target.value)}
            icon={<Calendar className="h-5 w-5" />}
            helperText="Cuándo comenzará el curso"
          />

          <Input
            type="date"
            id="endDate"
            name="endDate"
            label="Fecha de Fin del Curso"
            error={getErrorByField('endDate')}
            disabled={isSubmitting}
            value={formData.endDate || ''}
            onChange={(e) => onChange('endDate', e.target.value)}
            icon={<Calendar className="h-5 w-5" />}
            helperText="Cuándo terminará el curso"
          />
        </div>
      </div>

      {/* Información adicional de tiempo */}
      <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h4 className="font-bold text-gray-900">Información de Tiempo</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
            <div className="font-medium text-gray-700">Duración Calculada</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {formData.startDate && formData.endDate ? 
                Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + ' días'
                : '-- días'}
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
            <div className="font-medium text-gray-700">Horas Estimadas</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {formData.estimatedHours || '--'} hrs
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
            <div className="font-medium text-gray-700">Intensidad</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {formData.intensity ? 
                ['--', '🟢 Baja', '🟡 Media', '🟠 Alta', '🔴 Intensiva'][formData.intensity] || '--'
                : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}