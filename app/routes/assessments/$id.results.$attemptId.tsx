// Vista para mostrar resultados después de enviar
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { CheckCircle, XCircle, Award } from 'lucide-react';

export const loader: LoaderFunction = async ({ params }) => {
    // Aquí cargarías los resultados del intento
    // Por ahora retornamos datos de ejemplo
    return json({
        score: 85,
        passed: true,
        totalQuestions: 10,
        correctAnswers: 8,
    });
};

export default function AssessmentResults() {
    const data = useLoaderData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Implementar UI de resultados */}
            </div>
        </div>
    );
}