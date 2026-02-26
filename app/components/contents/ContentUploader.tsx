// app/components/contents/ContentUploader.tsx
import { useState, useRef, useCallback } from "react";
import { Upload, Link as LinkIcon, AlertCircle, File, X, Loader2 } from "lucide-react";

interface ContentUploaderProps {
  contentType: string;
  contentUrl: string;
  courseId: string;
  selectedFile?: File | null;
  uploadedUrl?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  onUploadComplete: (url: string, key: string) => void;
  onUploadStart?: () => void;
  error?: string;
}

export const ContentUploader = ({
  contentType,
  contentUrl,
  courseId,
  selectedFile,
  uploadedUrl,
  isUploading = false,
  uploadProgress = 0,
  onUrlChange,
  onFileChange,
  onUploadComplete,
  onUploadStart,
  error,
}: ContentUploaderProps) => {
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>(
    contentType === 'scorm' ? 'file' : 'url'
  );
  const [dragActive, setDragActive] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [localUploading, setLocalUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInstructions = () => {
    switch (contentType) {
      case 'video':
        return {
          title: 'Subir Video',
          description: 'MP4, WebM, MOV (máx. 500MB)',
          placeholder: 'https://youtube.com/watch?v=...',
          accept: 'video/mp4,video/webm,video/quicktime',
        };
      case 'document':
        return {
          title: 'Subir Documento',
          description: 'PDF, DOC, DOCX, PPT, PPTX (máx. 50MB)',
          placeholder: 'https://ejemplo.com/documento.pdf',
          accept: '.pdf,.doc,.docx,.ppt,.pptx',
        };
      case 'image':
        return {
          title: 'Subir Imagen',
          description: 'JPG, PNG, GIF, SVG, WEBP (máx. 10MB)',
          placeholder: 'https://ejemplo.com/imagen.jpg',
          accept: 'image/*',
        };
      case 'embed':
        return {
          title: 'Contenido Embebido',
          description: 'YouTube, Vimeo, CodePen, etc.',
          placeholder: 'https://youtube.com/embed/...',
          accept: '',
        };
      case 'scorm':
        return {
          title: 'Paquete SCORM',
          description: 'ZIP con estructura SCORM (máx. 100MB)',
          placeholder: '',
          accept: '.zip,application/zip',
        };
      default:
        return { title: '', description: '', placeholder: '', accept: '' };
    }
  };

  const instructions = getInstructions();

  // ── Upload via proxy de Remix (maneja auth automáticamente) ──
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);
    onFileChange(file);
    onUploadStart?.();
    setLocalUploading(true);
    setLocalProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', contentType);
      formData.append('courseId', courseId);

      const result = await new Promise<{ url: string; key: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progreso real hasta el servidor de Remix
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setLocalProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ url: data.data.url, key: data.data.key });
            } catch {
              reject(new Error('Respuesta inválida del servidor'));
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

        xhr.addEventListener('error', () =>
          reject(new Error('Error de red. Verifica tu conexión.'))
        );
        xhr.addEventListener('timeout', () =>
          reject(new Error('El archivo tardó demasiado. Intenta con un archivo más pequeño.'))
        );

        // Timeout según tipo: videos 10min, resto 3min
        xhr.timeout = contentType === 'video'
          ? 10 * 60 * 1000
          : 3 * 60 * 1000;

        // ✅ Apunta al proxy de Remix — mismo origen, sin CORS, sin token manual
        // El proxy reenvía al NestJS usando createApiClientFromRequest
        xhr.open('POST', '/api/contents/upload');

        // No necesitas setear Authorization — las cookies se envían automáticamente
        // porque es el mismo origen (Remix maneja el token server-side)
        xhr.send(formData);
      });

      onUploadComplete(result.url, result.key);

    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Error al subir el archivo');
      onFileChange(null);
      setLocalUploading(false);
      setLocalProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setLocalUploading(false);
      setLocalProgress(0);
    }
  }, [contentType, courseId, onFileChange, onUploadComplete, onUploadStart]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const actuallyUploading = isUploading || localUploading;
  const actualProgress = localProgress || uploadProgress;
  const displayError = uploadError || error;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{instructions.title}</h3>
        <p className="text-gray-500 text-xs">{instructions.description}</p>
      </div>

      {/* Toggle URL / Archivo */}
      {contentType !== 'embed' && contentType !== 'scorm' && (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setUploadMode('url');
              setUploadError(null);
              onFileChange(null);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === 'url'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" /> URL
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadMode('file');
              setUploadError(null);
              onUrlChange('');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === 'file'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5" /> Subir archivo
          </button>
        </div>
      )}

      {/* Campo URL */}
      {(uploadMode === 'url' || contentType === 'embed') && contentType !== 'scorm' && (
        <input
          type="url"
          value={contentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={instructions.placeholder}
          className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            displayError ? 'border-red-300' : 'border-gray-200'
          }`}
        />
      )}

      {/* Zona de carga de archivo */}
      {(uploadMode === 'file' || contentType === 'scorm') && contentType !== 'embed' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={instructions.accept}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
            className="hidden"
          />

          {/* Estado: subiendo */}
          {actuallyUploading && (
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-blue-700">
                  Subiendo {selectedFile?.name}...
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${actualProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1 text-right">{actualProgress}%</p>
            </div>
          )}

          {/* Estado: archivo subido con éxito */}
          {!actuallyUploading && uploadedUrl && selectedFile && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <File className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      {formatFileSize(selectedFile.size)} · Subido ✓
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onFileChange(null);
                    onUploadComplete('', '');
                    setUploadError(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Estado: sin archivo (o error) */}
          {!actuallyUploading && !uploadedUrl && (
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : displayError
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <Upload
                className={`mx-auto h-10 w-10 mb-3 ${
                  dragActive ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
              <p className="text-sm font-medium text-gray-600 mb-1">
                {dragActive ? 'Suelta aquí' : 'Arrastra tu archivo o'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Seleccionar archivo
              </button>
              <p className="text-xs text-gray-400 mt-3">{instructions.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Error (del upload o del padre) */}
      {displayError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Ups, ocurrió un error</span>
        </div>
      )}
    </div>
  );
};