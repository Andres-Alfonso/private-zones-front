// app/components/courses/CourseProgress.tsx
interface CourseProgressProps {
  current: number;
  max: number;
  showPercentage?: boolean;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'red';
}

export function CourseProgress({ 
  current, 
  max, 
  showPercentage = true, 
  showNumbers = true,
  size = 'md',
  color = 'blue'
}: CourseProgressProps) {
  const percentage = Math.round((current / max) * 100);
  const isFull = current >= max;
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="space-y-2">
      {(showNumbers || showPercentage) && (
        <div className="flex justify-between text-sm font-medium text-gray-600">
          {showNumbers && <span>{current} / {max} estudiantes</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div 
          className={`bg-gradient-to-r ${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-500 relative`}
          style={{ width: `${percentage}%` }}
        >
          {isFull && (
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          )}
        </div>
      </div>
      
      {isFull && (
        <div className="text-xs text-center text-red-600 font-medium">
          ¡Curso lleno!
        </div>
      )}
    </div>
  );
}