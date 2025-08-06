// app/routes/courses/make/$courseId/content/$contentId.tsx

import type { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useParams, useNavigation } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import {
    BookOpen, Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    ChevronLeft, ChevronRight, CheckCircle, Clock, FileText,
    Download, Bookmark, Share2, MessageSquare, ThumbsUp, Eye,
    RotateCcw, Settings, PauseCircle, PlayCircle, SkipForward,
    SkipBack, User, Calendar, Award, Target, ArrowLeft, ArrowRight
} from "lucide-react";
import AuthGuard from '~/components/AuthGuard';
import { useCurrentUser } from '~/context/AuthContext';

interface ContentData {
    id: string;
    title: string;
    description: string;
    content: {
        type: 'video' | 'text' | 'html' | 'pdf' | 'interactive';
        videoUrl?: string;
        videoThumbnail?: string;
        videoDuration?: number;
        textContent?: string;
        htmlContent?: string;
        pdfUrl?: string;
        interactiveUrl?: string;
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

    try {
        // 🔄 API CALLS - Reemplazar con llamadas reales
        // const content = await ContentAPI.getById(contentId, {
        //   includeCourse: true,
        //   includeModule: true,
        //   includeNavigation: true,
        //   userId: userId
        // });

        // Datos mockeados para demostración
        const mockContent: ContentData = {
            id: contentId || 'content_3',
            title: 'Formularios HTML: Elementos Interactivos',
            description: 'Aprende a crear formularios web interactivos utilizando HTML5. Descubre los diferentes tipos de inputs, validación de datos y mejores prácticas para la experiencia del usuario.',
            content: {
                type: 'video',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                videoThumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
                videoDuration: 1440, // 24 minutes in seconds
                textContent: `
# Formularios HTML: Elementos Interactivos

Los formularios son uno de los elementos más importantes en el desarrollo web, ya que permiten la interacción entre los usuarios y nuestras aplicaciones.

## Elementos básicos de formularios

### Input Types
- **text**: Para texto simple
- **email**: Para direcciones de correo
- **password**: Para contraseñas
- **number**: Para números
- **date**: Para fechas

### Ejemplo práctico

\`\`\`html
<form action="/submit" method="POST">
  <div>
    <label for="name">Nombre:</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div>
    <label for="password">Contraseña:</label>
    <input type="password" id="password" name="password" required>
  </div>
  
  <button type="submit">Enviar</button>
</form>
\`\`\`

## Validación de formularios

La validación es crucial para garantizar que los datos enviados sean correctos y seguros.

### Validación HTML5
HTML5 proporciona atributos de validación integrados:
- \`required\`: Campo obligatorio
- \`pattern\`: Expresión regular
- \`min/max\`: Valores mínimos y máximos
- \`minlength/maxlength\`: Longitud de texto

### Mejores prácticas
1. Siempre validar en el servidor
2. Proporcionar feedback visual claro
3. Usar labels descriptivos
4. Agrupar campos relacionados
5. Implementar validación progresiva

## Ejemplos interactivos

A continuación veremos diferentes tipos de formularios y cómo implementarlos correctamente.
        `
            },
            module: {
                id: '1',
                title: 'Fundamentos de HTML'
            },
            course: {
                id: courseId || '1',
                title: 'Introducción al Desarrollo Web Moderno',
                colorTitle: '#2563eb'
            },
            navigation: {
                previousItem: {
                    id: '2',
                    title: 'Etiquetas y elementos HTML',
                    type: 'content',
                    referenceId: 'content_2'
                },
                nextItem: {
                    id: '4',
                    title: 'Evaluación HTML Básico',
                    type: 'quiz',
                    referenceId: 'quiz_1'
                }
            },
            userProgress: {
                isCompleted: false,
                timeSpent: 420, // 7 minutes
                bookmarked: false,
                lastPosition: 180 // 3 minutes into video
            },
            metadata: {
                duration: 1440, // 24 minutes
                difficulty: 'beginner',
                tags: ['HTML', 'Formularios', 'Validación', 'Interactividad'],
                createdAt: '2024-01-15T00:00:00Z',
                updatedAt: '2024-03-10T00:00:00Z'
            }
        };

        return json<LoaderData>({
            content: mockContent,
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

    try {
        switch (action) {
            case 'complete':
                // 🔄 API CALL: await ContentAPI.markComplete(contentId, userId);
                return json<ActionData>({ success: true, action: 'complete' });

            case 'bookmark':
                // 🔄 API CALL: await ContentAPI.toggleBookmark(contentId, userId);
                return json<ActionData>({ success: true, action: 'bookmark' });

            case 'update-progress':
                const position = parseInt(formData.get('position') as string);
                // 🔄 API CALL: await ContentAPI.updateVideoProgress(contentId, userId, position);
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

function ContentViewContent() {
    const { content, error } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const params = useParams();
    const { user } = useCurrentUser();

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
        const interval = setInterval(() => {
            if (currentTime > 0 && Math.floor(currentTime) % 10 === 0) {
                // Save progress silently
                const formData = new FormData();
                formData.append('_action', 'update-progress');
                formData.append('position', Math.floor(currentTime).toString());
                fetch('', { method: 'POST', body: formData });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentTime]);

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

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
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

                        {/* {!content.userProgress.isCompleted && (
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
            )} */}

                        <Form method="post" className="inline">
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
                        </Form>

                        <button className="p-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
                            <Share2 className="h-5 w-5" />
                        </button>
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
                                            poster={content.content.videoThumbnail}
                                            controls={false}
                                        >
                                            <source src={content.content.videoUrl} type="video/mp4" />
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
                                    </>
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
                                                    to={`/make/courses/${content.course.id}/${content.navigation.previousItem.type}/${content.navigation.previousItem.referenceId}`}
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
                                                    to={`/make/courses/${content.course.id}/${content.navigation.nextItem.type}/${content.navigation.nextItem.referenceId}`}
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


                                {/* Text Content */}
                                {/* {content.content.textContent && (
                                    <div className="mt-6 prose max-w-none">
                                        <div
                                            className="text-gray-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: content.content.textContent
                                                    .replace(/\n/g, '<br/>')
                                                    .replace(/```html([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
                                                    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>')
                                                    .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
                                                    .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
                                                    .replace(/# (.*)/g, '<h1 class="text-2xl font-bold mt-10 mb-6">$1</h1>')
                                            }}
                                        />
                                    </div>
                                )} */}
                            </div>
                        </div>

                        {/* Sidebar */}
                        {/* <div className="lg:col-span-1"> */}
                            {/* <div className="sticky top-6 space-y-6"> */}
                                {/* Progress Card */}
                                {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Tu Progreso</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Video completado</span>
                                                <span className="font-semibold">{Math.round(progress)}%</span>
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

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="text-center p-3 bg-blue-50/60 rounded-xl">
                                                <div className="font-semibold text-blue-900">{formatTime(content.userProgress.timeSpent)}</div>
                                                <div className="text-blue-600">Tiempo invertido</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50/60 rounded-xl">
                                                <div className="font-semibold text-green-900">{formatTime(duration)}</div>
                                                <div className="text-green-600">Duración total</div>
                                            </div>
                                        </div>

                                        {content.userProgress.isCompleted && (
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
                                </div> */}

                                {/* Module Navigation */}
                                {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mt-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Navegación</h3>

                                    <div className="space-y-3">
                                        {content.navigation.previousItem && (
                                            <Link
                                                to={`/make/courses/${content.course.id}/${content.navigation.previousItem.type}/${content.navigation.previousItem.referenceId}`}
                                                className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group"
                                            >
                                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                    <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Anterior</div>
                                                    <div className="font-medium text-gray-900 text-sm truncate">{content.navigation.previousItem.title}</div>
                                                </div>
                                            </Link>
                                        )}

                                        {content.navigation.nextItem && (
                                            <Link
                                                to={`/make/courses/${content.course.id}/${content.navigation.nextItem.type}/${content.navigation.nextItem.referenceId}`}
                                                className="flex items-center space-x-3 p-3 rounded-xl bg-green-50/60 border border-green-200/50 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200 group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-green-500 uppercase tracking-wide">Siguiente</div>
                                                    <div className="font-medium text-green-900 text-sm truncate">{content.navigation.nextItem.title}</div>
                                                </div>
                                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-colors">
                                                    <ArrowRight className="h-4 w-4 text-green-600 group-hover:text-green-600" />
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                </div> */}

                                {/* Content Metadata */}
                                {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Información</h3>
                                    
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                        <span className="text-gray-600">Dificultad:</span>
                                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                                            content.metadata.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                            content.metadata.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {content.metadata.difficulty === 'beginner' ? 'Principiante' :
                                            content.metadata.difficulty === 'intermediate' ? 'Intermedio' :
                                            'Avanzado'}
                                        </span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                        <span className="text-gray-600">Duración:</span>
                                        <span className="font-medium">{formatTime(content.metadata.duration)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                        <span className="text-gray-600">Actualizado:</span>
                                        <span className="font-medium">
                                            {new Date(content.metadata.updatedAt).toLocaleDateString()}
                                        </span>
                                        </div>
                                    </div>
                                </div> */}
                            {/* </div> */}
                        {/* </div> */}
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