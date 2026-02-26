import { useState } from "react";
import {
    json,
    useLoaderData,
    useSearchParams,
    useNavigate,
    useSubmit,
    NavLink,
} from "@remix-run/react";
import {
    LoaderFunction,
    ActionFunction,
} from "@remix-run/node";
import {
    ArrowLeft,
    Layers,
    BookOpen,
    MessageSquare,
    ClipboardList,
    Gamepad2,
    FileText,
    Settings,
    Plus,
    GripVertical,
    Eye,
    EyeOff,
    Trash2,
    AlertCircle,
    ChevronRight,
    BarChart2,
    Check,
    Search,
    X,
} from "lucide-react";
import { createApiClientFromRequest } from "~/api/client";
import { ModuleAPI } from "~/api/endpoints/modules";
import { AvailableItems, AvailableResource, ModuleDetail, ModuleItemData, ModuleItemType } from "~/api/types/modules.types";

// ─── Loader ───────────────────────────────────────────────────────────────────

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const moduleId = params.moduleId;
        if (!moduleId) throw new Response("Module ID is required", { status: 400 });

        const url = new URL(request.url);
        const courseId = url.searchParams.get("course");

        const authenticatedApiClient = createApiClientFromRequest(request);

        // Cargar módulo y recursos disponibles en paralelo
        const [module, availableItems] = await Promise.all([
            ModuleAPI.getModuleItems(moduleId, authenticatedApiClient),
            courseId
                ? ModuleAPI.getAvailableItemsByCourse(courseId, authenticatedApiClient)
                : Promise.resolve(null),
        ]);

        if (!module) {
            return json({ module: null, courseId, availableItems: null, error: "Módulo no encontrado" });
        }

        return json({ module, courseId, availableItems, error: null });

    } catch (error: any) {
        return json({ module: null, courseId: null, availableItems: null, error: error.message });
    }
};

// ─── Action ───────────────────────────────────────────────────────────────────

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const actionType = formData.get("_action");
    const moduleId = params.moduleId!;

    const authenticatedApiClient = createApiClientFromRequest(request);

    try {
        if (actionType === "removeItem") {
            const itemId = formData.get("itemId") as string;
            await ModuleAPI.removeModuleItem(moduleId, itemId, authenticatedApiClient);
            return json({ success: true, message: "Ítem eliminado correctamente" });
        }
        if (actionType === "addItem") {
            const type = formData.get("type") as string;
            const referenceId = formData.get("referenceId") as string;
            await ModuleAPI.addModuleItem(moduleId, { type, referenceId }, authenticatedApiClient);
            return json({ success: true, message: "Ítem agregado correctamente" });
        }
    } catch (error: any) {
        return json(
            { success: false, message: error.message || "Error al procesar la acción" },
            { status: 500 }
        );
    }

    return json({ success: false, message: "Acción no válida" }, { status: 400 });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ITEM_TYPE_META: Record<
    ModuleItemType,
    { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
    content: {
        label: "Contenido",
        icon: <BookOpen className="h-4 w-4" />,
        color: "text-blue-600",
        bg: "from-blue-500 to-blue-600",
    },
    forum: {
        label: "Foro",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "text-emerald-600",
        bg: "from-emerald-500 to-emerald-600",
    },
    task: {
        label: "Tarea",
        icon: <ClipboardList className="h-4 w-4" />,
        color: "text-orange-600",
        bg: "from-orange-500 to-orange-600",
    },
    quiz: {
        label: "Evaluación",
        icon: <BarChart2 className="h-4 w-4" />,
        color: "text-violet-600",
        bg: "from-violet-500 to-violet-600",
    },
    survey: {
        label: "Encuesta",
        icon: <FileText className="h-4 w-4" />,
        color: "text-pink-600",
        bg: "from-pink-500 to-pink-600",
    },
    activity: {
        label: "Actividad",
        icon: <Gamepad2 className="h-4 w-4" />,
        color: "text-amber-600",
        bg: "from-amber-500 to-amber-600",
    },
};

function getItemTitle(item: ModuleItemData): string {
    if (item.content?.title) return item.content.title;
    return `${ITEM_TYPE_META[item.type]?.label ?? item.type} — ${item.referenceId.slice(0, 8)}`;
}

function getItemSubtitle(item: ModuleItemData): string | null {
    if (item.type === "content" && item.content?.contentType) {
        return item.content.contentType.toUpperCase();
    }
    return null;
}


const MODAL_TABS: { type: ModuleItemType; label: string }[] = [
    { type: "content",  label: "Contenidos"  },
    { type: "forum",    label: "Foros"       },
    { type: "task",     label: "Tareas"      },
    { type: "quiz",     label: "Evaluaciones"},
    { type: "survey",   label: "Encuestas"   },
    { type: "activity", label: "Actividades" },
];


// ── Componente del modal ─────────────────────────────────────────────────────

