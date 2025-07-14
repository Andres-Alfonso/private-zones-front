// app/components/ui/AutoDismissAlert.tsx
// Versión que se oculta automáticamente después de unos segundos

import { useState, useEffect } from "react";

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AutoDismissAlertProps {
  type: AlertType;
  message: string;
  duration?: number; // Duración en milisegundos (default: 5000)
  onDismiss?: () => void;
}

const alertStyles = {
  success: {
    container: "bg-green-50 border border-green-200 text-green-800",
    icon: "text-green-400",
    progressBar: "bg-green-500"
  },
  error: {
    container: "bg-red-50 border border-red-200 text-red-800",
    icon: "text-red-400",
    progressBar: "bg-red-500"
  },
  warning: {
    container: "bg-yellow-50 border border-yellow-200 text-yellow-800",
    icon: "text-yellow-400",
    progressBar: "bg-yellow-500"
  },
  info: {
    container: "bg-blue-50 border border-blue-200 text-blue-800",
    icon: "text-blue-400",
    progressBar: "bg-blue-500"
  }
};

const icons = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  )
};

export default function AutoDismissAlert({ 
  type, 
  message, 
  duration = 5000, 
  onDismiss 
}: AutoDismissAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          setIsVisible(false);
          onDismiss?.();
          clearInterval(interval);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const styles = alertStyles[type];

  return (
    <div className={`relative overflow-hidden p-4 rounded-md shadow-md ${styles.container}`}>
      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full">
        <div 
          className={`h-full transition-all ease-linear ${styles.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex">
        <div className="flex-shrink-0">
          <div className={styles.icon}>
            {icons[type]}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}