// app/routes/courses/make/$courseId/content/$contentId.tsx

import type { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useParams, useNavigation, useFetcher, useRevalidator } from "@remix-run/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    BookOpen, Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    ChevronLeft, ChevronRight, CheckCircle, Clock, FileText,
    Download, Bookmark, Share2, MessageSquare, ThumbsUp, Eye,
    RotateCcw, Settings, PauseCircle, PlayCircle, SkipForward,
    SkipBack, User, Calendar, Award, Target, ArrowLeft, ArrowRight, Check, ZoomOut, ZoomIn, ExternalLink,
    Image, Package
} from "lucide-react";
import AuthGuard from '~/components/AuthGuard';
import { useCurrentUser } from '~/context/AuthContext';
import { ContentAPI } from "~/api/endpoints/contents";
import { createApiClientFromRequest } from "~/api/client";
import { notifyProgressUpdate } from "~/utils/progressCommunication";

interface ContentData {
    id: string;
    title: string;
    description: string;
    content: {
        type: 'video' | 'image' | 'document' | 'embed' | 'scorm';
        contentUrl?: string;
        metadata?: {
            videoDuration: number;
            thumbnail: string;
        };
    };
    module: {
        id: string;
        title: string;
    };
    course: {
        id: string;
        title: string;
        colorTitle: string;
    };
    navigation: {
        previousItem?: {
            id: string;
            title: string;
            type: string;
            referenceId: string;
        };
        nextItem?: {
            id: string;
            title: string;
            type: string;
            referenceId: string;
        };
    };
    userProgress: {
        isCompleted: boolean;
        completionDate?: string;
        timeSpent: number;
        bookmarked: boolean;
        lastPosition?: number; // Para videos
    };
    metadata: {
        duration: number;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        tags: string[];
        createdAt: string;
        updatedAt: string;
    };
}

interface LoaderData {
    content: ContentData;
    error: string | null;
}

interface ActionData {
    success?: boolean;
    error?: string;
    action?: string;
}

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
    const content = data?.content;
    const title = content?.title || 'Contenido no encontrado';

    return [
        { title: `${title} - ${content?.course?.title || 'Curso'}` },
        { name: "description", content: content?.description || 'Contenido del curso' },
    ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const { courseId, contentId } = params;

    if (!contentId) {
        throw new Error('Content ID is required');
    }

    try {
        const authenticatedApiClient = createApiClientFromRequest(request);

        // 1. Obtener los datos base del contenido
        const content = await ContentAPI.getById(contentId, {
            includeCourse: true,
            includeModule: true,
            includeNavigation: true,
        }, true, authenticatedApiClient);

        // 2. Intentar resolver la URL firmada
        try {
            const signedRes = await authenticatedApiClient.get(`/v1/contents/${contentId}/signed-url`);
            
            // 🔥 MODIFICACIÓN CLAVE: 
            // Sobrescribimos la URL original con la URL firmada (privada) que nos da el backend
            if (signedRes.data && signedRes.data.url) {
                content.content.contentUrl = signedRes.data.url;
                // Opcional: puedes agregar un flag para que el frontend sepa que es privada
                content.content.isPrivate = signedRes.data.signed === true;
            }
        } catch (err) {
            // Si falla, no hacemos nada; se queda con la contentUrl original por defecto
            console.warn(`[contents/$id] Usando URL original por error en signed-url:`, err);
        }

        return json<LoaderData>({
            content: content,
            error: null
        });
        
    } catch (error: any) {
        console.error('Error loading content:', error);
        return json<LoaderData>({
            content: {} as ContentData,
            error: error.message || 'Error al cargar el contenido'
        });
    }
};

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const action = formData.get('_action') as string;
    const { courseId, contentId } = params;
    
    const authenticatedApiClient = createApiClientFromRequest(request);

    if (!contentId) {
        throw new Error('Course ID is required');
    }

    try {
        switch (action) {
            case 'complete':
                await ContentAPI.markComplete(contentId, authenticatedApiClient);
                return json<ActionData>({ success: true, action: 'complete' });

            case 'update-progress':
                const timeSpent = parseInt(formData.get('timeSpent') as string) || 10;
                const progressPercentageStr = formData.get('progressPercentage') as string;
                const progressPercentage = progressPercentageStr ? parseFloat(progressPercentageStr) : undefined;
                
                // 🟢 Pasar progressPercentage si está disponible
                const progressData: any = { timeSpent };
                if (progressPercentage !== undefined) {
                    progressData.progressPercentage = progressPercentage;
                }
                
                await ContentAPI.updateVideoProgress(contentId, progressData, authenticatedApiClient);
                return json<ActionData>({ success: true, action: 'update-progress' });

            default:
                throw new Error('Acción no válida');
        }
    } catch (error: any) {
        return json<ActionData>({
            error: error.message || 'Error al procesar la acción'
        });
    }
};

