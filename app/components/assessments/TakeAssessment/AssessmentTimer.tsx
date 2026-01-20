import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface AssessmentTimerProps {
    initialTime: number; // en segundos
    onTimeUp: () => void;
}

export default function AssessmentTimer({ initialTime, onTimeUp }: AssessmentTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    useEffect(() => {
        if (timeRemaining <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, onTimeUp]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        const percentRemaining = (timeRemaining / initialTime) * 100;
        if (percentRemaining > 50) return 'text-green-600 bg-green-50';
        if (percentRemaining > 20) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${getTimerColor()}`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
        </div>
    );
}