// app/components/ui/Alert.tsx

import { useState } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const alertStyles = {
  success: {
    container: "bg-green-50/80 border border-green-200/50 text-green-800",
    icon: "text-green-400",
    button: "text-green-500 hover:text-green-600"
  },
  error: {
    container: "bg-red-50/80 border border-red-200/50 text-red-800",
    icon: "text-red-400",
    button: "text-red-500 hover:text-red-600"
  },
  warning: {
    container: "bg-yellow-50/80 border border-yellow-200/50 text-yellow-800",
    icon: "text-yellow-400",
    button: "text-yellow-500 hover:text-yellow-600"
  },
  info: {
    container: "bg-blue-50/80 border border-blue-200/50 text-blue-800",
    icon: "text-blue-400",
    button: "text-blue-500 hover:text-blue-600"
  }
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

export default function Alert({ 
  type, 
  message, 
  dismissible = false, 
  onDismiss,
  className = ""
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const styles = alertStyles[type];
  const IconComponent = icons[type];

  return (
    <div className={`p-4 rounded-xl shadow-lg backdrop-blur-sm ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
              >
                <span className="sr-only">Cerrar</span>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}