export default function ContentView() {
    return (
        <AuthGuard>
            <ContentViewContent />
        </AuthGuard>
    );
}

function useProgressTracker(contentId: string, courseId: string, initialProgress: any) {
    const [localProgress, setLocalProgress] = useState({
        isCompleted: initialProgress.isCompleted ?? false,
        timeSpent: initialProgress.timeSpent,
        progressPercentage: 0,
    });
    
    const fetcher = useFetcher();
    const revalidator = useRevalidator();
    const lastSyncRef = useRef(Date.now());
    
    const updateProgress = useCallback(async (update: any) => {
        // 1. Actualizar estado local
        setLocalProgress(prev => ({
            ...prev,
            timeSpent: prev.timeSpent + update.timeSpent,
            progressPercentage: update.progressPercentage ?? prev.progressPercentage,
            isCompleted: update.isCompleted ?? prev.isCompleted,
        }));
        
        // 2. Notificar al layout
        notifyProgressUpdate({
            itemId: contentId,
            overallProgress: update.progressPercentage,
            completedItems: update.isCompleted ? [contentId] : undefined,
            timeSpent: update.timeSpent,
            isCompleted: update.isCompleted
        });
        
        // 3. Enviar al servidor
        const formData = new FormData();
        formData.append('_action', 'update-progress');
        formData.append('timeSpent', update.timeSpent.toString());
        
        if (update.progressPercentage !== undefined) {
            formData.append('progressPercentage', update.progressPercentage.toString());
        }
        
        fetcher.submit(formData, { method: 'POST' });
        
        // 4. Revalidar ocasionalmente
        const now = Date.now();
        if (now - lastSyncRef.current > 30000) {
            revalidator.revalidate();
            lastSyncRef.current = now;
        }
    }, [contentId, courseId, fetcher, revalidator]);
    
    const markComplete = useCallback(async () => {
        setLocalProgress(prev => ({ ...prev, isCompleted: true, progressPercentage: 100 }));
        
        notifyProgressUpdate({
            itemId: contentId,
            completedItems: [contentId],
            overallProgress: 100,
            isCompleted: true
        });
        
        const formData = new FormData();
        formData.append('_action', 'complete');
        fetcher.submit(formData, { method: 'POST' });
        
        setTimeout(() => revalidator.revalidate(), 1000);
    }, [contentId, fetcher, revalidator]);
    
    return {
        progress: localProgress,
        updateProgress,
        markComplete,
        isUpdating: fetcher.state !== 'idle'
    };
}


