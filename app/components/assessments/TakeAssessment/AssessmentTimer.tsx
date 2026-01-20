// app/components/assessments/TakeAssessment/AssessmentTimer.tsx

import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface AssessmentTimerProps {
    initialTime: number; // En segundos
    onTimeUp: () => void;
}

export default function AssessmentTimer({ initialTime, onTimeUp }: AssessmentTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    useEffect(() => {
        if (timeRemaining <= 0) {
            onTimeUp();
            return;
        }

        const interval = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining, onTimeUp]);

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const isWarning = timeRemaining < 300; // Menos de 5 minutos
    const isCritical = timeRemaining < 60; // Menos de 1 minuto

    return (
        <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${isCritical
                    ? 'bg-red-100 text-red-700'
                    : isWarning
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                }`}
        >
            {isCritical ? (
                <AlertCircle className="h-5 w-5 animate-pulse" />
            ) : (
                <Clock className="h-5 w-5" />
            )}
            <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}