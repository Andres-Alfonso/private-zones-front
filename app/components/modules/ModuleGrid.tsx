// components/modules/ModuleGrid.tsx
import { ModuleItem } from "../../api/types/modules";
import ModuleCard from "./ModuleCard";

interface ModuleGridProps {
  modules: ModuleItem[];
  viewMode: 'grid' | 'list';
  hasAdminRole: boolean;
  onEdit: (moduleId: string) => void;
  onDelete: (moduleId: string) => void;
}

export default function ModuleGrid({ 
  modules, 
  viewMode, 
  hasAdminRole, 
  onEdit, 
  onDelete 
}: ModuleGridProps) {
  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          viewMode={viewMode}
          hasAdminRole={hasAdminRole}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}