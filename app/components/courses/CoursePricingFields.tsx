// app/components/courses/CoursePricingFields.tsx
import { DollarSign, Users } from "lucide-react";
import Input from "~/components/ui/Input";

interface CoursePricingFieldsProps {
  formData: any;
  errors: Array<{ field: string; message: string }>;
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
  currentStudents?: number;
}

export function CoursePricingFields({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange,
  currentStudents 
}: CoursePricingFieldsProps) {
  const getErrorByField = (field: string): string | null => {
    const error = errors.find(err => err.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Precio */}
      <Input
        type="number"
        id="price"
        name="price"
        label="Precio (USD)"
        required
        min="0"
        step="0.01"
        error={getErrorByField('price')}
        disabled={isSubmitting}
        placeholder="99.99"
        value={formData.price || ''}
        onChange={(e) => onChange('price', e.target.value)}
        icon={<DollarSign className="h-5 w-5" />}
      />

      {/* Máximo estudiantes */}
      <Input
        type="number"
        id="maxStudents"
        name="maxStudents"
        label="Máximo de Estudiantes"
        required
        min="1"
        error={getErrorByField('maxStudents')}
        disabled={isSubmitting}
        placeholder="50"
        value={formData.maxStudents || ''}
        onChange={(e) => onChange('maxStudents', e.target.value)}
        icon={<Users className="h-5 w-5" />}
        helperText={currentStudents ? `Actualmente hay ${currentStudents} estudiantes inscritos` : undefined}
      />
    </div>
  );
}