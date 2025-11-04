export interface ViewSettings {
    type?: string;
    customBackground?: boolean;
    backgroundType?: 'imagen' | 'color';
    backgroundImage?: string;
    backgroundColor?: string;
    backgroundImageFile?: File;
    additionalSettings?: Record<string, any>;
}

export interface ViewCustomizerProps {
    title: string;
    description?: string;
    onChange: (field: string, value: string | boolean | File) => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    initialCustomBackground?: boolean;
    initialBackgroundType?: 'imagen' | 'color';
    initialBackgroundImage?: string;
    initialBackgroundColor?: string;
    settings?: ViewSettings;
}

export interface SpecificViewCustomizerProps {
    onChange: (field: string, value: string | boolean | File) => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    initialCustomBackground?: boolean;
    initialBackgroundType?: 'imagen' | 'color';
    initialBackgroundImage?: string;
    initialBackgroundColor?: string;
    settings?: ViewSettings;
}

// Estructura de additionalSettings para cada vista
export interface HomeAdditionalSettings {
  // Configuración de cursos
  allowCoursesHome?: boolean;
  showPrivateCourses?: boolean;
  
  // Configuración de secciones
  allowSectionsHome?: boolean;
  selectedSections?: string[];

  textColor?: string;
  
  // Configuración de banner
  enableBanner?: boolean;
  bannerType?: 'image' | 'video';
  bannerImageUrl?: string;
  bannerVideoUrl?: string;
  bannerPosition?: 'top' | 'center' | 'bottom';
  
  // Títulos personalizados multiidioma
  customTitles?: {
    en?: string;
    es?: string;
  };
  
  // Elementos adicionales
  // showWelcomeMessage?: boolean;
  // showQuickActions?: boolean;
  // showRecentActivity?: boolean;
}

export interface VideoCallAdditionalSettings {
  // Títulos personalizados multiidioma
  customTitles?: {
    en?: string;
    es?: string;
  };
  
  // Configuración de enlaces de invitación
  enableInvitationLinks?: boolean; // por defecto true
  invitationLinkExpiration?: number; // en minutos, por defecto 60
  allowGuestAccess?: boolean; // permitir acceso sin registrarse
  
  // Configuración de reservaciones
  enableAllUsersReservations?: boolean; // todos los usuarios pueden crear reservaciones
  requireApprovalForReservations?: boolean; // requiere aprobación para reservaciones
  maxReservationDuration?: number; // duración máxima en minutos
  advanceBookingLimit?: number; // límite de reserva anticipada en días
  
  // Usuarios administradores de video llamadas
  videoCallAdministrators?: string[]; // IDs de usuarios que pueden administrar
  enableAdminNotifications?: boolean; // notificar a admins de nuevas reservaciones
  
  // Configuraciones adicionales de video llamadas
  enableRecording?: boolean;
  enableScreenShare?: boolean;
  enableChat?: boolean;
  maxParticipants?: number;
  autoJoinAudio?: boolean;
  autoJoinVideo?: boolean;
  
  // Configuración de horarios
  allowedTimeSlots?: {
    enabled: boolean;
    slots: Array<{
      day: string; // 'monday', 'tuesday', etc.
      startTime: string; // '09:00'
      endTime: string; // '17:00'
    }>;
  };
}

export interface SectionsAdditionalSettings{
  // Títulos personalizados multiidioma
  customTitles?: {
    en?: string;
    es?: string;
  };
}

// Estructura que se guardará en TenantViewConfig.additionalSettings
export interface ViewAdditionalSettings {
  home?: HomeAdditionalSettings;
  videocalls?: VideoCallAdditionalSettings;
//   metrics?: MetricsAdditionalSettings;
  sections?: SectionsAdditionalSettings;
  frequentlyask?: FAQAdditionalSettings;
}

// Interfaz para una pregunta FAQ individual
export interface FAQItem {
  id: string;
  question: string;
  answer: string; // HTML content
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FAQAdditionalSettings {
  // Títulos personalizados multiidioma
  customTitles?: {
    en?: string;
    es?: string;
  };
  
  // Configuraciones de visualización
  enableSearch?: boolean;
  groupByCategory?: boolean;
  showContactInfo?: boolean;
  allowVoting?: boolean;
  enableComments?: boolean;
  questionsPerPage?: number;
  showQuestionNumbers?: boolean;
  
  // Lista de preguntas FAQ
  faqItems?: FAQItem[];
  
  // Configuraciones de edición
  allowPublicSubmissions?: boolean;
  requireApprovalForSubmissions?: boolean;
  showAuthor?: boolean;
  enableEmailNotifications?: boolean;
}