function ContentViewContent() {
    const { content, error } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const params = useParams();
    const { user } = useCurrentUser();

    const { progress, updateProgress, markComplete, isUpdating } = useProgressTracker(
        content.id,
        content.course.id,
        content.userProgress
    );

    // Video player state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(content?.userProgress?.lastPosition || 0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Content state
    const [showTranscript, setShowTranscript] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const isSubmitting = navigation.state === 'submitting';

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !content) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        // Set initial position
        if (content.userProgress.lastPosition) {
            video.currentTime = content.userProgress.lastPosition;
        }

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [content]);

    // Auto-save progress every 10 seconds
    useEffect(() => {
        let secondsCounter = 0;
        
        const interval = setInterval(() => {
            const isContentActive = content.content.type === 'video' ? isPlaying : true;
            
            if (isContentActive && !progress.isCompleted) {
                secondsCounter++;
                
                if (secondsCounter >= 10) {
                    let progressPercentage: number | undefined;
                    
                    if (content.content.type === 'video') {
                        const video = videoRef.current;
                        if (video && video.duration > 0 && video.currentTime > 0) {
                            progressPercentage = (video.currentTime / video.duration) * 100;
                        }
                    } else {
                        progressPercentage = 100;
                    }
                    
                    // 🟢 CAMBIO AQUÍ: usar updateProgress en lugar de fetch
                    updateProgress({
                        timeSpent: 10,
                        progressPercentage,
                        isCompleted: progressPercentage === 100
                    });
                    
                    secondsCounter = 0;
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [content.content.type, isPlaying, progress.isCompleted, updateProgress]);

    if (error || !content) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 max-w-md mx-auto">
                        <FileText className="mx-auto h-16 w-16 text-red-400 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h1>
                        <p className="text-gray-600 mb-6">{error || 'No se pudo cargar el contenido'}</p>
                        <Link
                            to={`/make/courses/${params.courseId}`}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Volver al curso
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const [currentPage, setCurrentPage] = useState(1);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDocumentFullscreen, setIsDocumentFullscreen] = useState(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);

    // Handler para descargar archivos
    const handleDownload = async () => {
        try {
            if (!content.content.contentUrl) return;
            
            const response = await fetch(content.content.contentUrl);
            const blob = await response.blob();
            
            // Crear un enlace temporal para descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Determinar el nombre del archivo
            const fileName = content.title || 'download';
            const extension = content.content.contentUrl.split('.').pop() || '';
            link.download = `${fileName}.${extension}`;
            
            // Ejecutar descarga
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpiar URL temporal
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            // Fallback: abrir en nueva ventana
            window.open(content.content.contentUrl, '_blank');
        }
    };

    // Handler para pantalla completa de documentos
    const toggleDocumentFullscreen = () => {
        setIsDocumentFullscreen(!isDocumentFullscreen);
        
        if (!isDocumentFullscreen) {
            // Entrar en pantalla completa
            const element = document.querySelector('.document-container') as any;
            if (element) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }
        } else {
            // Salir de pantalla completa
            const doc = document as any;
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    };

    // Handler para pantalla completa de imágenes
    const toggleImageFullscreen = () => {
        setIsImageFullscreen(!isImageFullscreen);
        
        if (!isImageFullscreen) {
            // Entrar en pantalla completa
            const element = document.querySelector('.image-container') as any;
            if (element) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }
        } else {
            // Salir de pantalla completa
            const doc = document as any;
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    };

    // Listener para detectar cambios de pantalla completa
    useEffect(() => {
        const handleFullscreenChange = () => {
            const doc = document as any;
            const isCurrentlyFullscreen = !!(
                doc.fullscreenElement ||
                doc.webkitFullscreenElement ||
                doc.mozFullScreenElement ||
                doc.msFullscreenElement
            );
            
            if (!isCurrentlyFullscreen) {
                setIsDocumentFullscreen(false);
                setIsImageFullscreen(false);
            }
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = parseFloat(e.target.value);
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        if (!document.fullscreenElement) {
            video.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const skipTime = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    };

    const getFileExtension = (url: string): string => {
        try {
            const pathname = new URL(url).pathname; // extrae solo el path, sin ?X-AMZ-...
            return pathname.split('.').pop()?.toLowerCase() || '';
        } catch {
            return url.split('?')[0].split('.').pop()?.toLowerCase() || '';
        }
    };

    const isPdf = (url?: string): boolean => {
        if (!url) return false;
        return getFileExtension(url) === 'pdf';
    };

    const progressa = duration > 0 ? (currentTime / duration) * 100 : 0;
    const progressColor = content.course.colorTitle;

    return (
        <div className="min-h-screen bg-white">
            {/* Content Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                            <Link to={`/make/courses/${content.course.id}`} className="hover:text-blue-600 transition-colors">
                                {content.course.title}
                            </Link>
                            <span>/</span>
                            <span>{content.module.title}</span>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">{content.title}</span>
                        </nav>
                        <h1 className="text-2xl font-bold text-gray-900 truncate">
                            {content.title}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-3 ml-4">
                        {/* Action Messages */}
                        {actionData?.error && (
                            <div className="fixed top-4 right-4 z-50 bg-red-50/90 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-xl shadow-lg">
                                {actionData.error}
                            </div>
                        )}

                        {actionData?.success && (
                            <div className="fixed top-4 right-4 z-50 bg-green-50/90 backdrop-blur-sm border border-green-200/50 text-green-700 px-6 py-4 rounded-xl shadow-lg">
                                {actionData.action === 'complete' && 'Contenido marcado como completado'}
                                {actionData.action === 'bookmark' && 'Marcador actualizado'}
                                {actionData.action === 'update-progress' && 'Progreso guardado'}
                            </div>
                        )}

                        {!progress.isCompleted && (
                            <Form method="post" className="inline">
                                <input type="hidden" name="_action" value="complete" />
                                <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                <CheckCircle className="h-4 w-4" />
                                <span>Marcar como completado</span>
                                </button>
                            </Form>
                        )}

                        {/* <Form method="post" className="inline">
                            <input type="hidden" name="_action" value="bookmark" />
                            <button
                                type="submit"
                                className={`p-3 rounded-xl border transition-all duration-200 transform hover:scale-105 ${content.userProgress.bookmarked
                                    ? 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                title="Marcar como favorito"
                            >
                                <Bookmark className="h-5 w-5" />
                            </button>
                        </Form> */}

                        {/* <button className="p-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
                            <Share2 className="h-5 w-5" />
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Video/Content Player */}
                        <div className="lg:col-span-2">
                            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                                {content.content.type === 'video' && (
                                    <>
                                        <video
                                            ref={videoRef}
                                            className="w-full aspect-video"
                                            poster={content.content.metadata?.thumbnail}
                                            controls={false}
                                            onLoadedMetadata={() => {
                                                if (videoRef.current) {
                                                    setDuration(videoRef.current.duration);
                                                    // Restore last position if available
                                                    if (content.userProgress.lastPosition) {
                                                        videoRef.current.currentTime = content.userProgress.lastPosition;
                                                    }
                                                }
                                            }}
                                        >
                                            <source src={content.content.contentUrl} type="video/mp4" />
                                            Tu navegador no soporta el elemento video.
                                        </video>

                                        {/* Custom Video Controls */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-200 group-hover:opacity-100 opacity-0">
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={duration || 0}
                                                    value={currentTime}
                                                    onChange={handleSeek}
                                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                                    style={{
                                                        background: `linear-gradient(to right, ${progressColor} 0%, ${progressColor} ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                                                    }}
                                                />
                                                <div className="flex justify-between text-xs text-white mt-1">
                                                    <span>{formatTime(currentTime)}</span>
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => skipTime(-10)}
                                                        className="text-white hover:text-blue-400 transition-colors p-1"
                                                    >
                                                        <SkipBack className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        onClick={togglePlay}
                                                        className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                                    >
                                                        {isPlaying ?
                                                            <Pause className="h-6 w-6" /> :
                                                            <Play className="h-6 w-6 ml-1" />
                                                        }
                                                    </button>

                                                    <button
                                                        onClick={() => skipTime(10)}
                                                        className="text-white hover:text-blue-400 transition-colors p-1"
                                                    >
                                                        <SkipForward className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    {/* Volume Control */}
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                                                            {isMuted || volume === 0 ?
                                                                <VolumeX className="h-5 w-5" /> :
                                                                <Volume2 className="h-5 w-5" />
                                                            }
                                                        </button>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.1"
                                                            value={volume}
                                                            onChange={handleVolumeChange}
                                                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Speed Control */}
                                                    <select
                                                        value={playbackSpeed}
                                                        onChange={(e) => {
                                                            const speed = parseFloat(e.target.value);
                                                            setPlaybackSpeed(speed);
                                                            if (videoRef.current) {
                                                                videoRef.current.playbackRate = speed;
                                                            }
                                                        }}
                                                        className="bg-white/20 backdrop-blur-sm text-white border-none rounded px-2 py-1 text-sm"
                                                    >
                                                        <option value="0.5">0.5x</option>
                                                        <option value="0.75">0.75x</option>
                                                        <option value="1">1x</option>
                                                        <option value="1.25">1.25x</option>
                                                        <option value="1.5">1.5x</option>
                                                        <option value="2">2x</option>
                                                    </select>

                                                    <button
                                                        onClick={toggleFullscreen}
                                                        className="text-white hover:text-blue-400 transition-colors p-1"
                                                    >
                                                        {isFullscreen ?
                                                            <Minimize className="h-5 w-5" /> :
                                                            <Maximize className="h-5 w-5" />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Play button overlay when paused */}
                                        {!isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button
                                                    onClick={togglePlay}
                                                    className="bg-white/20 backdrop-blur-sm rounded-full p-6 text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110 shadow-2xl"
                                                >
                                                    <Play className="h-12 w-12 ml-1" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Video Progress Indicator */}
                                        {progress.isCompleted && (
                                            <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </>
                                )}

                                {content.content.type === 'image' && (
                                    <>
                                        <div className="w-full aspect-video bg-gray-900 flex items-center justify-center relative">
                                            <img
                                                src={content.content.contentUrl}
                                                alt={content.title}
                                                className="max-w-full max-h-full object-contain"
                                                style={{ transform: `scale(${zoomLevel})` }}
                                            />
                                        </div>

                                        {/* Image Controls */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-200 group-hover:opacity-100 opacity-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => setZoomLevel(Math.max(0.25, zoomLevel - 0.25))}
                                                        className="text-white hover:text-blue-400 transition-colors p-1"
                                                        title="Zoom Out"
                                                    >
                                                        <ZoomOut className="h-5 w-5" />
                                                    </button>

                                                    <span className="text-white text-sm min-w-[60px] text-center">
                                                        {Math.round(zoomLevel * 100)}%
                                                    </span>

                                                    <button
                                                        onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.25))}
                                                        className="text-white hover:text-blue-400 transition-colors p-1"
                                                        title="Zoom In"
                                                    >
                                                        <ZoomIn className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        onClick={() => setZoomLevel(1)}
                                                        className="text-white hover:text-blue-400 transition-colors px-2 py-1 text-sm"
                                                        title="Reset Zoom"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={handleDownload}
                                                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                                        title="Descargar imagen"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        onClick={toggleImageFullscreen}
                                                        className="text-white hover:text-blue-400 transition-colors p-1"
                                                    >
                                                        {isImageFullscreen ?
                                                            <Minimize className="h-5 w-5" /> :
                                                            <Maximize className="h-5 w-5" />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Completion Indicator */}
                                        {progress.isCompleted && (
                                            <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </>
                                )}

                                
                                {content.content.type === 'document' && (
                                <>
                                    <div className="w-full aspect-[4/3] bg-gray-900 flex items-center justify-center relative">
                                        {isPdf(content.content.contentUrl) ? (
                                            <iframe
                                            src={`${content.content.contentUrl}#toolbar=0&navpanes=0`}
                                            className="w-full h-full"
                                            title={content.title}
                                            />
                                        ) : (
                                            <div className="text-center text-white p-8">
                                                <FileText className="h-20 w-20 mx-auto mb-4 text-gray-400" />
                                                <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                                                <p className="text-sm text-gray-400 mb-4">
                                                    {/* ✅ extensión sin los query params de la firma */}
                                                    {getFileExtension(content.content.contentUrl).toUpperCase()} Document
                                                </p>
                                                <a
                                                    href={content.content.contentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    Abrir documento
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Document Controls */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-200 group-hover:opacity-100 opacity-0">
                                    
                                    {/* Page Navigation (for PDFs) */}
                                    {/* {isPdf(content.content.contentUrl) && (
                                        <div className="mb-4">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage <= 1}
                                            className="text-white hover:text-blue-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                            <ChevronLeft className="h-5 w-5" />
                                            </button>

                                            <span className="text-white text-sm">
                                            Página {currentPage}
                                            </span>

                                            <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            className="text-white hover:text-blue-400 transition-colors p-1"
                                            >
                                            <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                        </div>
                                    )} */}

                                    {/* Controls */}
                                    {/* <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                        {isPdf(content.content.contentUrl) && (
                                            <>
                                            <button
                                                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                                                className="text-white hover:text-blue-400 transition-colors p-1"
                                                title="Zoom Out"
                                            >
                                                <ZoomOut className="h-5 w-5" />
                                            </button>

                                            <span className="text-white text-sm min-w-[60px] text-center">
                                                {Math.round(zoomLevel * 100)}%
                                            </span>

                                            <button
                                                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                                                className="text-white hover:text-blue-400 transition-colors p-1"
                                                title="Zoom In"
                                            >
                                                <ZoomIn className="h-5 w-5" />
                                            </button>
                                            </>
                                        )}
                                        </div>

                                        <div className="flex items-center space-x-3">
                                        <button
                                            onClick={handleDownload}
                                            className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                            title="Descargar documento"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>

                                        {isPdf(content.content.contentUrl) && (
                                            <button
                                            onClick={toggleDocumentFullscreen}
                                            className="text-white hover:text-blue-400 transition-colors p-1"
                                            >
                                            {isDocumentFullscreen
                                                ? <Minimize className="h-5 w-5" />
                                                : <Maximize className="h-5 w-5" />
                                            }
                                            </button>
                                        )}
                                        </div>
                                    </div> */}
                                    </div>

                                    {/* Completion Indicator */}
                                    {progress.isCompleted && (
                                    <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                    )}
                                </>
                                )}

                                {content.content.type === 'embed' && (
                                    <>
                                        <div className="w-full aspect-video bg-gray-900 relative">
                                            <iframe
                                                src={content.content.contentUrl}
                                                className="w-full h-full"
                                                title={content.title}
                                                allowFullScreen
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        </div>

                                        {/* Embed Controls */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-200 group-hover:opacity-100 opacity-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-white text-sm">Contenido externo</span>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <a
                                                        href={content.content.contentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                                        title="Abrir en nueva ventana"
                                                    >
                                                        <ExternalLink className="h-5 w-5" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Completion Indicator */}
                                        {progress.isCompleted && (
                                            <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </>
                                )}

                                {content.content.type === 'scorm' && (
                                    <>
                                        <div className="w-full aspect-video bg-gray-900 relative">
                                            <iframe
                                                src={content.content.contentUrl}
                                                className="w-full h-full"
                                                title={content.title}
                                                allowFullScreen
                                                frameBorder="0"
                                            />
                                        </div>

                                        {/* SCORM Controls */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-200 group-hover:opacity-100 opacity-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-white text-sm">SCORM Package</span>
                                                    {progress.timeSpent > 0 && (
                                                        <span className="text-gray-300 text-sm">
                                                            Tiempo: {formatTime(progress.timeSpent)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Completion Indicator */}
                                        {progress.isCompleted && (
                                            <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Content Info Overlay */}
                                {/* <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="flex items-center space-x-2">
                                        {content.content.type === 'video' && <Play className="h-4 w-4" />}
                                        {content.content.type === 'image' && <Image className="h-4 w-4" />}
                                        {content.content.type === 'document' && <FileText className="h-4 w-4" />}
                                        {content.content.type === 'embed' && <ExternalLink className="h-4 w-4" />}
                                        {content.content.type === 'scorm' && <Package className="h-4 w-4" />}
                                        <span>{content.title}</span>
                                    </div>
                                    {content.metadata.duration > 0 && (
                                        <div className="text-xs text-gray-300 mt-1">
                                            Duración: {formatTime(content.metadata.duration)}
                                        </div>
                                    )}
                                </div> */}

                                {/* Bookmark Indicator */}
                                {content.userProgress.bookmarked && (
                                    <div className="absolute top-4 right-16 bg-yellow-500 rounded-full p-2">
                                        <Bookmark className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Content Description and Text */}
                            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">Descripción</h2>
                                        <p className="text-gray-600 leading-relaxed">{content.description}</p>
                                    </div>

                                    {/* <div className="flex flex-wrap gap-2 ml-4">
                                        {content.metadata.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div> */}
                                </div>

                                {/* Module Navigation */}
                                <div className="backdrop-blur-sm mt-6">
                                    <div className="flex justify-between space-x-4">
                                        {/* Previous Item (Izquierda) */}
                                        {content.navigation.previousItem ? (
                                            <div className="flex-1">
                                                <Link
                                                    to={`/make/courses/${content.course.id}/${content.navigation.previousItem.type}/${content.navigation.previousItem.referenceId}#main-content`}
                                                    className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group w-full"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                        <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Anterior</div>
                                                        <div className="font-medium text-gray-900 text-sm truncate">{content.navigation.previousItem.title}</div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="flex-1" />
                                        )}

                                        {/* Next Item (Derecha) */}
                                        {content.navigation.nextItem ? (
                                            <div className="flex-1 text-right">
                                                <Link
                                                    to={`/make/courses/${content.course.id}/${content.navigation.nextItem.type}/${content.navigation.nextItem.referenceId}#main-content`}
                                                    className="flex items-center justify-end space-x-3 p-3 rounded-xl bg-green-50/60 border border-green-200/50 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200 group w-full"
                                                >
                                                    <div className="flex-1 min-w-0 text-right">
                                                        <div className="text-xs text-green-500 uppercase tracking-wide">Siguiente</div>
                                                        <div className="font-medium text-green-900 text-sm truncate">{content.navigation.nextItem.title}</div>
                                                    </div>
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-colors">
                                                        <ArrowRight className="h-4 w-4 text-green-600 group-hover:text-green-600" />
                                                    </div>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="flex-1" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-6">
                                {/* Progress Card */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Tu Progreso</h3>

                                    <div className="space-y-4">
                                        {/* Solo mostrar barra de progreso para videos */}
                                        {content.content.type === 'video' && (
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Video completado</span>
                                                    <span className="font-semibold">{Math.round(progress.progressPercentage)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${progress}%`,
                                                            background: `linear-gradient(to right, ${progressColor}, ${progressColor})`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="text-center p-3 bg-blue-50/60 rounded-xl">
                                                <div className="font-semibold text-blue-900">{formatTime(progress.timeSpent)}</div>
                                                <div className="text-blue-600">Tiempo invertido</div>
                                            </div>
                                            {content.content.type === 'video' ? (
                                                <div className="text-center p-3 bg-green-50/60 rounded-xl">
                                                    <div className="font-semibold text-green-900">{formatTime(duration)}</div>
                                                    <div className="text-green-600">Duración total</div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-3 bg-gray-50/60 rounded-xl">
                                                    <div className="font-semibold text-gray-900">
                                                        {content.content.type === 'image' && 'Imagen'}
                                                        {content.content.type === 'document' && 'Documento'}
                                                        {content.content.type === 'embed' && 'Contenido'}
                                                        {content.content.type === 'scorm' && 'SCORM'}
                                                    </div>
                                                    <div className="text-gray-600">Tipo contenido</div>
                                                </div>
                                            )}
                                        </div>

                                        {progress.isCompleted && (
                                            <div className="flex items-center space-x-2 p-3 bg-green-50/80 rounded-xl">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">Completado</span>
                                                {content.userProgress.completionDate && (
                                                    <span className="text-xs text-green-600">
                                                        el {new Date(content.userProgress.completionDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: ${progressColor};
          border-radius: 50%;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: ${progressColor};
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }
        
        .prose h1, .prose h2, .prose h3 {
          color: ${progressColor};
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .prose p {
          margin-bottom: 1rem;
        }
        
        .prose code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .prose pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
      `}</style>
        </div>
    );
}