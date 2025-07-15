// app/components/courses/CourseFormSection.tsx
interface CourseFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function CourseFormSection({ title, description, children, icon }: CourseFormSectionProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50">
      <div className="px-8 py-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-8 py-8">
        {children}
      </div>
    </div>
  );
}