function AddItemModal({
    moduleId,
    existingItems,
    availableItems,
    onClose,
}: {
    moduleId: string;
    existingItems: ModuleItemData[];
    availableItems: AvailableItems | null;
    onClose: () => void;
}) {
    const submit = useSubmit();
    const [activeTab, setActiveTab] = useState<ModuleItemType>("content");
    const [search, setSearch] = useState("");
    const [addingId, setAddingId] = useState<string | null>(null);

    const meta = ITEM_TYPE_META[activeTab];

    // IDs ya presentes en el módulo para el tab activo
    const addedIds = new Set(
        existingItems.filter((i) => i.type === activeTab).map((i) => i.referenceId)
    );

    const filtered = (availableItems?.[activeTab] ?? []).filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = (resource: AvailableResource) => {
        if (addingId) return;
        setAddingId(resource.id);
        const fd = new FormData();
        fd.append("_action", "addItem");
        fd.append("type", activeTab);
        fd.append("referenceId", resource.id);
        submit(fd, { method: "post", replace: true });
        setTimeout(() => setAddingId(null), 800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                            <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Agregar contenido al módulo</h3>
                            <p className="text-sm text-gray-500">Selecciona los recursos disponibles del curso</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 px-6 pt-4 overflow-x-auto border-b border-gray-100 pb-0">
                    {MODAL_TABS.map(({ type, label }) => {
                        const tabMeta = ITEM_TYPE_META[type];
                        const count = availableItems?.[type]?.length ?? 0;
                        return (
                            <button
                                key={type}
                                onClick={() => { setActiveTab(type); setSearch(""); }}
                                className={`flex items-center space-x-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 -mb-px ${
                                    activeTab === type
                                        ? "border-purple-500 text-purple-700"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <span className={tabMeta.color}>{tabMeta.icon}</span>
                                <span>{label}</span>
                                {count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                        activeTab === type
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-gray-100 text-gray-500"
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Buscador */}
                <div className="px-6 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Buscar en ${meta.label.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                        />
                    </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <div className={`mx-auto w-14 h-14 bg-gradient-to-br ${meta.bg} opacity-30 rounded-2xl flex items-center justify-center mb-4`}>
                                <span className="text-white">{meta.icon}</span>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">
                                {search
                                    ? `Sin resultados para "${search}"`
                                    : `No hay ${meta.label.toLowerCase()}s disponibles en este curso`}
                            </p>
                        </div>
                    ) : (
                        filtered.map((resource) => {
                            const isAdded   = addedIds.has(resource.id);
                            const isAdding  = addingId === resource.id;

                            return (
                                <div
                                    key={resource.id}
                                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 ${
                                        isAdded
                                            ? "bg-green-50 border-green-200"
                                            : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
                                    }`}
                                >
                                    <div className={`p-2 bg-gradient-to-br ${meta.bg} rounded-lg flex-shrink-0`}>
                                        <span className="text-white">{meta.icon}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">{resource.title}</p>
                                        {resource.subtitle && (
                                            <p className="text-xs text-gray-400 mt-0.5 uppercase">{resource.subtitle}</p>
                                        )}
                                    </div>

                                    {isAdded ? (
                                        <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex-shrink-0">
                                            <Check className="h-3.5 w-3.5" />
                                            <span>Agregado</span>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleAdd(resource)}
                                            disabled={!!addingId}
                                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 flex-shrink-0"
                                        >
                                            {isAdding ? (
                                                <span>Agregando...</span>
                                            ) : (
                                                <><Plus className="h-3.5 w-3.5" /><span>Agregar</span></>
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModuleDetailPage() {
    const { module, courseId, availableItems, error } = useLoaderData<{
        module: ModuleDetail | null;
        courseId: string | null;
        availableItems: AvailableItems | null;
        error: string | null;
    }>();

    const navigate = useNavigate();
    const submit = useSubmit();

    const [itemToDelete, setItemToDelete] = useState<ModuleItemData | null>(null);
    const [isDeletingItem, setIsDeletingItem] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);

    // ── Error state ──────────────────────────────────────────────────────────

    if (error || !module) {
        return (
            <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/60 max-w-md mx-auto">
                    <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                    <p className="text-gray-600">{error ?? "Módulo no encontrado"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 mx-auto"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>
            </div>
        );
    }

    // ── Derived data ─────────────────────────────────────────────────────────

    const sortedItems = [...(module.items ?? [])].sort(
        (a, b) => (a.order ?? 999999) - (b.order ?? 999999)
    );

    const countByType = sortedItems.reduce<Record<string, number>>((acc, item) => {
        acc[item.type] = (acc[item.type] ?? 0) + 1;
        return acc;
    }, {});

    const backTo = courseId
        ? `/modules/course/${courseId}`
        : -1;

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        setIsDeletingItem(true);
        const fd = new FormData();
        fd.append("_action", "removeItem");
        fd.append("itemId", itemToDelete.id);
        submit(fd, { method: "post", replace: true });
        setTimeout(() => {
            setItemToDelete(null);
            setIsDeletingItem(false);
        }, 800);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <div className="space-y-6">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                            {/* Back */}
                            <button
                                onClick={() =>
                                    typeof backTo === "string"
                                        ? navigate(backTo)
                                        : navigate(backTo)
                                }
                                className="mt-1 p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all duration-200 flex-shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>

                            {/* Icon + title */}
                            <div className="flex items-start space-x-4 min-w-0">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md flex-shrink-0">
                                    <Layers className="h-6 w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                                        {module.title}
                                    </h2>
                                    {module.description && (
                                        <p className="text-gray-500 mt-1 text-sm line-clamp-2">
                                            {module.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Config badge + button */}
                        <div className="flex items-center space-x-3 flex-shrink-0">
                            <span
                                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                    module.configuration?.isActive
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}
                            >
                                {module.configuration?.isActive ? (
                                    <Eye className="h-3 w-3" />
                                ) : (
                                    <EyeOff className="h-3 w-3" />
                                )}
                                <span>
                                    {module.configuration?.isActive ? "Activo" : "Inactivo"}
                                </span>
                            </span>

                            {courseId && (
                                <NavLink
                                    to={`/modules/${module.id}?course=${courseId}`}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white/60 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 transition-all duration-200"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Configuración</span>
                                </NavLink>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(
                        [
                            ["content", "Contenidos"],
                            ["forum", "Foros"],
                            ["task", "Tareas"],
                            ["activity", "Actividades"],
                        ] as [ModuleItemType, string][]
                    ).map(([type, label]) => {
                        const meta = ITEM_TYPE_META[type];
                        const count = countByType[type] ?? 0;
                        return (
                            <div
                                key={type}
                                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-5 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`p-2.5 bg-gradient-to-br ${meta.bg} rounded-lg flex-shrink-0`}
                                    >
                                        <span className="text-white">{meta.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                                        <p className="text-xl font-bold text-gray-900">{count}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contenidos del módulo */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            Ítems del módulo{" "}
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                {sortedItems.length}
                            </span>
                        </h3>

                        {courseId && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Agregar contenido</span>
                            </button>
                        )}
                    </div>

                    {sortedItems.length === 0 ? (
                        <div className="text-center py-14">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-5">
                                <Layers className="h-10 w-10 text-purple-500" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Este módulo no tiene contenidos
                            </h4>
                            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                Agrega contenidos, foros, tareas o actividades para estructurar el
                                aprendizaje de este módulo.
                            </p>
                            {courseId && (
                                <NavLink
                                    to={`/modules/${module.id}/items/add?course=${courseId}`}
                                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Agregar primer contenido</span>
                                </NavLink>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedItems.map((item, index) => {
                                const meta = ITEM_TYPE_META[item.type] ?? ITEM_TYPE_META.content;
                                const title = getItemTitle(item);
                                const subtitle = getItemSubtitle(item);

                                return (
                                    <div
                                        key={item.id}
                                        className="group flex items-center space-x-4 p-4 bg-white/60 border border-gray-200/80 rounded-xl hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
                                    >
                                        {/* Drag handle (visual only) */}
                                        <GripVertical className="h-5 w-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0 cursor-grab" />

                                        {/* Order badge */}
                                        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 text-xs font-bold flex-shrink-0">
                                            {index + 1}
                                        </span>

                                        {/* Type icon */}
                                        <div
                                            className={`p-2 bg-gradient-to-br ${meta.bg} rounded-lg flex-shrink-0`}
                                        >
                                            <span className="text-white">{meta.icon}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {title}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-0.5">
                                                <span
                                                    className={`text-xs font-medium ${meta.color}`}
                                                >
                                                    {meta.label}
                                                </span>
                                                {subtitle && (
                                                    <>
                                                        <span className="text-gray-300">·</span>
                                                        <span className="text-xs text-gray-400">
                                                            {subtitle}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <NavLink
                                                to={`/${item.type}s/${item.referenceId}?module=${module.id}&course=${courseId}`}
                                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                                title="Ver"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </NavLink>
                                            <button
                                                onClick={() => setItemToDelete(item)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                                title="Quitar del módulo"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Metadata footer */}
                <div className="flex items-center space-x-6 px-2 text-xs text-gray-400">
                    <span>
                        Orden:{" "}
                        <span className="font-medium text-gray-600">
                            {module.configuration?.order ?? "—"}
                        </span>
                    </span>
                    <span>
                        Aprobación mínima:{" "}
                        <span className="font-medium text-gray-600">
                            {module.configuration?.approvalPercentage ?? 80}%
                        </span>
                    </span>
                    <span>
                        ID:{" "}
                        <span className="font-mono text-gray-500">{module.id}</span>
                    </span>
                </div>
            </div>

            {showAddModal && (
                <AddItemModal
                    moduleId={module.id}
                    existingItems={sortedItems}
                    availableItems={availableItems}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {/* ── Confirm remove item modal ── */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isDeletingItem && setItemToDelete(null)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <Trash2 className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Quitar ítem del módulo
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Esta acción no elimina el contenido original
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de que deseas quitar{" "}
                            <span className="font-semibold">
                                "{getItemTitle(itemToDelete)}"
                            </span>{" "}
                            de este módulo?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setItemToDelete(null)}
                                disabled={isDeletingItem}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeletingItem}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                                {isDeletingItem ? "Quitando..." : "Quitar ítem"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}