// app/components/forums/ThumbnailUploader.tsx
import { Image, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { useState, useRef, useCallback } from "react";

interface ThumbnailUploaderProps {
  thumbnailUrl: string;
  selectedFile: File | null;
  tempKey?: string | null;
  previewUrl?: string | null;
  isUploading?: boolean;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  onUploadComplete: (tempKey: string, tempUrl: string) => void;
  onClear: () => void;
  error?: string;
}

export function ThumbnailUploader({
  thumbnailUrl,
  selectedFile,
  tempKey,
  previewUrl,
  isUploading = false,
  onUrlChange,
  onFileChange,
  onUploadComplete,
  onClear,
  error,
}: ThumbnailUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [localUploading, setLocalUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!ALLOWED.includes(file.type)) {
      setUploadError("Solo se aceptan imágenes (JPG, PNG, GIF, WEBP, SVG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("La imagen no puede superar los 10 MB.");
      return;
    }

    setUploadError(null);
    onFileChange(file);
    setLocalUploading(true);
    setLocalProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await new Promise<{ tempKey: string; tempUrl: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) setLocalProgress(Math.round((e.loaded / e.total) * 100));
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve({ tempKey: data.data.tempKey, tempUrl: data.data.tempUrl });
              } catch {
                reject(new Error("Respuesta inválida del servidor"));
              }
            } else {
              try {
                const err = JSON.parse(xhr.responseText);
                reject(new Error(err.error || err.message || `Error ${xhr.status}`));
              } catch {
                reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
              }
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Error de red.")));
          xhr.addEventListener("timeout", () => reject(new Error("Tiempo de espera agotado.")));
          xhr.timeout = 3 * 60 * 1000;
          xhr.open("POST", "/api/forums/upload-thumbnail");
          xhr.send(formData);
        }
      );

      onUploadComplete(result.tempKey, result.tempUrl);
    } catch (err: any) {
      setUploadError(err.message || "Error al subir la imagen");
      onFileChange(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setLocalUploading(false);
      setLocalProgress(0);
    }
  }, [onFileChange, onUploadComplete]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const actuallyUploading = isUploading || localUploading;
  const displayError = uploadError || error;
  const hasUploadedFile = !!tempKey && !!selectedFile && !actuallyUploading;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Image className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Imagen de Portada</h2>
          <p className="text-sm text-gray-600">Agrega una imagen para el foro (opcional)</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Subiendo */}
        {actuallyUploading && (
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              <span className="text-sm font-medium text-blue-700">Subiendo {selectedFile?.name}...</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${localProgress}%` }} />
            </div>
            <p className="text-xs text-blue-600 mt-1 text-right">{localProgress}%</p>
          </div>
        )}

        {/* Preview: archivo subido a temp */}
        {!actuallyUploading && hasUploadedFile && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-green-300">
            {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
            <div className="absolute bottom-0 inset-x-0 bg-green-500/90 text-white text-xs px-3 py-1.5 flex items-center">
              ✓ {selectedFile.name} · {formatFileSize(selectedFile.size)} · listo para guardar
            </div>
            <button
              type="button"
              onClick={() => { onClear(); setUploadError(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Preview: URL manual */}
        {!actuallyUploading && !hasUploadedFile && thumbnailUrl && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { onUrlChange(""); setUploadError(null); }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Drop zone */}
        {!actuallyUploading && !hasUploadedFile && !thumbnailUrl && (
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive ? "border-purple-500 bg-purple-50"
              : displayError ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-purple-400"
            }`}
          >
            <input
              ref={fileInputRef} id="thumbnail-file" type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <label htmlFor="thumbnail-file" className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium">
                  Haz clic para subir
                </label>
                <span className="text-gray-600"> o arrastra una imagen aquí</span>
              </div>
              <p className="text-sm text-gray-500">PNG, JPG, GIF, WEBP hasta 10 MB</p>
            </div>
          </div>
        )}

        {/* URL alternativa — solo si no hay archivo en temp */}
        {!tempKey && !actuallyUploading && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o proporciona una URL</span>
              </div>
            </div>
            <input
              type="url" value={thumbnailUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={!!selectedFile}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                selectedFile ? "bg-gray-100 cursor-not-allowed" : ""
              } ${displayError ? "border-red-300" : "border-gray-300"}`}
            />
          </>
        )}

        {displayError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}
      </div>
    </div>
  );
}