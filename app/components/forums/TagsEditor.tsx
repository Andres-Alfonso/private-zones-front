// app/components/forums/TagsEditor.tsx

import { Tag, X, Plus } from "lucide-react";
import { useState } from "react";

interface TagsEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagsEditor({ tags, onTagsChange }: TagsEditorProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Tag className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Etiquetas</h2>
          <p className="text-sm text-gray-600">Agrega etiquetas para categorizar el foro</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input para agregar tags */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una etiqueta..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Lista de tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tags.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No has agregado etiquetas aún
          </p>
        )}
      </div>
    </div>
  );
}