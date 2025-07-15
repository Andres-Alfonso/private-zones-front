// app/components/courses/CourseMetrics.tsx
import { Clock, Users, Star, TrendingUp, Award, DollarSign } from "lucide-react";
import { Course } from "~/api/types/course.types";

interface CourseMetricsProps {
  course: Course;
  variant?: 'horizontal' | 'vertical' | 'grid';
  showRevenue?: boolean;
  revenue?: number;
  rating?: number;
}

export function CourseMetrics({ 
  course, 
  variant = 'horizontal', 
  showRevenue = false,
  revenue = 0,
  rating = 4.5 
}: CourseMetricsProps) {
  const metrics = [
    {
      icon: Clock,
      label: 'Duración',
      value: `${course.duration}h`,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Users,
      label: 'Estudiantes',
      value: `${course.currentStudents}/${course.maxStudents}`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Star,
      label: 'Rating',
      value: rating.toFixed(1),
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    }
  ];

  if (showRevenue) {
    metrics.push({
      icon: DollarSign,
      label: 'Ingresos',
      value: `$${revenue.toFixed(0)}`,
      color: 'text-green-600',
      bg: 'bg-green-50'
    });
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex items-center space-x-4 flex-wrap">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${metric.bg}`}>
              <Icon className={`h-4 w-4 ${metric.color}`} />
              <span className="font-medium text-gray-800">{metric.value}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className={`p-4 rounded-xl ${metric.bg} border border-gray-200/50`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white/80 ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // vertical variant
  return (
    <div className="space-y-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${metric.bg}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{metric.label}</span>
            </div>
            <span className="font-bold text-gray-900">{metric.value}</span>
          </div>
        );
      })}
    </div>
  );
}