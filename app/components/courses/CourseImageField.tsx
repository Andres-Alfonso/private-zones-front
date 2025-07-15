// app/components/courses/CourseImageField.tsx
import { Image, Upload } from "lucide-react";
import Input from "~/components/ui/Input";

interface CourseImageFieldProps {
  formData: any;
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
}

export function CourseImageField({ 
  formData, 
  isSubmitting, 
  onChange 
}: CourseImageFieldProps) {
  return (
    <div className="space-y-4">
      <Input
        type="url"
        id="thumbnail"
        name="thumbnail"
        label="URL de la Imagen del Curso"
        disabled={isSubmitting}
        placeholder="https://ejemplo.com/imagen-curso.jpg"
        value={formData.thumbnail || ''}
        onChange={(e) => onChange('thumbnail', e.target.value)}
        icon={<Image className="h-5 w-5" />}
        helperText="URL de la imagen que representará el curso en el catálogo"
      />

      {/* Preview de la imagen */}
      {formData.thumbnail && (
        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Vista Previa
          </label>
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border-2 border-gray-200">
            <img 
              src={formData.thumbnail} 
              alt="Preview del curso"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}