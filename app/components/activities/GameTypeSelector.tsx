// app/components/activities/GameTypeSelector.tsx

import { 
    Grid3x3, Layers, Type, 
    MoveHorizontal, Link2, Brain, HelpCircle, Boxes
} from "lucide-react";
import type { GameType } from "~/api/types/activity.types";

interface GameTypeOption {
    type: GameType;
    name: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
}

interface GameTypeSelectorProps {
    onSelect: (gameType: GameType) => void;
}

const gameTypes: GameTypeOption[] = [
    {
        type: "word_search",
        name: "Sopa de Letras",
        description: "Busca palabras ocultas en una cuadrícula de letras",
        icon: Grid3x3,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
        type: "hanging",
        name: "Ahorcado",
        description: "Adivina la palabra letra por letra antes de quedarte sin intentos",
        icon: Type,
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-50 hover:bg-red-100",
    },
    {
        type: "complete_phrase",
        name: "Completar Frase",
        description: "Completa las frases con las palabras correctas",
        icon: Layers,
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50 hover:bg-green-100",
    },
    {
        type: "crossword",
        name: "Crucigrama",
        description: "Resuelve el crucigrama usando las pistas proporcionadas",
        icon: Grid3x3,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50 hover:bg-purple-100",
    },
    {
        type: "drag_drop",
        name: "Arrastrar y Soltar",
        description: "Arrastra elementos a su posición correcta",
        icon: MoveHorizontal,
        color: "from-yellow-500 to-yellow-600",
        bgColor: "bg-yellow-50 hover:bg-yellow-100",
    },
    {
        type: "matching",
        name: "Emparejar",
        description: "Conecta elementos relacionados entre sí",
        icon: Link2,
        color: "from-pink-500 to-pink-600",
        bgColor: "bg-pink-50 hover:bg-pink-100",
    },
    {
        type: "memory",
        name: "Memoria",
        description: "Encuentra las parejas de cartas volteándolas de dos en dos",
        icon: Brain,
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-50 hover:bg-indigo-100",
    },
    {
        type: "quiz_game",
        name: "Quiz Interactivo",
        description: "Responde preguntas de opción múltiple en un formato dinámico",
        icon: HelpCircle,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50 hover:bg-orange-100",
    },
    {
        type: "puzzle",
        name: "Rompecabezas",
        description: "Completa el rompecabezas moviendo las piezas al lugar correcto",
        icon: HelpCircle,
        color: "from-teal-500 to-teal-600",
        bgColor: "bg-teal-50 hover:bg-teal-100",
    },
];

export default function GameTypeSelector({ onSelect }: GameTypeSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Selecciona el Tipo de Juego
                </h2>
                <p className="text-gray-600">
                    Elige el tipo de actividad educativa que deseas crear
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameTypes.map((gameType) => {
                    const Icon = gameType.icon;
                    return (
                        <button
                            key={gameType.type}
                            onClick={() => onSelect(gameType.type)}
                            className={`${gameType.bgColor} border-2 border-gray-200 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-105 hover:border-transparent group`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`bg-gradient-to-r ${gameType.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {gameType.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {gameType.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo: {gameType.type}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                    <Boxes className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-2">
                            Nota sobre los tipos de actividades
                        </h4>
                        <p className="text-sm text-blue-800">
                            Cada tipo de actividad tiene configuraciones específicas que podrás personalizar
                            después de seleccionar el curso. Todos los juegos están diseñados para ser
                            educativos y mantener a los estudiantes motivados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}