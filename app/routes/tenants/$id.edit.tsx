// app/routes/tenants/$id.edit.tsx

import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Building2, Globe, User, MapPin, Palette, Trash2, ImageIcon } from 'lucide-react';
import { 
  Tenant,
  TenantPlan, 
  TenantFormData, 
  UpdateTenantRequest,
  TENANT_FEATURES,
  SubscriptionStatus,
  TenantErrorResponse,
  LoginMethod
} from '~/api/types/tenant.types';
import Input from '~/components/ui/Input';
import Checkbox from '~/components/ui/Checkbox';
import { validateTenantFormData } from '~/utils/tenantValidation';
import { TenantsAPI } from '~/api/endpoints/tenants';
import NavbarCustomizer from '~/components/tenant/NavbarCustomizer';
import { 
    HomeViewCustomizer,
    VideoCallViewCustomizer,
    MetricsViewCustomizer,
    GroupsViewCustomizer,
    SectionsViewCustomizer,
    FAQViewCustomizer, 
    ViewSettings,
    RegistrationViewCustomizer,
    NotificationViewCustomizer
} from '~/components/tenant/viewCustomizers';
import { LoginRegisterCustomizer } from '~/components/tenant/viewCustomizers/LoginRegisterViewCustomizer';

interface LoaderData {
  tenant: Tenant | null;
  error: string | null;
}

interface ActionData {
  errors?: Record<string, string>;
  generalError?: string;
  success?: boolean;
}


function isTenantErrorResponse(result: Tenant | TenantErrorResponse): result is TenantErrorResponse {
  return 'error' in result && 'message' in result;
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const tenantId = params.id as string;
    
    if (!tenantId) {
      throw new Error('ID de tenant no proporcionado');
    }
    
    const result = await TenantsAPI.getById(tenantId);

    if (isTenantErrorResponse(result)) {
      return json<LoaderData>({ 
        tenant: null, 
        error: result.message 
      });
    }

    return json<LoaderData>({ 
      tenant: result, 
      error: null 
    });
  } catch (error: any) {
    console.error('Error loading cliente for edit:', error);
    return json<LoaderData>({ 
      tenant: null, 
      error: error.message || 'Error al cargar el cliente'
    });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const tenantId = params.id as string;

  const validation = validateTenantFormData(formData);
  
  if (!validation.isValid) {
    const errorObject: Record<string, string> = {};
    validation.errors.forEach(error => {
      errorObject[error.field] = error.message;
    });
    
    return json<ActionData>({ 
      errors: errorObject 
    }, { status: 400 });
  }

  try {
    const updateData: UpdateTenantRequest = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      domain: formData.get('domain') as string,
      contactEmail: formData.get('contactEmail') as string,
      plan: formData.get('plan') as TenantPlan,
      maxUsers: Number(formData.get('maxUsers')),
      storageLimit: Number(formData.get('storageLimit')),
      billingEmail: formData.get('billingEmail') as string || undefined,
      expiresAt: formData.get('expiresAt') as string || undefined,
      // features: formData.getAll('features') as string[],
      isActive: formData.get('isActive') === 'on',
      
      // Información de contacto
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      // postalCode: formData.get('postalCode') as string,
      url_portal: formData.get('url_portal') as string,
      nit: formData.get('nit') as string,
      
      // Configuración
      primaryColor: formData.get('primaryColor') as string || '#0052cc',
      secondaryColor: formData.get('secondaryColor') as string || '#ffffff',
      timezone: formData.get('timezone') as string || 'America/Bogota',
      language: formData.get('language') as string || 'es',
      // currency: formData.get('currency') as string || 'USD',

      // Navbar
      backgroundColorNavbar: formData.get('backgroundColorNavbar') as string || '#0052cc',
      textColorNavbar: formData.get('textColorNavbar') as string || '#ffffff',
      logoNavbar: formData.get('logoNavbar') as string || 'K&LM',
      showNotifications: formData.get('showNotifications') === 'on',
      showProfile: formData.get('showProfile') === 'on',

      // Configuraciones de vistas
      loginRegisterSettings: {
        type: 'login',
        customBackground: formData.get('loginRegisterCustomBackground') === 'true',
        backgroundType: formData.get('loginRegisterBackgroundType') as 'image' | 'color' || 'color',
        backgroundImage: formData.get('loginRegisterBackgroundImage') as string || '',
        backgroundColor: formData.get('loginRegisterBackgroundColor') as string || '#eff4ff',
        additionalSettings: JSON.parse(formData.get('loginRegisterAdditionalSettings') as string || '{}')
      },
      homeSettings: {
        type: 'home',
        customBackground: formData.get('homeCustomBackground') === 'true',
        backgroundType: formData.get('homeBackgroundType') as 'image' | 'color' || 'color',
        backgroundImage: formData.get('homeBackgroundImage') as string || '',
        backgroundColor: formData.get('homeBackgroundColor') as string || '#eff4ff',
      },
      videoCallSettings: {
        type: 'videocalls',
        customBackground: formData.get('videoCallCustomBackground') === 'true',
        backgroundType: formData.get('videoCallBackgroundType') as 'image' | 'color' || 'color',
        backgroundImage: formData.get('videoCallBackgroundImage') as string || '',
        backgroundColor: formData.get('videoCallBackgroundColor') as string || '#eff4ff',
      },
      metricsSettings: {
        type: 'metrics',
        customBackground: formData.get('metricsCustomBackground') === 'true',
        backgroundType: formData.get('metricsBackgroundType') as 'image' | 'color' || 'color',
        backgroundImage: formData.get('metricsBackgroundImage') as string || '',
        backgroundColor: formData.get('metricsBackgroundColor') as string || '#eff4ff',
        additionalSettings: JSON.parse(formData.get('metricsAdditionalSettings') as string || '{}')
      },
      groupsSettings:{
        type: 'courses',
        customBackground: formData.get('groupsCustomBackground') === 'true',
        backgroundType: formData.get('groupsBackgroundType') as 'image' | 'color' || 'color',
        backgroundImage: formData.get('groupsBackgroundImage') as string || '',
        backgroundColor: formData.get('groupsBackgroundColor') as string || '#eff4ff',
        additionalSettings: JSON.parse(formData.get('groupsAdditionalSettings') as string || '{}')
      },
      sectionsSettings: {
        type: 'sections',
        customBackground: formData.get('sectionsCustomBackground') === 'true',
        backgroundType: formData.get('sectionsBackgroundType') as 'image' | 'color' || 'color',
        backgroundImage: formData.get('sectionsBackgroundImage') as string || '',
        backgroundColor: formData.get('sectionsBackgroundColor') as string || '#eff4ff',
      },
      faqSettings: {
        type: 'frequentlyask',
        customBackground: formData.get('faqCustomBackground') === 'true',
        backgroundType: formData.get('faqBackgroundType') as 'image' | 'color' || 'color',
        backgroundImage: formData.get('faqBackgroundImage') as string || '',
        backgroundColor: formData.get('faqBackgroundColor') as string || '#eff4ff',
      }
    };

    console.log('Update Data:', updateData);
    const result = await TenantsAPI.update(tenantId, updateData);
    
    if (isTenantErrorResponse(result)) {
      const errorMessage = getSpecificErrorMessage(result);
      const fieldErrors = getFieldErrors(result);
      
      return json<ActionData>({ 
        success: false,
        generalError: errorMessage,
        errors: fieldErrors
      });
    }
    
    return json<ActionData>({ 
      success: true
    });
    
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    
    return json<ActionData>({ 
      generalError: 'Error inesperado al actualizar el cliente'
    }, { status: 500 });
  }
};

