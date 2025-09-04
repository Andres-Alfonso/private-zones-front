// ~/components/modules/ModuleItemsManager.tsx

import { useState } from "react";
import { Plus, Trash2, GripVertical, FileText, MessageSquare, ClipboardList, HelpCircle, BarChart3, Activity, Search, X } from "lucide-react";
import { ModuleItemData } from "~/routes/modules/course/$courseId/create";
import { ContentItem } from "~/api/types/content.types";

interface ModuleItemsManagerProps {
    items: ModuleItemData[];
    availableContents: ContentItem[];
    onItemsChange: (items: ModuleItemData[]) => void;
    error?: string;
}

const ITEM_TYPES = [
    {
        value: 'content' as const,
        label: 'Contenido',
        icon: FileText,
        color: 'blue',
        description: 'Videos, documentos, imágenes, etc.'
    },
    {
        value: 'forum' as const,
        label: 'Foro',
        icon: MessageSquare,
        color: 'green',
        description: 'Espacio de discusión y colaboración'
    },
    {
        value: 'task' as const,
        label: 'Tarea',
        icon: ClipboardList,
        color: 'orange',
        description: 'Asignaciones y entregables'
    },
    {
        value: 'quiz' as const,
        label: 'Quiz',
        icon: HelpCircle,
        color: 'purple',
        description: 'Evaluaciones y cuestionarios'
    },
    {
        value: 'survey' as const,
        label: 'Encuesta',
        icon: BarChart3,
        color: 'teal',
        description: 'Recolección de opiniones'
    },
    {
        value: 'activity' as const,
        label: 'Actividad',
        icon: Activity,
        color: 'red',
        description: 'Actividades interactivas'
    }
];

export function ModuleItemsManager({
    items,
    availableContents,
    onItemsChange,
    error
}: ModuleItemsManagerProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState<number | null>(null);

    // Filtrar contenidos por búsqueda
    const filteredContents = availableContents.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Agregar item al módulo
    const handleAddItem = (type: string, referenceId: string, title?: string) => {
        const newItem: ModuleItemData = {
            type: type as any,
            referenceId,
            order: items.length,
            title
        };

        onItemsChange([...items, newItem]);
        setShowAddDialog(false);
        setSelectedType('');
        setSearchTerm('');
    };

    // Eliminar item
    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        // Reordenar
        const reorderedItems = newItems.map((item, i) => ({ ...item, order: i }));
        onItemsChange(reorderedItems);
    };

    // Manejar drag and drop
    const handleDragStart = (index: number) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItem === null) return;

        const newItems = [...items];
        const draggedItemData = newItems[draggedItem];

        // Remover el item arrastrado
        newItems.splice(draggedItem, 1);
        // Insertar en la nueva posición
        newItems.splice(index, 0, draggedItemData);

        // Reordenar
        const reorderedItems = newItems.map((item, i) => ({ ...item, order: i }));
        onItemsChange(reorderedItems);
        setDraggedItem(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    // Obtener icono y color para tipo de item
    const getItemTypeInfo = (type: string) => {
        return ITEM_TYPES.find(t => t.value === type) || ITEM_TYPES[0];
    };

    // Obtener título del item basado en el tipo y referencia
    const getItemTitle = (item: ModuleItemData) => {
        if (item.title) return item.title;

        if (item.type === 'content') {
            const content = availableContents.find(c => c.id === item.referenceId);
            return content ? content.title : `Contenido ${item.referenceId}`;
        }

        return `${getItemTypeInfo(item.type).label} ${item.referenceId}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <ClipboardList className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Contenido del Módulo</h2>
                        <p className="text-sm text-gray-600">Agrega y organiza los elementos del módulo</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowAddDialog(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Item</span>
                </button>
            </div>

            {/* Lista de items */}
            {/* <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay items en el módulo</h3>
                        <p className="text-gray-600 mb-4">Agrega contenidos, foros, tareas o actividades al módulo</p>
                        <button
                            type="button"
                            onClick={() => setShowAddDialog(true)}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Agregar Primer Item</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((item, index) => {
                            const typeInfo = getItemTypeInfo(item.type);
                            const IconComponent = typeInfo.icon;

                            return (
                                <div
                                    key={`${item.type}-${item.referenceId}-${index}`}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`
                    flex items-center space-x-4 p-4 bg-white border rounded-xl transition-all duration-200
                    cursor-move hover:shadow-md
                    ${draggedItem === index ? 'opacity-50 shadow-lg' : 'border-gray-200'}
                  `}
                                >
                                    <div className="flex-shrink-0">
                                        <GripVertical className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <div className={`p-2 bg-${typeInfo.color}-100 rounded-lg flex-shrink-0`}>
                                        <IconComponent className={`h-5 w-5 text-${typeInfo.color}-600`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-700 rounded-full`}>
                                                {typeInfo.label}
                                            </span>
                                            <span className="text-sm text-gray-500">#{index + 1}</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900 truncate">{getItemTitle(item)}</h4>
                                        <p className="text-sm text-gray-600">ID: {item.referenceId}</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div> */}

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Modal para agregar item */}
            {showAddDialog && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddDialog(false)} />

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-6 py-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Agregar Item al Módulo</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddDialog(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Selector de tipo */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Selecciona el tipo de item</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {ITEM_TYPES.map((type) => {
                                            const IconComponent = type.icon;
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setSelectedType(type.value)}
                                                    className={`
                            p-4 border rounded-xl text-left transition-all duration-200
                            ${selectedType === type.value
                                                            ? `border-${type.color}-500 bg-${type.color}-50`
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }
                          `}
                                                >
                                                    <div className={`p-2 bg-${type.color}-100 rounded-lg inline-block mb-2`}>
                                                        <IconComponent className={`h-5 w-5 text-${type.color}-600`} />
                                                    </div>
                                                    <h5 className="font-medium text-gray-900">{type.label}</h5>
                                                    <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Selector de referencia basado en el tipo */}
                                {selectedType === 'content' && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Selecciona el contenido</h4>

                                        {/* Buscador */}
                                        <div className="relative mb-4">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar contenido..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {filteredContents.length === 0 ? (
                                                <p className="text-center text-gray-500 py-4">No se encontraron contenidos</p>
                                            ) : (
                                                filteredContents.map((content) => (
                                                    <button
                                                        key={content.id}
                                                        type="button"
                                                        onClick={() => handleAddItem('content', content.id, content.title)}
                                                        className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition-all duration-200"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-medium text-gray-900 truncate">{content.title}</h5>
                                                                <p className="text-sm text-gray-600 truncate">
                                                                    {content.description || 'Sin descripción'}
                                                                </p>
                                                                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                                                                    {content.contentType}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedType && selectedType !== 'content' && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">ID de Referencia</h4>
                                        <input
                                            type="text"
                                            placeholder={`ID del ${getItemTypeInfo(selectedType).label.toLowerCase()}`}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const input = e.target as HTMLInputElement;
                                                    if (input.value.trim()) {
                                                        handleAddItem(selectedType, input.value.trim());
                                                    }
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Presiona Enter para agregar o contacta al administrador para crear este {getItemTypeInfo(selectedType).label.toLowerCase()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}