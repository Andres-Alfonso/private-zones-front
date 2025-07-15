// app/components/courses/CourseStatusBadge.tsx
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Course } from "~/api/types/course.types";

interface CourseStatusBadgeProps {
  course: Course;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function CourseStatusBadge({ course, size = 'md', showIcon = true }: CourseStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  if (course.isActive) {
    return (
      <span className={`inline-flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full shadow-lg ${sizeClasses[size]}`}>
        {showIcon && <CheckCircle className={iconSizes[size]} />}
        <span>Activo</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-full shadow-lg ${sizeClasses[size]}`}>
      {showIcon && <EyeOff className={iconSizes[size]} />}
      <span>Inactivo</span>
    </span>
  );
}