function getSpecificErrorMessage(error: TenantErrorResponse): string {
  switch (error.error) {
    case 'SLUG_ALREADY_EXISTS':
      return `El identificador "${error.value}" ya está en uso. Elige otro identificador.`;
    case 'DOMAIN_ALREADY_EXISTS':
      return `El dominio "${error.value}" ya está en uso. Elige otro dominio.`;
    case 'RESERVED_SLUG':
      return `El identificador "${error.value}" contiene palabras reservadas. Elige otro identificador.`;
    case 'INVALID_DOMAIN':
      return `El dominio "${error.value}" no es válido para el entorno actual.`;
    case 'DATABASE_ERROR':
      return 'Error al guardar en la base de datos. Intenta nuevamente.';
    default:
      return error.message || 'Error al actualizar el cliente';
  }
}

function getFieldErrors(error: TenantErrorResponse): Record<string, string> {
  if (!error.field) {
    return {
      general: getSpecificErrorMessage(error)
    };
  }
  
  return {
    [error.field]: getSpecificErrorMessage(error)
  };
}

export default function EditTenant() {
  const { tenant, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [previewFavicon, setPreviewFavicon] = useState(tenant?.config?.favicon || '');
  const [previewLogo, setPreviewLogo] = useState(tenant?.config?.logoPath || '');
  const [previewLoginBg, setPreviewLoginBg] = useState(tenant?.config?.loginBackgroundPath || '');
  const [previewIcon, setPreviewIcon] = useState(tenant?.config?.iconPath || '');
  const [previewLoginLogo, setPreviewLoginLogo] = useState(tenant?.config?.loginBackgroundPath || '');

  const [activeTab, setActiveTab] = useState('home');
  const [formData, setFormData] = useState<Partial<TenantFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  // Estado separado para cada vista
  const [homeSettings, setHomeSettings] = useState<ViewSettings>({
    type: 'home',
    customBackground: tenant?.homeSettings?.customBackground,
    backgroundType: tenant?.homeSettings?.backgroundType ?? 'color',
    backgroundImage: tenant?.homeSettings?.backgroundImage ?? '',
    backgroundColor: tenant?.homeSettings?.backgroundColor ?? '#eff4ff',
    additionalSettings: {
      allowCoursesHome: tenant?.homeSettings?.additionalSettings?.allowCoursesHome ?? false,
      showPrivateCourses: false,
      allowSectionsHome: false,
      selectedSections: [],
      textColor: '#000000',
      enableBanner: false,
      bannerType: 'image',
      bannerImageUrl: '',
      bannerVideoUrl: '',
      bannerPosition: 'top',
      customTitles: {
        en: 'Home',
        es: 'Inicio'
      },
    }
  });
  
  const [videoCallSettings, setVideoCallSettings] = useState<ViewSettings>({
    type: 'videocalls',
    customBackground: false,
    backgroundType: 'color',
    backgroundImage: '',
    backgroundColor: '#eff4ff',
    additionalSettings: {
      customTitles: {
        en: 'Video Calls',
        es: 'Video Llamadas'
      },
      enableInvitationLinks: true, // por defecto true como solicitaste
      invitationLinkExpiration: 60,
      allowGuestAccess: false,
      enableAllUsersReservations: false,
      requireApprovalForReservations: false,
      maxReservationDuration: 120,
      advanceBookingLimit: 30,
      videoCallAdministrators: [],
      enableAdminNotifications: true,
      enableRecording: false,
      enableScreenShare: true,
      enableChat: true,
      maxParticipants: 10,
      autoJoinAudio: false,
      autoJoinVideo: false,
      allowedTimeSlots: {
        enabled: false,
        slots: []
      }
    }
  });
  
  const [metricsSettings, setMetricsSettings] = useState<ViewSettings>({
    type: 'metrics',
    customBackground: false,
    backgroundType: 'color',
    backgroundImage: '',
    backgroundColor: '#eff4ff',
  });

  const [groupsSettings, setGroupsSettings] = useState<ViewSettings>({
    type: 'courses',
    customBackground: false,
    backgroundType: 'color',
    backgroundImage: '',
    backgroundColor: '#eff4ff',
    additionalSettings: {
      customTitles: {
        en: 'Groups',
        es: 'Grupos'
      },
    }
  });

  const [sectionsSettings, setSectionsSettings] = useState<ViewSettings>({
    type: 'sections',
    customBackground: false,
    backgroundType: 'color',
    backgroundImage: '',
    backgroundColor: '#eff4ff',
    additionalSettings: {
      customTitles: {
        en: 'Sections',
        es: 'Secciones'
      },
    }
  });

  const [faqSettings, setFaqSettings] = useState<ViewSettings>({
    type: 'frequentlyask',
    customBackground: false,
    backgroundType: 'color',
    backgroundImage: '',
    backgroundColor: '#eff4ff',
    additionalSettings: {
      customTitles: {
        en: 'Frequently Asked Questions',
        es: 'Preguntas Frecuentes'
      },
      enableSearch: true,
      groupByCategory: false,
      showContactInfo: true,
      allowVoting: false,
      enableComments: false,
      questionsPerPage: 10,
      showQuestionNumbers: true,
      faqItems: [], // Array vacío para empezar
      allowPublicSubmissions: false,
      requireApprovalForSubmissions: true,
      showAuthor: false,
      enableEmailNotifications: true
    }
  });

  const [loginRegisterSettings, setLoginRegisterSettings] = useState<ViewSettings>({
    type: 'login',
    customBackground: false,
    backgroundType: 'color',
    backgroundImage: '',
    backgroundColor: '#eff4ff',
    additionalSettings: {
      customTitles: {
        en: 'Login and Registration',
        es: 'Login y Registro'
      },
      showSocialLoginButtons: true,
      socialLoginProviders: {
        google: false,
        facebook: false
      },
    }
  });

  const isSubmitting = navigation.state === 'submitting';

  // Handlers para las vistas
  const handleHomeChange = (field: string, value: string | boolean | File) => {
    setHomeSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleVideoCallChange = (field: string, value: string | boolean | File) => {
    setVideoCallSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleMetricsChange = (field: string, value: string | boolean | File) => {
    setMetricsSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleGroupsChange = (field: string, value: string | boolean | File) => {
    setGroupsSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSectionsChange = (field: string, value: string | boolean | File) => {
    setSectionsSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFaqChange = (field: string, value: string | boolean | File) => {
    setFaqSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLoginRegisterChange = (field: string, value: string | boolean | File | any) => {
    if (field === 'additionalSettings') {
      setLoginRegisterSettings(prev => ({
        ...prev,
        additionalSettings: { ...prev.additionalSettings, ...value }
      }));
    } else {
      setLoginRegisterSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      component: HomeViewCustomizer, 
      handler: handleHomeChange,
      settings: homeSettings,
      // IMPORTANTE: Pasa homeSettings como prop adicional
      extraProps: {
        homeSettings: homeSettings,  // Esto es clave
        availableSections: []  // Si tienes secciones disponibles, pásalas aquí
      }
    },
    { 
      id: 'videoCall', 
      label: 'Video Llamadas', 
      component: VideoCallViewCustomizer, 
      handler: handleVideoCallChange,
      settings: videoCallSettings 
    },
    { 
      id: 'metrics', 
      label: 'Métricas', 
      component: MetricsViewCustomizer, 
      handler: handleMetricsChange,
      settings: metricsSettings 
    },
    { 
      id: 'groups', 
      label: 'Grupos', 
      component: GroupsViewCustomizer, 
      handler: handleGroupsChange,
      settings: groupsSettings 
    },
    { 
      id: 'sections', 
      label: 'Secciones', 
      component: SectionsViewCustomizer, 
      handler: handleSectionsChange,
      settings: sectionsSettings 
    },
    { 
      id: 'faq', 
      label: 'Preguntas Frecuentes', 
      component: FAQViewCustomizer, 
      handler: handleFaqChange,
      settings: faqSettings 
    },
    {
      id: 'login', 
      label: 'Login y Registro', 
      component: LoginRegisterCustomizer, 
      handler: handleLoginRegisterChange,
      settings: loginRegisterSettings,
      // Props adicionales específicos para LoginRegister
      extraProps: {
        loginRegisterSettings: loginRegisterSettings
      }
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab?.component;

  console.log("currentTab", currentTab);

  const [configActiveTab, setConfigActiveTab] = useState('registration');

  const [registrationSettings, setRegistrationSettings] = useState({
    allowSelfRegistration: true,
    allowGoogleLogin: false,
    allowFacebookLogin: false,
    loginMethod: LoginMethod.EMAIL,
    allowValidationStatusUsers: true,
    requireLastName: true,
    requirePhone: true,
    requireDocumentType: true,
    requireDocument: true,
    requireOrganization: false,
    requirePosition: false,
    requireGender: false,
    requireCity: false,
    requireAddress: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true
  });

  // Cargar datos del tenant en el formulario
  useEffect(() => {
    if (tenant) {
      const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };

      const homeConfig = tenant.viewConfigs?.find(view => view.viewType === 'home');

      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        domain: tenant.domain || '',
        contactEmail: tenant.contactEmail || '',
        maxUsers: tenant.config?.maxUsers?.toString() || '',
        storageLimit: tenant.config?.storageLimit?.toString() || '',
        billingEmail: tenant.billingEmail || '',
        expiresAt: formatDate(tenant.expiresAt),
        status: tenant.config?.status,
        loginMethod: tenant?.config?.loginMethod,
        // features: tenant.features || [],
        
        contactPerson: tenant.contactInfo?.contactPerson || '',
        phone: tenant.contactInfo?.phone || '',
        address: tenant.contactInfo?.address || '',
        city: tenant.contactInfo?.city || '',
        country: tenant.contactInfo?.country || '',
        // postalCode: tenant.contactInfo?.postalCode || '',
        url_portal: tenant.contactInfo?.url_portal || '',
        nit: tenant.contactInfo?.nit || '',

        faviconPath: tenant.config?.favicon,

        logoPath: tenant.config?.logoPath,
        
        primaryColor: tenant.config?.primaryColor || '#0052cc',
        secondaryColor: tenant.config?.secondaryColor || '#ffffff',
        timezone: tenant.config?.timezone || 'America/Bogota',
        language: tenant.config?.language || 'es',
        // currency: tenant.config?.currency || 'USD',

        // Navbar
        backgroundColorNavbar: tenant.componentConfigs?.[0]?.backgroundColor || tenant.config?.primaryColor || '#484848',
        textColorNavbar: tenant.componentConfigs?.[0].textColor || '#ffffff',
        logoNavbar: tenant.config?.logoPath || 'K&LM',
        // showNotifications: tenant.config?.showNotifications || true,
        // showProfile: tenant.config?.showProfile || true,
      });

      // Cargar configuraciones de vistas específicas
      if (tenant.viewConfigs && tenant.viewConfigs.length > 0) {
        // Buscar cada tipo de vista específica
        const homeView = tenant.viewConfigs.find(view => view.viewType === 'home');

        console.log("🔍 homeView completo:", homeView);
      console.log("🔍 homeView.additionalSettings:", homeView?.additionalSettings);
  
        if(homeView){
          setHomeSettings({
            type: 'home',
            customBackground: homeView.allowBackground ?? false,
            backgroundType: (homeView.backgroundType as 'image' | 'color') || 'color',
            backgroundImage: homeView.backgroundImagePath || '',
            backgroundColor: homeView.backgroundColor || '#eff4ff',
            additionalSettings: {
              allowCoursesHome: homeView.additionalSettings?.allowCoursesHome ?? false,
              showPrivateCourses: homeView.additionalSettings?.showPrivateCourses ?? false,
              allowSectionsHome: homeView.additionalSettings?.allowSectionsHome ?? false,
              selectedSections: homeView.additionalSettings?.selectedSections || [],
              textColor: homeView.additionalSettings?.textColor || '#000000',
              enableBanner: homeView.additionalSettings?.enableBanner ?? false,
              bannerType: homeView.additionalSettings?.bannerType || 'image',
              bannerImageUrl: homeView.additionalSettings?.bannerImageUrl || '',
              bannerVideoUrl: homeView.additionalSettings?.bannerVideoUrl || '',
              bannerPosition: homeView.additionalSettings?.bannerPosition || 'top',
              customTitles: {
                en: homeView.additionalSettings?.customTitles?.en || 'Home',
                es: homeView.additionalSettings?.customTitles?.es || 'Inicio'
              },
              showWelcomeMessage: homeView.additionalSettings?.showWelcomeMessage ?? true,
              showQuickActions: homeView.additionalSettings?.showQuickActions ?? true,
              showRecentActivity: homeView.additionalSettings?.showRecentActivity ?? true,
            }
          });

          console.log("✅ homeSettings después de setear:", {
            type: 'home',
            customBackground: homeView.allowBackground ?? false,
            additionalSettings: homeView.additionalSettings
          });
        }

        const videoCallView = tenant.viewConfigs.find(view => view.viewType === 'videoCall');
        const metricsView = tenant.viewConfigs.find(view => view.viewType === 'metrics');
        const groupsView = tenant.viewConfigs.find(view => view.viewType === 'groups');
        const sectionsView = tenant.viewConfigs.find(view => view.viewType === 'sections');
        const faqView = tenant.viewConfigs.find(view => view.viewType === 'faq');
        const loginRegisterView = tenant.viewConfigs.find(view => view.viewType === 'login');

        console.log("Config view",loginRegisterView);

        if (loginRegisterView) {
          setLoginRegisterSettings({
            type: 'login',
            customBackground: loginRegisterView.allowBackground || false,
            backgroundType: (loginRegisterView.backgroundType as 'image' | 'color') || 'color',
            backgroundImage: loginRegisterView.backgroundImagePath || '',
            backgroundColor: loginRegisterView.backgroundColor || '#eff4ff',
            additionalSettings: {
              customTitles: {
                en: loginRegisterView.title || 'Login and Registration',
                es: loginRegisterView.title || 'Login y Registro'
              },
              ...(loginRegisterView.additionalSettings || {}),
            }
          });
        }

        // if (homeView) {
        //   setHomeSettings({
        //     title: homeView.title,
        //     description: homeView.description,
        //     allowBackground: homeView.allowBackground,
        //     backgroundType: homeView.backgroundType,
        //     backgroundImagePath: homeView.backgroundImagePath,
        //     backgroundColor: homeView.backgroundColor,
        //     welcomeTitle: homeView.welcomeTitle,
        //     welcomeMessage: homeView.welcomeMessage,
        //     // welcomeContentType: homeView.welcomeContentType,
        //     introVideoUrl: homeView.introVideoUrl,
        //     tutorialVideoUrl: homeView.tutorialVideoUrl,
        //     autoplayVideo: homeView.autoplayVideo,
        //     showVideoControls: homeView.showVideoControls,
        //     instructionsText: homeView.instructionsText,
        //     helpText: homeView.helpText,
        //     disclaimerText: homeView.disclaimerText,
        //     helpUrl: homeView.helpUrl,
        //     documentationUrl: homeView.documentationUrl,
        //     supportUrl: homeView.supportUrl,
        //     additionalSettings: homeView.additionalSettings,
        //     isActive: homeView.isActive
        //   });
        // }

        // if (videoCallView) {
        //   setVideoCallSettings({
        //     title: videoCallView.title,
        //     description: videoCallView.description,
        //     allowBackground: videoCallView.allowBackground,
        //     backgroundType: videoCallView.backgroundType,
        //     backgroundImagePath: videoCallView.backgroundImagePath,
        //     backgroundColor: videoCallView.backgroundColor,
        //     additionalSettings: {
        //       customTitles: {
        //         en: 'Video Calls',
        //         es: 'Video Llamadas'
        //       },
        //       enableInvitationLinks: true,
        //       invitationLinkExpiration: 60,
        //       allowGuestAccess: false,
        //       enableAllUsersReservations: false,
        //       requireApprovalForReservations: false,
        //       maxReservationDuration: 120,
        //       advanceBookingLimit: 30,
        //       videoCallAdministrators: [],
        //       enableAdminNotifications: true,
        //       enableRecording: false,
        //       enableScreenShare: true,
        //       enableChat: true,
        //       maxParticipants: 10,
        //       autoJoinAudio: false,
        //       autoJoinVideo: false,
        //       allowedTimeSlots: {
        //         enabled: false,
        //         slots: []
        //       }
        //     }
        //   });
        // }

        // if (metricsView) {
        //   setMetricsSettings({
        //     // mapear propiedades específicas de metrics
        //     title: metricsView.title,
        //     description: metricsView.description,
        //     customBackground: false,
        //     backgroundType: 'color',
        //     backgroundImage: '',
        //     backgroundColor: '#eff4ff',
        //   });
        // }

        // if (groupsView) {
        //   setGroupsSettings({
        //     // mapear propiedades específicas de groups
        //     title: groupsView.title,
        //     description: groupsView.description,
        //     customBackground: false,
        //     backgroundType: 'color',
        //     backgroundImage: '',
        //     backgroundColor: '#eff4ff',
        //     additionalSettings: {
        //       customTitles: {
        //         en: 'Groups',
        //         es: 'Grupos'
        //       },
        //     }
        //   });
        // }

        // if (sectionsView) {
        //   setSectionsSettings({
        //     // mapear propiedades específicas de sections
        //     title: sectionsView.title,
        //     description: sectionsView.description,
        //     customBackground: false,
        //     backgroundType: 'color',
        //     backgroundImage: '',
        //     backgroundColor: '#eff4ff',
        //     additionalSettings: {
        //       customTitles: {
        //         en: 'Sections',
        //         es: 'Secciones'
        //       },
        //     }
        //   });
        // }

        // if (faqView) {
        //   setFaqSettings({
        //     // mapear propiedades específicas de FAQ
        //     title: faqView.title,
        //     description: faqView.description,
        //     customBackground: false,
        //     backgroundType: 'color',
        //     backgroundImage: '',
        //     backgroundColor: '#eff4ff',
        //     additionalSettings: {
        //       customTitles: {
        //         en: 'Frequently Asked Questions',
        //         es: 'Preguntas Frecuentes'
        //       },
        //       enableSearch: true,
        //       groupByCategory: false,
        //       showContactInfo: true,
        //       allowVoting: false,
        //       enableComments: false,
        //       questionsPerPage: 10,
        //       showQuestionNumbers: true,
        //       faqItems: [], // Array vacío para empezar
        //       allowPublicSubmissions: false,
        //       requireApprovalForSubmissions: true,
        //       showAuthor: false,
        //       enableEmailNotifications: true
        //     }
        //   });
        // }

        // // Cargar configuraciones de registro
        if (tenant.config) {
          setRegistrationSettings({
            allowSelfRegistration: tenant.config.allowSelfRegistration ?? true,
            allowGoogleLogin: tenant.config.allowGoogleLogin ?? false,
            allowFacebookLogin: tenant.config.allowFacebookLogin ?? false,
            loginMethod: tenant.config.loginMethod ?? LoginMethod.EMAIL,
            allowValidationStatusUsers: tenant.config.allowValidationStatusUsers ?? true,
            requireLastName: tenant.config.requireLastName ?? true,
            requirePhone: tenant.config.requirePhone ?? true,
            requireDocumentType: tenant.config.requireDocumentType ?? true,
            requireDocument: tenant.config.requireDocument ?? true,
            requireOrganization: tenant.config.requireOrganization ?? false,
            requirePosition: tenant.config.requirePosition ?? false,
            requireGender: tenant.config.requireGender ?? false,
            requireCity: tenant.config.requireCity ?? false,
            requireAddress: tenant.config.requireAddress ?? false
          });

          setNotificationSettings({
            enableEmailNotifications: tenant.config.enableEmailNotifications ?? true
          });
        }
      }
    }
  }, [tenant]);

  useEffect(() => {
    if (actionData?.success) {
      navigate(`/tenants/${tenant?.id}`);
    }
  }, [actionData, navigate, tenant?.id]);

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-200/50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Cliente no encontrado'}</p>
          <button
            onClick={() => navigate('/tenants')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const allErrors = {
    ...clientErrors,
    ...(actionData?.errors || {})
  };

  const getErrorByField = (field: string): string | null => {
    const error = allErrors[field];
    return error && error.trim() !== '' ? error : null;
  };

  const handleChange = (field: keyof TenantFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    if (allErrors[field]) {
      setClientErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (field: string, file: File | null, setPreview: (value: string) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(field, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegistrationChange = (field: string, value: any) => {
    setRegistrationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const configTabs = [
    { 
      id: 'registration', 
      label: 'Registro', 
      component: RegistrationViewCustomizer, 
      handler: handleRegistrationChange,
      settings: registrationSettings
    },
    { 
      id: 'notifications', 
      label: 'Notificaciones', 
      component: NotificationViewCustomizer, 
      handler: handleNotificationChange,
      settings: notificationSettings
    }
  ];

  const countries = [
    'Colombia', 'España', 'México', 'Argentina', 'Chile', 'Perú', 
    'Estados Unidos', 'Canadá', 'Brasil', 'Uruguay', 'Venezuela'
  ];

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
  ];

  const currencies = [
    { code: 'USD', name: 'USD - Dólar estadounidense' },
    { code: 'EUR', name: 'EUR - Euro' },
    { code: 'COP', name: 'COP - Peso colombiano' },
    { code: 'MXN', name: 'MXN - Peso mexicano' },
    { code: 'ARS', name: 'ARS - Peso argentino' },
  ];

  const currentConfigTab = configTabs.find(tab => tab.id === configActiveTab);
  const CurrentConfigComponent = currentConfigTab?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Editar Cliente
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Modifica la información del cliente "{tenant.name}"
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/tenants`)}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <X className="h-5 w-5" />
                <span className="font-medium">Cancelar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerta de cambios sin guardar */}
        {hasChanges && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <span className="text-yellow-800 font-medium">
                Tienes cambios sin guardar. Asegúrate de guardar antes de salir.
              </span>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {actionData?.generalError && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-r-xl shadow-sm backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{actionData.generalError}</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <Form method="post" className="space-y-8" noValidate>
          {/* Estado del tenant */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Estado del Cliente
              </h2>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              <div className="flex items-center">
                <input
                  id="status"
                  name="status"
                  type="checkbox"
                  defaultChecked={tenant.config?.status}
                  onChange={(e) => handleChange('status', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="status" className="ml-3 text-sm font-medium text-gray-700">
                  Cliente activo y operativo
                </label>
              </div>

              {/* Información de uso */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200/50">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Información de Uso Actual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <span className="text-gray-600">Usuarios actuales:</span>
                    <span className="ml-2 font-bold text-blue-600">{tenant.config?.currentUsers || 0} / {tenant.config?.maxUsers || 0}</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <span className="text-gray-600">Almacenamiento usado:</span>
                    <span className="ml-2 font-bold text-purple-600">{tenant.config?.storageUsed || 0} / {tenant.config?.storageLimit || 0} GB</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <span className="text-gray-600">Creado:</span>
                    <span className="ml-2 font-medium text-gray-900">{new Date(tenant.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                    <span className="text-gray-600">Última actualización:</span>
                    <span className="ml-2 font-medium text-gray-900">{new Date(tenant.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información básica */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Información Básica
                </h2>
              </div>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              {/* Nombre y Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  id="name"
                  name="name"
                  label="Nombre del Cliente"
                  required
                  error={getErrorByField('name')}
                  disabled={isSubmitting}
                  placeholder="Ej: Empresa ABC"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />

                <Input
                  type="text"
                  id="slug"
                  name="slug"
                  label="Slug (identificador único)"
                  required
                  error={getErrorByField('slug')}
                  disabled={true}
                  placeholder="empresa-abc"
                  value={formData.slug || ''}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  helperText="El slug no puede ser modificado después de la creación"
                />
              </div>

              {/* Resto de campos básicos con el mismo patrón... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  id="domain"
                  name="domain"
                  label="Dominio"
                  required
                  error={getErrorByField('domain')}
                  disabled={isSubmitting}
                  placeholder="empresa-abc.klmsystem.test"
                  value={formData.domain || ''}
                  onChange={(e) => handleChange('domain', e.target.value)}
                  helperText="Dominio principal para acceder al cliente"
                />

                <Input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  label="Email de Contacto"
                  required
                  error={getErrorByField('contactEmail')}
                  disabled={isSubmitting}
                  placeholder="admin@empresa-abc.com"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </div>

              {/* Plan y configuración */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                    Plan *
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    required
                    disabled={isSubmitting}
                    value={formData.plan || TenantPlan.FREE}
                    onChange={(e) => handleChange('plan', e.target.value as TenantPlan)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                  >
                    <option value={TenantPlan.FREE}>Free</option>
                    <option value={TenantPlan.STARTER}>Starter</option>
                    <option value={TenantPlan.PRO}>Pro</option>
                    <option value={TenantPlan.ENTERPRISE}>Enterprise</option>
                  </select>
                  {getErrorByField('plan') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorByField('plan')}</p>
                  )}
                </div>

                <Input
                  type="number"
                  id="maxUsers"
                  name="maxUsers"
                  label="Máximo de Usuarios"
                  required
                  min="1"
                  error={getErrorByField('maxUsers')}
                  disabled={isSubmitting}
                  value={formData.maxUsers || ''}
                  onChange={(e) => handleChange('maxUsers', e.target.value)}
                  helperText={`Actuales: ${tenant.config?.currentUsers || 0}`}
                />

                <Input
                  type="number"
                  id="storageLimit"
                  name="storageLimit"
                  label="Límite de Almacenamiento (GB)"
                  required
                  min="1"
                  error={getErrorByField('storageLimit')}
                  disabled={isSubmitting}
                  value={formData.storageLimit || ''}
                  onChange={(e) => handleChange('storageLimit', e.target.value)}
                  helperText={`Usado: ${tenant.config?.storageUsed || 0} GB`}
                />
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="email"
                  id="billingEmail"
                  name="billingEmail"
                  label="Email de Facturación (opcional)"
                  error={getErrorByField('billingEmail')}
                  disabled={isSubmitting}
                  placeholder="billing@empresa-abc.com"
                  value={formData.billingEmail || ''}
                  onChange={(e) => handleChange('billingEmail', e.target.value)}
                />

                <Input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  label="Fecha de Expiración (opcional)"
                  error={getErrorByField('expiresAt')}
                  disabled={isSubmitting}
                  value={formData.expiresAt || ''}
                  onChange={(e) => handleChange('expiresAt', e.target.value)}
                />
              </div> */}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-green-50 to-teal-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Información de Contacto
                </h2>
              </div>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  label="Persona de Contacto"
                  required
                  error={getErrorByField('contactPerson')}
                  disabled={isSubmitting}
                  placeholder="Juan Pérez"
                  value={formData.contactPerson || ''}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                />

                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  label="Teléfono"
                  required
                  error={getErrorByField('phone')}
                  disabled={isSubmitting}
                  placeholder="+57 300 123 4567"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <Input
                type="text"
                id="address"
                name="address"
                label="Dirección"
                required
                error={getErrorByField('address')}
                disabled={isSubmitting}
                placeholder="Calle 123 #45-67"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  id="url_portal"
                  name="url_portal"
                  label="Dirección del Portal"
                  required
                  error={getErrorByField('url_portal')}
                  disabled={isSubmitting}
                  placeholder="https://portal.empresa-abc.com"
                  value={formData.url_portal || ''}
                  onChange={(e) => handleChange('url_portal', e.target.value)}
                />

                <Input
                  type="text"
                  id="nit"
                  name="nit"
                  label="NIT"
                  required
                  error={getErrorByField('nit')}
                  disabled={isSubmitting}
                  placeholder="123456789"
                  value={formData.nit || ''}
                  onChange={(e) => handleChange('nit', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* <Input
                  type="text"
                  id="city"
                  name="city"
                  label="Ciudad"
                  required
                  error={getErrorByField('city')}
                  disabled={isSubmitting}
                  placeholder="Bogotá"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                />

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <select
                    id="country"
                    name="country"
                    required
                    disabled={isSubmitting}
                    value={formData.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                  >
                    <option value="">Seleccionar país</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {getErrorByField('country') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorByField('country')}</p>
                  )}
                </div> */}

                {/* <Input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  label="Código Postal"
                  error={getErrorByField('postalCode')}
                  disabled={isSubmitting}
                  placeholder="11001"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                /> */}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-medium text-gray-900">Configuración de Registro y Notificaciones</h2>
              </div>
            </div>

            {/* Tabs para configuración */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto px-6">
                {configTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setConfigActiveTab(tab.id)}
                    className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      configActiveTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido del tab activo */}
            <div className="p-0">
              {CurrentConfigComponent && currentConfigTab && (
                <CurrentConfigComponent
                  onChange={currentConfigTab.handler}
                  isSubmitting={isSubmitting}
                  errors={allErrors}
                  settings={currentConfigTab.settings}
                />
              )}
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Configuración General
                </h2>
              </div>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  label="Color Primario"
                  error={getErrorByField('primaryColor')}
                  disabled={isSubmitting}
                  value={formData.primaryColor || '#0052cc'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                />

                <Input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  label="Color Secundario"
                  error={getErrorByField('secondaryColor')}
                  disabled={isSubmitting}
                  value={formData.secondaryColor || '#ffffff'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6'>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Favicon (16x16 o 32x32 px)
                  </label>
                  
                  {/* Preview del Favicon */}
                  <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mx-auto">
                    {previewFavicon ? (
                      <img src={previewFavicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Opción Principal: Cargar archivo */}
                  <div className="space-y-2">
                    <label htmlFor="favicon-file" className="block text-sm font-medium text-gray-700">
                      Subir archivo
                    </label>
                    <input
                      id="favicon-file"
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml"
                      onChange={(e) => handleImageUpload('faviconPath', e.target.files?.[0] || null, setPreviewFavicon)}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                      Formatos permitidos: .ico, .png, .svg
                    </p>
                  </div>

                  {/* Separador */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">o</span>
                    </div>
                  </div>

                  {/* Opción Secundaria: URL */}
                  <div className="space-y-2">
                    <Input
                      type="text"
                      label="Ingresar URL del favicon"
                      placeholder="https://ejemplo.com/favicon.ico"
                      value={formData.faviconPath || ''}
                      onChange={(e) => handleChange('faviconPath', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                      Alternativa: ingresa la URL directa de tu favicon
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Logo Principal (Barra de Navegación)
                  </label>
                  
                  {/* Preview del Logo */}
                  <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mx-auto">
                    {previewLogo ? (
                      <img src={previewLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Opción Principal: Cargar archivo */}
                  <div className="space-y-2">
                    <label htmlFor="logo-file" className="block text-sm font-medium text-gray-700">
                      Subir archivo
                    </label>
                    <input
                      id="logo-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('logoPath', e.target.files?.[0] || null, setPreviewLogo)}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                      Formatos permitidos: PNG, JPG, SVG (recomendado: fondo transparente)
                    </p>
                  </div>

                  {/* Separador */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">o</span>
                    </div>
                  </div>

                  {/* Opción Secundaria: URL */}
                  <div className="space-y-2">
                    <Input
                      type="text"
                      label="Ingresar URL del logo"
                      placeholder="https://ejemplo.com/logo.png"
                      value={formData.logoPath || ''}
                      onChange={(e) => handleChange('logoPath', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                      Alternativa: ingresa la URL directa de tu logo
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    id="language"
                    name="language"
                    disabled={isSubmitting}
                    value={formData.language || 'es'}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <Input
                  type="text"
                  id="timezone"
                  name="timezone"
                  label="Zona Horaria"
                  disabled={isSubmitting}
                  placeholder="America/Bogota"
                  value={formData.timezone || ''}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Personalizador de Navbar */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Personalizador de barra de navegación
                </h2>
              </div>
            </div>

            <NavbarCustomizer
              backgroundColor={formData.backgroundColorNavbar || '#0052cc'}
              textColor={formData.textColorNavbar || '#ffffff'}
              logo={formData.logoNavbar || 'K&LM'}
              showSearch={formData.showSearch || true}
              showNotifications={formData.showNotifications || true}
              showProfile={formData.showProfile || true}
              onChange={handleChange}
              isSubmitting={isSubmitting}
              errors={allErrors}
            />
          </div>

          {/* Personalizador de Vistas */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Personalizador de Vistas
                </h2>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200/50">
              <div className="flex overflow-x-auto px-6 bg-gradient-to-r from-gray-50 to-blue-50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-white/60 backdrop-blur-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido del tab activo */}
            <div className="p-0">
              {CurrentComponent && currentTab && (
                <CurrentComponent
                  onChange={currentTab.handler}
                  isSubmitting={isSubmitting}
                  errors={allErrors}
                  settings={currentTab.settings}
                  initialCustomBackground={currentTab.settings.customBackground}
                  initialBackgroundType={currentTab.settings.backgroundType}
                  initialBackgroundImage={currentTab.settings.backgroundImage}
                  initialBackgroundColor={currentTab.settings.backgroundColor}
                  {...(currentTab.extraProps || {})}
                />
              )}
            </div>
          </div>

          {/* Campos hidden */}
          <input type="hidden" name="backgroundColorNavbar" value={formData.backgroundColorNavbar} />
          <input type="hidden" name="textColorNavbar" value={formData.textColorNavbar} />
          <input type="hidden" name="logoNavbar" value={formData.logoNavbar} />
          <input type="hidden" name="showNotifications" value={formData.showNotifications ? 'on' : ''} />
          <input type="hidden" name="showProfile" value={formData.showProfile ? 'on' : ''} />
          <input type="hidden" name='slug' value={formData.slug} />

          {/* Campos hidden para configuraciones de vistas */}
          <input type="hidden" name="homeCustomBackground" value={homeSettings.customBackground ? 'true' : 'false'} />
          <input type="hidden" name="homeBackgroundType" value={homeSettings.backgroundType || 'color'} />
          <input type="hidden" name="homeBackgroundImage" value={homeSettings.backgroundImage || ''} />
          <input type="hidden" name="homeBackgroundColor" value={homeSettings.backgroundColor || '#eff4ff'} />

          {/* LoginRegister Settings */}
          <input type="hidden" name="loginRegisterCustomBackground" value={loginRegisterSettings.customBackground ? 'true' : 'false'} />
          <input type="hidden" name="loginRegisterBackgroundType" value={loginRegisterSettings.backgroundType || 'color'} />
          <input type="hidden" name="loginRegisterBackgroundImage" value={loginRegisterSettings.backgroundImage || ''} />
          <input type="hidden" name="loginRegisterBackgroundColor" value={loginRegisterSettings.backgroundColor || '#eff4ff'} />

          <input type="hidden" name="loginRegisterAdditionalSettings" value={JSON.stringify(loginRegisterSettings.additionalSettings)} />

          <input type="hidden" name="videoCallCustomBackground" value={videoCallSettings.customBackground ? 'true' : 'false'} />
          <input type="hidden" name="videoCallBackgroundType" value={videoCallSettings.backgroundType || 'color'} />
          <input type="hidden" name="videoCallBackgroundImage" value={videoCallSettings.backgroundImage || ''} />
          <input type="hidden" name="videoCallBackgroundColor" value={videoCallSettings.backgroundColor || '#eff4ff'} />

          <input type="hidden" name="metricsCustomBackground" value={metricsSettings.customBackground ? 'true' : 'false'} />
          <input type="hidden" name="metricsBackgroundType" value={metricsSettings.backgroundType || 'color'} />
          <input type="hidden" name="metricsBackgroundImage" value={metricsSettings.backgroundImage || ''} />
          <input type="hidden" name="metricsBackgroundColor" value={metricsSettings.backgroundColor || '#eff4ff'} />

          <input type="hidden" name="groupsCustomBackground" value={groupsSettings.customBackground ? 'true' : 'false'} />
          <input type="hidden" name="groupsBackgroundType" value={groupsSettings.backgroundType || 'color'} />
          <input type="hidden" name="groupsBackgroundImage" value={groupsSettings.backgroundImage || ''} />
          <input type="hidden" name="groupsBackgroundColor" value={groupsSettings.backgroundColor || '#eff4ff'} />

          <input type="hidden" name="sectionsCustomBackground" value={sectionsSettings.customBackground ? 'true' : 'false'} />
          <input type="hidden" name="sectionsBackgroundType" value={sectionsSettings.backgroundType || 'color'} />
          <input type="hidden" name="sectionsBackgroundImage" value={sectionsSettings.backgroundImage || ''} />
          <input type="hidden" name="sectionsBackgroundColor" value={sectionsSettings.backgroundColor || '#eff4ff'} />

          <input type="hidden" name="faqCustomBackground" value={faqSettings.customBackground ? 'true' : 'false'} />
          <input type="hidden" name="faqBackgroundType" value={faqSettings.backgroundType || 'color'} />
          <input type="hidden" name="faqBackgroundImage" value={faqSettings.backgroundImage || ''} />
          <input type="hidden" name="faqBackgroundColor" value={faqSettings.backgroundColor || '#eff4ff'} />

          {/* Registration Settings */}
          <input type="hidden" name="allowSelfRegistration" value={registrationSettings.allowSelfRegistration ? 'true' : 'false'} />
          <input type="hidden" name="allowGoogleLogin" value={registrationSettings.allowGoogleLogin ? 'true' : 'false'} />
          <input type="hidden" name="allowFacebookLogin" value={registrationSettings.allowFacebookLogin ? 'true' : 'false'} />
          <input type="hidden" name="loginMethod" value={registrationSettings.loginMethod} />
          <input type="hidden" name="allowValidationStatusUsers" value={registrationSettings.allowValidationStatusUsers ? 'true' : 'false'} />
          
          {/* Campos requeridos en registro */}
          <input type="hidden" name="requireLastName" value={registrationSettings.requireLastName ? 'true' : 'false'} />
          <input type="hidden" name="requirePhone" value={registrationSettings.requirePhone ? 'true' : 'false'} />
          <input type="hidden" name="requireDocumentType" value={registrationSettings.requireDocumentType ? 'true' : 'false'} />
          <input type="hidden" name="requireDocument" value={registrationSettings.requireDocument ? 'true' : 'false'} />
          <input type="hidden" name="requireOrganization" value={registrationSettings.requireOrganization ? 'true' : 'false'} />
          <input type="hidden" name="requirePosition" value={registrationSettings.requirePosition ? 'true' : 'false'} />
          <input type="hidden" name="requireGender" value={registrationSettings.requireGender ? 'true' : 'false'} />
          <input type="hidden" name="requireCity" value={registrationSettings.requireCity ? 'true' : 'false'} />
          <input type="hidden" name="requireAddress" value={registrationSettings.requireAddress ? 'true' : 'false'} />

          {/* Notification Settings */}
          <input type="hidden" name="enableEmailNotifications" value={notificationSettings.enableEmailNotifications ? 'true' : 'false'} />

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4 pt-8">
            <button
              type="button"
              onClick={() => navigate(`/tenants/${tenant.id}`)}
              className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-white/80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 font-medium bg-white/60 backdrop-blur-sm"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}